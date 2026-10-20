import { readFileSync } from "node:fs";
import { buildSchema, parse, validate, print, isObjectType, isInputObjectType } from "graphql";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GraphqlPage from "./Graphql";
import doc from "../generated/graphql-doc";
import schemaSource from "../../../martian_api/src/generated/graphql-schema";
import { graphqlQueryExample } from "../lib/graphqlExamples";

describe("GraphQL ドキュメント", () => {
  it("API とドキュメントの SDL が正本と一致する", () => {
    const source = readFileSync(new URL("../../../martian_api/graphql/schema.graphql", import.meta.url), "utf8");
    expect(doc.source).toBe(source);
    expect(schemaSource).toBe(source);
  });

  it("全公開型・欄・引數・初期値・說明をスキーマから反映する", () => {
    const schema = buildSchema(doc.source);
    expect(doc.types.map((type) => type.name).sort()).toEqual(
      Object.keys(schema.getTypeMap())
        .filter((name) => !name.startsWith("__"))
        .sort(),
    );
    const translations: Record<string, string> = {
      Int: "Int スカラー型は、小數部分を持たない符號附き整數を表します。表現できる値の範圍は -2^31 以上 2^31 - 1 以下です。",
      Boolean: "Boolean スカラー型は、眞（true）又は僞（false）を表します。",
      Float: "Float スカラー型は、IEEE 754 で規定された符號附き倍精度浮動小數點數を表します。",
      String:
        "String スカラー型は、UTF-8 の文字列として表現されるテキストデータを表します。GraphQL では、主に人が讀める自由形式のテキストを表すために使はれます。",
    };
    for (const type of doc.types) {
      const definition = schema.getType(type.name)!;
      expect(type.description).toBe(translations[type.name] ?? definition.description ?? "");
      if (!isObjectType(definition) && !isInputObjectType(definition)) continue;
      expect(type.fields.map((field) => field.name)).toEqual(Object.keys(definition.getFields()));
      for (const field of type.fields) {
        const original = definition.getFields()[field.name];
        expect(field.type).toBe(String(original.type));
        expect(field.description).toBe(original.description ?? "");
        const node = original.astNode;
        expect(field.defaultValue).toBe(
          node && "defaultValue" in node && node.defaultValue ? print(node.defaultValue) : null,
        );
        const args = "args" in original ? original.args : [];
        expect(field.args.map((arg) => arg.name)).toEqual(args.map((arg) => arg.name));
        for (const arg of field.args) {
          const input = args.find((item) => item.name === arg.name)!;
          expect(arg.type).toBe(String(input.type));
          expect(arg.defaultValue).toBe(input.astNode?.defaultValue ? print(input.astNode.defaultValue) : null);
        }
      }
    }
  });

  it("使用例がスキーマに適合する", () => {
    expect(validate(buildSchema(doc.source), parse(graphqlQueryExample))).toEqual([]);
  });

  it("頁を描畫でき、型・Query への全リンク先が存在する", () => {
    const html = renderToStaticMarkup(<GraphqlPage />);
    expect(html).toContain("GraphQL API");
    expect(html).toContain("SDL をコピー");
    expect(html).toContain('download="schema.graphql"');
    expect(html).toContain("&quot;+00:00&quot;");
    const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
    for (const match of html.matchAll(/href="#([^"]+)"/g)) expect(ids.has(match[1]), match[1]).toBe(true);
    for (const type of doc.types) expect(ids.has(`type-${type.name}`)).toBe(true);
    expect(ids.size).toBe([...html.matchAll(/id="([^"]+)"/g)].length);
  });
});
