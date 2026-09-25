import Link from "next/link";
import { pageHref, pageNumbers } from "@/lib/pagination";

type Props = { page: number; size: number; totalPages: number };

export function Pagination({ page, size, totalPages }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pages">
      {page > 1 ? <Link href={pageHref(page - 1, size)}>Previous</Link> : <span className="disabled">Previous</span>}
      {pageNumbers(page, totalPages).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`}>…</span>
        ) : n === page ? (
          <span key={n} className="current" aria-current="page">
            {n}
          </span>
        ) : (
          <Link key={n} href={pageHref(n, size)}>
            {n}
          </Link>
        ),
      )}
      {page < totalPages ? <Link href={pageHref(page + 1, size)}>Next</Link> : <span className="disabled">Next</span>}
    </nav>
  );
}
