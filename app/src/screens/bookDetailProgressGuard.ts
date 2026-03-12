export type ProgressToggleGuardFailureReason =
  | 'missing_page_count'
  | 'invalid_page_count'
  | 'missing_current_page'
  | 'invalid_current_page'
  | 'current_exceeds_page_count';

export type ProgressToggleGuardResult =
  | { ok: true }
  | { ok: false; reason: ProgressToggleGuardFailureReason };

export function validateProgressToggleInputs(pageCount: string, currentPage: string): ProgressToggleGuardResult {
  const normalizedPageCount = pageCount.trim();
  if (normalizedPageCount.length === 0) {
    return { ok: false, reason: 'missing_page_count' };
  }

  const parsedPageCount = Number(normalizedPageCount);
  if (!Number.isFinite(parsedPageCount) || parsedPageCount <= 0) {
    return { ok: false, reason: 'invalid_page_count' };
  }

  const normalizedCurrentPage = currentPage.trim();
  if (normalizedCurrentPage.length === 0) {
    return { ok: false, reason: 'missing_current_page' };
  }

  const parsedCurrentPage = Number(normalizedCurrentPage);
  if (!Number.isFinite(parsedCurrentPage) || parsedCurrentPage < 0) {
    return { ok: false, reason: 'invalid_current_page' };
  }

  if (parsedCurrentPage > parsedPageCount) {
    return { ok: false, reason: 'current_exceeds_page_count' };
  }

  return { ok: true };
}
