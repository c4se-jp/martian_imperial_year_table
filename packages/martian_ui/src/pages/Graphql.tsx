import { useEffect, useState } from "react";
import graphqlDoc from "../generated/graphql-doc";
import type { GraphqlFieldDoc } from "../lib/graphqlDoc";
import { graphqlCurlExample, graphqlQueryExample, graphqlVariablesExample } from "../lib/graphqlExamples";

function TypeReference({ type }: { type: string }) {
  return (
    <code>
      {type.split(/([_A-Za-z][_0-9A-Za-z]*)/).map((part, index) =>
        /^[_A-Za-z]/.test(part) ? (
          <a key={index} href={`#type-${part}`}>
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </code>
  );
}

function Fields({ fields }: { fields: GraphqlFieldDoc[] }) {
  return (
    <div className="table-container">
      <table className="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>名前</th>
            <th>型</th>
            <th>初期値</th>
            <th>說明</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name}>
              <td>
                <code>{field.name}</code>
              </td>
              <td>
                <TypeReference type={field.type} />
              </td>
              <td>{field.defaultValue === null ? "—" : <code>{field.defaultValue}</code>}</td>
              <td>{field.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GraphqlPage() {
  const [copyStatus, setCopyStatus] = useState("");
  const queryType = graphqlDoc.types.find((type) => type.name === "Query")!;
  const types = graphqlDoc.types.filter((type) => type.name !== "Query");

  useEffect(() => {
    document.title = "GraphQL | 帝國火星曆";
  }, []);

  async function copySchema() {
    try {
      await navigator.clipboard.writeText(graphqlDoc.source);
      setCopyStatus("SDL をコピーしました。");
    } catch {
      setCopyStatus("コピーできませんでした。下の SDL を選擇してコピーしてください。");
    }
  }

  return (
    <section className="section">
      <div className="container api-doc-page graphql-doc-page">
        <div className="box">
          <h1 className="title">GraphQL API</h1>
          <p className="subtitle is-6">同じ瞬間を、グレゴリオ曆・帝國火星曆・各時系で取得します。</p>
          <p>
            スキーマの正本: <code>packages/martian_api/graphql/schema.graphql</code>
          </p>
        </div>
        <div className="columns is-variable is-5">
          <div className="column is-4">
            <div className="box api-doc-sidebar">
              <h2 className="title is-5">目次</h2>
              <aside className="menu">
                <ul className="menu-list">
                  <li>
                    <a href="#setup">接續方法</a>
                  </li>
                  <li>
                    <a href="#examples">使用例</a>
                  </li>
                  <li>
                    <a href="#type-Query">Query</a>
                    <ul>
                      {queryType.fields.map((field) => (
                        <li key={field.name}>
                          <a href={`#query-${field.name}`}>{field.name}</a>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li>
                    <a href="#types">型一覽</a>
                    <ul>
                      {types.map((type) => (
                        <li key={type.name}>
                          <a href={`#type-${type.name}`}>{type.name}</a>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li>
                    <a href="#constraints">制約・エラー</a>
                  </li>
                  <li>
                    <a href="#sdl">SDL 全文</a>
                  </li>
                </ul>
              </aside>
            </div>
          </div>
          <div className="column is-8">
            <section id="setup" className="box api-doc-endpoint">
              <h2 className="title is-4">接續方法</h2>
              <div className="content">
                <p>
                  <code>POST https://martian-imperial-year-table.c4se.jp/graphql</code>
                </p>
                <p>
                  <code>Content-Type: application/json</code> を指定し、<code>query</code> と任意の{" "}
                  <code>variables</code>・<code>operationName</code> を JSON で送ります。
                </p>
                <p>讀み取り專用です。GET、Mutation、Subscription、batch request は提供しません。</p>
              </div>
            </section>
            <section id="examples" className="box api-doc-endpoint">
              <h2 className="title is-4">使用例</h2>
              <h3 className="title is-6">Query</h3>
              <pre>
                <code>{graphqlQueryExample}</code>
              </pre>
              <h3 className="title is-6 mt-4">Variables</h3>
              <pre>
                <code>{JSON.stringify(graphqlVariablesExample, null, 2)}</code>
              </pre>
              <h3 className="title is-6 mt-4">curl</h3>
              <pre>
                <code>{graphqlCurlExample}</code>
              </pre>
            </section>
            <section id="type-Query" className="box api-doc-endpoint">
              <h2 className="title is-4">Query</h2>
              <p className="mb-4">入力から瞬間を指定し、返却型の中で必要な値を選擇してください。</p>
              {queryType.fields.map((field) => (
                <section key={field.name} id={`query-${field.name}`} className="box api-doc-schema-entry">
                  <h3 className="title is-5">
                    <code>{field.name}</code>
                  </h3>
                  {field.description && <p className="mb-3">{field.description}</p>}
                  <p className="mb-3">
                    返却型: <TypeReference type={field.type} />
                  </p>
                  {field.args.length ? <Fields fields={field.args} /> : <p>引數なし</p>}
                </section>
              ))}
            </section>
            <section id="types" className="box">
              <h2 className="title is-4">型一覽</h2>
              <p>
                <code>!</code> は null 不可、<code>[...]</code> は配列です。初期値のある入力は、型が null
                不可でも省略できます。
              </p>
            </section>
            {types.map((type) => (
              <section key={type.name} id={`type-${type.name}`} className="box api-doc-endpoint">
                <h3 className="title is-5">
                  <span className="tag is-link is-light mr-2">{type.kind}</span>
                  {type.name}
                </h3>
                {type.description && <p className="mb-3">{type.description}</p>}
                {type.fields.length > 0 && <Fields fields={type.fields} />}
                {type.fields
                  .filter((field) => field.args.length)
                  .map((field) => (
                    <div key={field.name}>
                      <h4 className="title is-6 mt-4">
                        <code>{field.name}</code> の引數
                      </h4>
                      <Fields fields={field.args} />
                    </div>
                  ))}
              </section>
            ))}
            <section id="constraints" className="box api-doc-endpoint">
              <h2 className="title is-4">制約・エラー</h2>
              <div className="content">
                <ul>
                  <li>計算範圍はグレゴリオ曆 UTC の年0100〜9999です。グレゴリオ曆の出力年もこの範圍に限ります。</li>
                  <li>
                    グレゴリオ曆の小數秒はミリ秒まで。帝國火星曆の millisecond
                    は0のみ、帝國火星通日は整數秒のみです。火星側との往復には丸めが伴ひます。
                  </li>
                  <li>タイムゾーンは固定オフセットです。IANA 名と閏秒は未對應です。</li>
                  <li>
                    ユリウス通日・帝國火星通日の second は0以上86400未滿。地球時はユリウス日、Mars Sol Date は sol
                    單位です。
                  </li>
                  <li>now は一回の實行中で固定し、應答はキャッシュしません。</li>
                  <li>JSON body は16 KiB、文書は2048 token、fragment 展開後の選擇は256個、深さは12までです。</li>
                </ul>
                <p>
                  不正な JSON・文書・變數は HTTP 400、容量超過は413です。實行時エラーは HTTP 200 の場合もあるため、必ず{" "}
                  <code>errors</code> を確認してください。
                </p>
                <p>
                  入力不正の <code>BAD_USER_INPUT</code>、範圍外の <code>OUT_OF_RANGE</code>、内部障害の{" "}
                  <code>INTERNAL_SERVER_ERROR</code> を <code>extensions.code</code> で區別します。構文・型檢證には
                  GraphQL 標準のエラーを使用します。
                </p>
                <p>
                  nullable な變換結果の失敗は、その欄を null にして他の結果を返します。内部例外の詳細は公開しません。
                </p>
              </div>
            </section>
            <section id="sdl" className="box api-doc-endpoint">
              <h2 className="title is-4">SDL 全文</h2>
              <div className="buttons">
                <button type="button" className="button" onClick={copySchema}>
                  SDL をコピー
                </button>
                <a
                  className="button"
                  download="schema.graphql"
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(graphqlDoc.source)}`}
                >
                  SDL をダウンロード
                </a>
              </div>
              <p role="status" className="mb-3">
                {copyStatus}
              </p>
              <pre>
                <code>{graphqlDoc.source}</code>
              </pre>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
