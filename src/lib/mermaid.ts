import { MERMAID_LANGUAGE } from "@/lib/constants/blog";

/** True when a fenced code block language should render as a Mermaid diagram. */
export function isMermaidLanguage(language: string): boolean {
  return language.trim().toLowerCase() === MERMAID_LANGUAGE;
}
