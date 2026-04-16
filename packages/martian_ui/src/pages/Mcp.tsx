import { useEffect } from "react";
import mcpDoc from "../generated/mcp-doc";

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export default function McpPage() {
  useEffect(() => {
    document.title = "MCP | 帝國火星曆";
  }, []);

  return (
    <section className="section">
      <div className="container api-doc-page">
        <div className="box">
          <h1 className="title">{mcpDoc.server.title}</h1>
          <p className="subtitle is-6">{mcpDoc.server.description}</p>
          <div className="content mb-0">
            <p>
              <strong>Server Name:</strong> <code>{mcpDoc.server.name}</code>
            </p>
            <p>
              <strong>Version:</strong> <code>{mcpDoc.server.version}</code>
            </p>
            <p>
              <strong>Source:</strong> <code>{mcpDoc.sourcePath}</code>
            </p>
          </div>
        </div>

        <div className="columns is-variable is-5">
          <div className="column is-4">
            <div className="box api-doc-sidebar">
              <h2 className="title is-5">目次</h2>
              <aside className="menu">
                <ul className="menu-list">
                  <li>
                    <a href="#setup">設定方法</a>
                  </li>
                  <li>
                    <a href="#resources">Resources</a>
                  </li>
                  <li>
                    <a href="#tools">Tools</a>
                  </li>
                </ul>
              </aside>
            </div>
          </div>

          <div className="column is-8">
            <section id="setup" className="box api-doc-endpoint">
              <h2 className="title is-4">設定方法</h2>
              <div className="content">
                <p>MCP client には、次の URL を server の接續先として設定してください。</p>
                <pre>
                  <code>https://martian-imperial-year-table.c4se.jp/mcp/</code>
                </pre>
              </div>
            </section>

            <section id="resources" className="box">
              <h2 className="title is-4">Resources</h2>
              <div className="api-doc-schema-list">
                {mcpDoc.resources.map((resource) => (
                  <section key={resource.id} className="box api-doc-schema-entry">
                    <h3 className="title is-5">{resource.title}</h3>
                    <div className="content">
                      <p>{resource.description}</p>
                      <p>
                        <strong>URI:</strong> <code>{resource.uri}</code>
                      </p>
                      <p>
                        <strong>MIME Type:</strong> <code>{resource.mimeType}</code>
                      </p>
                      {resource.meta.widgetDescription && (
                        <p>
                          <strong>Widget:</strong> {resource.meta.widgetDescription}
                        </p>
                      )}
                      {resource.meta.widgetPrefersBorder !== undefined && (
                        <p>
                          <strong>Prefers Border:</strong> {resource.meta.widgetPrefersBorder ? "true" : "false"}
                        </p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </section>

            <section id="tools" className="box">
              <h2 className="title is-4">Tools</h2>
              <div className="api-doc-summary-list">
                {mcpDoc.tools.map((tool) => (
                  <a key={tool.name} className="api-doc-summary-card" href={`#${tool.name}`}>
                    <span className="tag is-link is-light">{tool.readOnlyHint ? "readOnly" : "tool"}</span>
                    <code>{tool.name}</code>
                    <span>{tool.title}</span>
                  </a>
                ))}
              </div>
            </section>

            {mcpDoc.tools.map((tool) => (
              <section key={tool.name} id={tool.name} className="box api-doc-endpoint">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <span className="tag is-link is-medium">{tool.readOnlyHint ? "readOnly" : "tool"}</span>
                    </div>
                    <div className="level-item">
                      <code>{tool.name}</code>
                    </div>
                  </div>
                </div>

                <h3 className="title is-5">{tool.title}</h3>
                <p className="mb-3">{tool.description}</p>

                <div className="content">
                  <p>{tool.doc.summary}</p>
                  <p>
                    <strong>返り値:</strong> {tool.doc.returns}
                  </p>
                  <p>
                    <strong>mode:</strong> <code>{tool.mode}</code>
                  </p>
                  {tool.meta.resourceUri && (
                    <p>
                      <strong>resourceUri:</strong> <code>{tool.meta.resourceUri}</code>
                    </p>
                  )}
                  {tool.meta.invoking && (
                    <p>
                      <strong>invoking:</strong> {tool.meta.invoking}
                    </p>
                  )}
                  {tool.meta.invoked && (
                    <p>
                      <strong>invoked:</strong> {tool.meta.invoked}
                    </p>
                  )}
                </div>

                <h4 className="title is-6 mt-5">Input</h4>
                <div className="table-container">
                  <table className="table is-fullwidth is-striped is-hoverable">
                    <thead>
                      <tr>
                        <th>名前</th>
                        <th>型</th>
                        <th>說明</th>
                        <th>制約</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tool.inputSchema.map((field) => (
                        <tr key={field.name}>
                          <td>
                            <code>{field.name}</code>
                          </td>
                          <td>{field.type}</td>
                          <td>{field.description ?? ""}</td>
                          <td>
                            {field.pattern && (
                              <div>
                                <code>{field.pattern}</code>
                              </div>
                            )}
                            {field.defaultValue && (
                              <div>
                                default: <code>{field.defaultValue}</code>
                              </div>
                            )}
                            {field.examples && field.examples.length > 0 && (
                              <div>
                                example: <code>{field.examples[0]}</code>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {tool.doc.requestExample !== undefined && (
                  <>
                    <p className="has-text-weight-semibold mt-4 mb-2">入力例</p>
                    <pre>
                      <code>{formatJson(tool.doc.requestExample)}</code>
                    </pre>
                  </>
                )}

                {tool.doc.responseExample !== undefined && (
                  <>
                    <p className="has-text-weight-semibold mt-4 mb-2">返り値の例</p>
                    <pre>
                      <code>{formatJson(tool.doc.responseExample)}</code>
                    </pre>
                  </>
                )}

                {tool.doc.errors.length > 0 && (
                  <>
                    <h4 className="title is-6 mt-5">エラー</h4>
                    <div className="content">
                      <ul>
                        {tool.doc.errors.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
