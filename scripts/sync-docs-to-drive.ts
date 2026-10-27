// Mirrors docs/ to the Watchtower folder in Google Drive. GitHub is the source of truth (D-031).
//
// For each docs/<path>.md it keeps two files in the matching Drive folder: the .md itself and a
// Google Doc of it with a read-only banner. Files are matched by folder and name, so existing
// Docs are updated in place and keep their links and comments. Files whose source left docs/
// are moved to their section's Retired folder (D-032). Nothing is ever deleted.
//
// Usage: node scripts/sync-docs-to-drive.ts [--dry-run]
// Needs GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN and DRIVE_FOLDER_ID.
// Needs pandoc on the PATH to turn Markdown into HTML, which Drive converts to a Google Doc.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";

const DOCS_DIR = "docs";
const REPO = process.env.GITHUB_REPOSITORY ?? "benjamin-kee/fluffy-orca";
const BRANCH = "main";
const FOLDER = "application/vnd.google-apps.folder";
const GDOC = "application/vnd.google-apps.document";
const RETIRED = "Retired";
// Bump to regenerate every Doc after changing how Docs are built.
const DOC_FORMAT = "1";

const dryRun = process.argv.includes("--dry-run");

type Kind = "md" | "doc";
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parentId: string;
  folderPath: string; // "" for the root folder
  appProperties?: { wtPath?: string; wtKind?: Kind; wtHash?: string };
}

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

let token = "";

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: env("GOOGLE_CLIENT_ID"),
      client_secret: env("GOOGLE_CLIENT_SECRET"),
      refresh_token: env("GOOGLE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google sign-in failed (HTTP ${res.status}): ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function drive(path: string, init: RequestInit = {}, upload = false): Promise<any> {
  const base = upload ? "https://www.googleapis.com/upload/drive/v3" : "https://www.googleapis.com/drive/v3";
  const res = await fetch(base + path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers as Record<string, string>) },
  });
  if (!res.ok) throw new Error(`Drive ${init.method ?? "GET"} ${path} failed (HTTP ${res.status}): ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// Lists everything under the root folder, breadth first.
async function listTree(rootId: string) {
  const folders = new Map<string, string>([["", rootId]]); // folder path -> id
  const files: DriveFile[] = [];
  const queue = [""];
  while (queue.length) {
    const folderPath = queue.shift()!;
    const parentId = folders.get(folderPath)!;
    let pageToken = "";
    do {
      const params = new URLSearchParams({
        q: `'${parentId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, appProperties)",
        pageSize: "1000",
      });
      if (pageToken) params.set("pageToken", pageToken);
      const page = await drive(`/files?${params}`);
      for (const f of page.files as Omit<DriveFile, "parentId" | "folderPath">[]) {
        if (f.mimeType === FOLDER) {
          const childPath = posix.join(folderPath, f.name);
          if (!folders.has(childPath)) {
            folders.set(childPath, f.id);
            queue.push(childPath);
          }
        } else {
          files.push({ ...f, parentId, folderPath });
        }
      }
      pageToken = page.nextPageToken ?? "";
    } while (pageToken);
  }
  return { folders, files };
}

function listMarkdown(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return listMarkdown(join(dir, entry.name), rel);
      return entry.name.endsWith(".md") ? [rel] : [];
    });
}

const githubUrl = (rel: string) => `https://github.com/${REPO}/blob/${BRANCH}/${DOCS_DIR}/${rel}`;

// Builds the Google Doc version: a read-only banner, then the Markdown as HTML.
// Relative links point to GitHub, because the files they name are not Docs.
function buildDocHtml(rel: string, markdown: string): string {
  const banner =
    `> **Read-only copy.** The source is [${DOCS_DIR}/${rel}](${githubUrl(rel)}) in GitHub. ` +
    `Comments are welcome here, but edits must be made in GitHub: this Doc is overwritten on every sync.\n\n`;
  const html = execFileSync("pandoc", ["--from=gfm", "--to=html"], { input: banner + markdown, encoding: "utf8" });
  const dir = posix.dirname(rel);
  return html.replace(/href="(?!https?:|mailto:|#)([^"]+)"/g, (_, target: string) => {
    const [path, hash] = target.split("#");
    const resolved = posix.normalize(posix.join(dir, path));
    if (resolved.startsWith("..")) return `href="https://github.com/${REPO}/blob/${BRANCH}/${resolved.slice(3)}"`;
    return `href="${githubUrl(resolved)}${hash ? `#${hash}` : ""}"`;
  });
}

