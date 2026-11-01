export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function paginationMeta(total, page, limit) {
  return { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}
