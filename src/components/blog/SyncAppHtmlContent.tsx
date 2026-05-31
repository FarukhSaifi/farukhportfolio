import { CodeBlock, HeadingLink, InlineCode, List, ListItem, Media, SmartLink, Text } from "@once-ui-system/core";
import parse, { DOMNode, domToReact, Element, HTMLReactParserOptions } from "html-react-parser";
import { ReactNode } from "react";
import { slugify as transliterate } from "transliteration";

function slugify(str: string): string {
  const strWithAnd = str.replace(/&/g, " and ");
  return transliterate(strWithAnd, {
    lowercase: true,
    separator: "-",
  }).replace(/\-\-+/g, "-");
}

function getPlainText(nodes: DOMNode[]): string {
  return nodes
    .map((node) => {
      if ("data" in node && typeof node.data === "string") return node.data;
      if (node instanceof Element) return getPlainText(node.children as DOMNode[]);
      return "";
    })
    .join("");
}

function createHtmlLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <>{children}</>;

  if (href.startsWith("/")) {
    return <SmartLink href={href}>{children}</SmartLink>;
  }

  if (href.startsWith("#")) {
    return <a href={href}>{children}</a>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function createHtmlParserOptions(): HTMLReactParserOptions {
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (!(domNode instanceof Element)) return;

      const childNodes = domNode.children as DOMNode[];

      if (domNode.name === "pre") {
        const codeEl = childNodes.find((node): node is Element => node instanceof Element && node.name === "code");
        if (codeEl) {
          const className = codeEl.attribs?.class || "";
          const language = className.replace(/^language-/, "") || "text";
          const code = getPlainText(codeEl.children as DOMNode[]);
          const label = language.charAt(0).toUpperCase() + language.slice(1);

          return <CodeBlock marginTop="8" marginBottom="16" codes={[{ code, language, label }]} copyButton />;
        }
      }

      const children = domToReact(childNodes, options);

      switch (domNode.name) {
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6": {
          const headingText = getPlainText(childNodes);
          return (
            <HeadingLink marginTop="24" marginBottom="12" as={domNode.name} id={slugify(headingText)}>
              {children}
            </HeadingLink>
          );
        }
        case "p":
          return (
            <Text
              style={{ lineHeight: "175%" }}
              variant="body-default-m"
              onBackground="neutral-medium"
              marginTop="8"
              marginBottom="12"
            >
              {children}
            </Text>
          );
        case "code":
          if (domNode.parent instanceof Element && domNode.parent.name === "pre") return;
          return <InlineCode>{children}</InlineCode>;
        case "ul":
          return <List as="ul">{children}</List>;
        case "ol":
          return <List as="ol">{children}</List>;
        case "li":
          return (
            <ListItem marginTop="4" marginBottom="8" style={{ lineHeight: "175%" }}>
              {children}
            </ListItem>
          );
        case "a":
          return createHtmlLink({ href: domNode.attribs?.href, children });
        case "img": {
          const src = domNode.attribs?.src;
          if (!src) return null;
          return (
            <Media
              marginTop="8"
              marginBottom="16"
              enlarge
              radius="m"
              border="neutral-alpha-medium"
              sizes="(max-width: 960px) 100vw, 960px"
              alt={domNode.attribs?.alt || "Image"}
              src={src}
            />
          );
        }
        default:
          return;
      }
    },
  };

  return options;
}

export function SyncAppHtmlContent({ html }: { html: string }) {
  return <>{parse(html, createHtmlParserOptions())}</>;
}
