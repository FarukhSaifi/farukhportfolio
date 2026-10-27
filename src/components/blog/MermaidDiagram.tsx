"use client";

import { MERMAID_CONFIG, MERMAID_MESSAGES } from "@/lib/constants/blog";
import { Column, Text, useTheme } from "@once-ui-system/core";
import { useEffect, useId, useState } from "react";

type MermaidDiagramProps = {
  chart: string;
};

function resolveColorScheme(theme: string | undefined): "dark" | "light" {
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.getAttribute("data-theme");
    if (fromDom === "dark" || fromDom === "light") return fromDom;
  }
  return theme === "dark" ? "dark" : "light";
}

function toChartString(chart: string): string {
  return chart.replace(/^\n+|\n+$/g, "").trim();
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, "");
  const { theme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const definition = toChartString(chart);
    if (!definition) {
      setSvg("");
      setError(null);
      return;
    }

    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import("mermaid")).default;
        const scheme = resolveColorScheme(theme);

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: MERMAID_CONFIG.SECURITY_LEVEL,
          theme: scheme === "dark" ? MERMAID_CONFIG.THEME_DARK : MERMAID_CONFIG.THEME_LIGHT,
        });

        const { svg: rendered } = await mermaid.render(`mermaid-${reactId}`, definition);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg("");
          setError(err instanceof Error ? err.message : MERMAID_MESSAGES.RENDER_FAILED);
        }
      }
    }

    void renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [chart, theme, reactId]);

  if (error) {
    return (
      <Column fillWidth marginTop="8" marginBottom="16" padding="16" gap="8" background="surface" border radius="m">
        <Text variant="label-default-s" onBackground="danger-medium">
          {MERMAID_MESSAGES.RENDER_FAILED}
        </Text>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "0.75rem", opacity: 0.8 }}>
          {toChartString(chart)}
        </pre>
      </Column>
    );
  }

  if (!svg) {
    return (
      <Column fillWidth marginTop="8" marginBottom="16" padding="16">
        <Text variant="body-default-s" onBackground="neutral-weak">
          {MERMAID_MESSAGES.LOADING}
        </Text>
      </Column>
    );
  }

  return (
    <Column fillWidth marginTop="8" marginBottom="16" horizontal="center">
      <div
        style={{ width: "100%", overflowX: "auto", display: "flex", justifyContent: "center" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </Column>
  );
}
