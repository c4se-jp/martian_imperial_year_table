import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Navigation from "./Navigation";

describe("ナビゲーション", () => {
  it.each(["api", "mcp", "graphql"])("%s の文書で開發者向けを選擇中にする", (page) => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={[`/docs/${page}`]}>
        <Navigation themePreference="system" onThemePreferenceChange={() => {}} />
      </MemoryRouter>,
    );
    expect(html).toContain("docs-toggle--active");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('id="docs-navigation"');
    expect(html).toContain("開發者向け");
    for (const path of ["api", "mcp", "graphql"]) expect(html).toContain(`/docs/${path}`);
  });

  it("文書以外では開發者向けを選擇中にしない", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/calendar"]}>
        <Navigation themePreference="system" onThemePreferenceChange={() => {}} />
      </MemoryRouter>,
    );
    expect(html).not.toContain("docs-toggle--active");
  });
});
