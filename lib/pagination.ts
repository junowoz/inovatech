export type PageItem = number | "ellipsis";

/**
 * Builds a compact page list with ellipsis so pagination never overflows on
 * mobile, e.g. [1, "ellipsis", 4, 5, 6, "ellipsis", 10].
 */
export function getPageItems(
  current: number,
  total: number,
  siblings = 1
): PageItem[] {
  if (total <= 1) return [1];

  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // first + last + current + 2*siblings + two ellipses
  const maxButtons = siblings * 2 + 5;
  if (total <= maxButtons) return range(1, total);

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, siblings * 2 + 3), "ellipsis", total];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "ellipsis", ...range(total - (siblings * 2 + 2), total)];
  }
  return [1, "ellipsis", ...range(leftSibling, rightSibling), "ellipsis", total];
}
