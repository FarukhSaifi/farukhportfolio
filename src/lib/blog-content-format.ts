/** True when content appears to be HTML from SyncApp (not Markdown). */
export function isHtmlBlogContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed.startsWith("<")) return false;
  return /^<[a-zA-Z][^>]*>/.test(trimmed);
}