function multipart(metadata: object, mediaType: string, media: string) {
  const boundary = `watchtower-${createHash("sha1").update(media).digest("hex")}`;
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: ${mediaType}; charset=UTF-8\r\n\r\n${media}\r\n--${boundary}--`;
  return { body, headers: { "Content-Type": `multipart/related; boundary=${boundary}` } };
}

async function main() {
  const rootId = env("DRIVE_FOLDER_ID");
  token = await getAccessToken();
  const { folders, files } = await listTree(rootId);
  const sources = listMarkdown(DOCS_DIR);
  const sourceSet = new Set(sources);
  const claimed = new Set<string>();
  const counts = { created: 0, updated: 0, moved: 0, unchanged: 0, retired: 0 };

  const log = (action: string, what: string) => console.log(`${dryRun ? "[dry run] " : ""}${action}: ${what}`);

  async function ensureFolder(path: string): Promise<string> {
    if (folders.has(path)) return folders.get(path)!;
    const parentId = await ensureFolder(posix.dirname(path) === "." ? "" : posix.dirname(path));
    log("create folder", path);
    const id = dryRun
      ? `dry-run:${path}`
      : (
          await drive("/files?fields=id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: posix.basename(path), mimeType: FOLDER, parents: [parentId] }),
          })
        ).id;
    folders.set(path, id);
    return id;
  }

  const isKind = (f: DriveFile, kind: Kind) => (kind === "doc" ? f.mimeType === GDOC : !f.mimeType.startsWith("application/vnd.google-apps."));

  for (const rel of sources) {
    const markdown = readFileSync(join(DOCS_DIR, rel), "utf8");
    const folderPath = posix.dirname(rel) === "." ? "" : posix.dirname(rel);
    const baseName = posix.basename(rel);

    for (const kind of ["md", "doc"] as Kind[]) {
      const name = kind === "md" ? baseName : baseName.replace(/\.md$/, "");
      const hash = createHash("sha256").update(kind === "doc" ? `${DOC_FORMAT}\n${markdown}` : markdown).digest("hex");
      const appProperties = { wtPath: rel, wtKind: kind, wtHash: hash };
      const label = `${kind === "md" ? posix.join(folderPath, name) : `${posix.join(folderPath, name)} (Google Doc)`}`;

      // 1. Same folder and name. 2. A synced file that moved, e.g. into Retired/. 3. A new file.
      let existing = files.find((f) => !claimed.has(f.id) && f.folderPath === folderPath && f.name === name && isKind(f, kind));
      existing ??= files.find(
        (f) =>
          !claimed.has(f.id) &&
          f.name === name &&
          isKind(f, kind) &&
          f.appProperties?.wtPath !== undefined &&
          !sourceSet.has(f.appProperties.wtPath),
      );
      if (existing) claimed.add(existing.id);

      if (existing && existing.folderPath === folderPath && existing.appProperties?.wtHash === hash && existing.appProperties.wtPath === rel) {
        counts.unchanged++;
        continue;
      }

      const parentId = await ensureFolder(folderPath);
      const media = kind === "doc" ? buildDocHtml(rel, markdown) : markdown;
      const mediaType = kind === "doc" ? "text/html" : "text/markdown";

      if (!existing) {
        log("create", label);
        counts.created++;
        if (dryRun) continue;
        const metadata = { name, parents: [parentId], appProperties, ...(kind === "doc" ? { mimeType: GDOC } : {}) };
        const { body, headers } = multipart(metadata, mediaType, media);
        await drive("/files?uploadType=multipart&fields=id", { method: "POST", headers, body }, true);
        continue;
      }

      const moving = existing.folderPath !== folderPath;
      if (moving) {
        log("move", `${posix.join(existing.folderPath, existing.name)} -> ${label}`);
        counts.moved++;
      } else {
        log("update", label);
        counts.updated++;
      }
      if (dryRun) continue;
      const params = new URLSearchParams({ uploadType: "multipart", fields: "id" });
      if (moving) {
        params.set("addParents", parentId);
        params.set("removeParents", existing.parentId);
      }
      const { body, headers } = multipart({ appProperties }, mediaType, media);
      await drive(`/files/${existing.id}?${params}`, { method: "PATCH", headers, body }, true);
    }
  }

  // Synced files whose source is gone from docs/ move to their section's Retired folder.
  for (const f of files) {
    const wtPath = f.appProperties?.wtPath;
    if (claimed.has(f.id) || !wtPath || sourceSet.has(wtPath)) continue;
    if (f.folderPath.split("/").includes(RETIRED)) continue;
    const section = f.folderPath.split("/")[0];
    const target = section ? `${section}/${RETIRED}` : RETIRED;
    log("retire", `${posix.join(f.folderPath, f.name)} -> ${target}/ (no longer in ${DOCS_DIR}/)`);
    counts.retired++;
    if (dryRun) continue;
    const targetId = await ensureFolder(target);
    const params = new URLSearchParams({ addParents: targetId, removeParents: f.parentId, fields: "id" });
    await drive(`/files/${f.id}?${params}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
  }

  console.log(
    `${dryRun ? "[dry run] " : ""}Done: ${counts.created} created, ${counts.updated} updated, ${counts.moved} moved, ` +
      `${counts.retired} retired, ${counts.unchanged} unchanged.`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
