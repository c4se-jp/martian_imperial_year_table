import { Fragment, useEffect } from "react";
import apiDoc from "../generated/openapi-doc";
import type { ApiEndpointDoc, ApiResponseDoc, ApiSchemaDoc } from "../lib/apiDoc";

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function schemaTypeLabel(schema: ApiSchemaDoc): string {
  const parts = [schema.type];
  if (schema.format) parts.push(schema.format);
  if (schema.ref) parts.push(`ref:${schema.ref}`);
  if (schema.nullable) parts.push("nullable");
  return parts.join(" / ");
}

function schemaConstraints(schema: ApiSchemaDoc): string[] {
  const constraints: string[] = [];
  if (schema.pattern) constraints.push(`pattern: ${schema.pattern}`);
  if (typeof schema.minimum === "number") constraints.push(`min: ${schema.minimum}`);
  if (typeof schema.maximum === "number") constraints.push(`max: ${schema.maximum}`);
  if (schema.enumValues && schema.enumValues.length > 0) {
    constraints.push(`enum: ${schema.enumValues.map((value) => String(value)).join(", ")}`);
  }
  if (schema.additionalProperties === false) constraints.push("additionalProperties: false");
  return constraints;
}

function isCompositeSchema(schema: ApiSchemaDoc): boolean {
  return Boolean(
    (schema.properties && schema.properties.length > 0) ||
    schema.items ||
    (schema.oneOf && schema.oneOf.length > 0) ||
    (schema.anyOf && schema.anyOf.length > 0) ||
    (schema.allOf && schema.allOf.length > 0),
  );
}

function joinUrl(baseUrl: string, endpointPath: string): string {
  return new URL(endpointPath.replace(/^\//, ""), baseUrl).toString();
}

function exampleValueForQuery(schema: ApiSchemaDoc, fallback: string): string {
  if (schema.example !== undefined) return String(schema.example);
  if (schema.defaultValue !== undefined) return String(schema.defaultValue);
  if (schema.enumValues && schema.enumValues.length > 0) return String(schema.enumValues[0]);
  if (schema.type === "string" && schema.pattern?.includes("[+-]")) return "+00:00";
  return fallback;
}

function buildCurlExample(endpoint: ApiEndpointDoc): string {
  const baseUrl = apiDoc.servers[0]?.url ?? "/api/";
  const url = new URL(joinUrl(baseUrl, endpoint.path));

  for (const parameter of endpoint.parameters.filter((item) => item.in === "query")) {
    url.searchParams.set(parameter.name, exampleValueForQuery(parameter.schema, "value"));
  }

  if (endpoint.method === "GET") {
    return `curl "${url.toString()}"`;
  }

  const payload = endpoint.requestBody?.example ?? {};
  return [
    `curl -X ${endpoint.method} "${url.toString()}"`,
    `  -H "Content-Type: ${endpoint.requestBody?.contentType ?? "application/json"}"`,
    `  -d '${formatJson(payload)}'`,
  ].join(" \\\n");
}

function ResponseBlock({ response }: { response: ApiResponseDoc }) {
  return (
    <div className="box api-doc-response">
      <div className="level is-mobile mb-3">
        <div className="level-left">
          <div className="level-item">
            <span className="tag is-medium is-info">{response.status}</span>
          </div>
          {response.contentType && (
            <div className="level-item">
              <code>{response.contentType}</code>
            </div>
          )}
        </div>
      </div>
      {response.description && <p className="mb-3">{response.description}</p>}
      {response.schema && <SchemaBlock schema={response.schema} />}
      {response.example !== undefined && (
        <>
          <p className="has-text-weight-semibold mt-4 mb-2">例</p>
          <pre>
            <code>{formatJson(response.example)}</code>
          </pre>
        </>
      )}
    </div>
  );
}

function SchemaBlock({ schema, title }: { schema: ApiSchemaDoc; title?: string }) {
  const constraints = schemaConstraints(schema);

  return (
    <div className="api-doc-schema">
      <div className="content mb-3">
        {title && <p className="has-text-weight-semibold mb-2">{title}</p>}
        <p className="mb-2">
          <span className="tag is-light">{schemaTypeLabel(schema)}</span>
        </p>
        {schema.description && <p>{schema.description}</p>}
        {constraints.length > 0 && (
          <div className="tags">
            {constraints.map((constraint) => (
              <span key={constraint} className="tag is-warning is-light">
                {constraint}
              </span>
            ))}
          </div>
        )}
      </div>

      {schema.properties && schema.properties.length > 0 && (
        <div className="table-container">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>名前</th>
                <th>型</th>
                <th>必須</th>
                <th>說明</th>
              </tr>
            </thead>
            <tbody>
              {schema.properties.map((property) => (
                <Fragment key={property.name}>
                  <tr>
                    <td>
                      <code>{property.name}</code>
                    </td>
                    <td>{schemaTypeLabel(property.schema)}</td>
                    <td>{property.required ? "required" : ""}</td>
                    <td>{property.description ?? property.schema.description ?? ""}</td>
                  </tr>
                  {isCompositeSchema(property.schema) && (
                    <tr>
                      <td colSpan={4}>
                        <div className="api-doc-nested">
                          <SchemaBlock schema={property.schema} title={`${property.name} の詳細`} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {schema.items && (
        <div className="api-doc-nested">
          <SchemaBlock schema={schema.items} title="配列要素" />
        </div>
      )}

      {schema.oneOf && schema.oneOf.length > 0 && (
        <div className="api-doc-nested-list">
          {schema.oneOf.map((item, index) => (
            <div key={`oneOf-${index}`} className="api-doc-nested">
              <SchemaBlock schema={item} title={`oneOf ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {schema.anyOf && schema.anyOf.length > 0 && (
        <div className="api-doc-nested-list">
          {schema.anyOf.map((item, index) => (
            <div key={`anyOf-${index}`} className="api-doc-nested">
              <SchemaBlock schema={item} title={`anyOf ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {schema.allOf && schema.allOf.length > 0 && (
        <div className="api-doc-nested-list">
          {schema.allOf.map((item, index) => (
            <div key={`allOf-${index}`} className="api-doc-nested">
              <SchemaBlock schema={item} title={`allOf ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {schema.example !== undefined && (
        <>
          <p className="has-text-weight-semibold mt-4 mb-2">例</p>
          <pre>
            <code>{formatJson(schema.example)}</code>
          </pre>
        </>
      )}
    </div>
  );
}

export default function ApiPage() {
  useEffect(() => {
    document.title = "API | 帝國火星曆";
  }, []);

  return (
    <section className="section">
      <div className="container api-doc-page">
        <div className="box api-doc-hero">
          <h1 className="title">{apiDoc.info.title}</h1>
          {apiDoc.info.description && <p className="subtitle is-6">{apiDoc.info.description}</p>}
          <div className="content mb-0">
            <p>
              <strong>Version:</strong> <code>{apiDoc.info.version}</code>
            </p>
            <p>
              <strong>Source:</strong> <code>{apiDoc.sourcePath}</code>
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
                    <a href="#servers">サーバー</a>
                  </li>
                  <li>
                    <a href="#endpoints">エンドポイント</a>
                  </li>
                  <li>
                    <a href="#schemas">Schema</a>
                  </li>
                </ul>
              </aside>
            </div>
          </div>

          <div className="column is-8">
            <section id="servers" className="box">
              <h2 className="title is-4">サーバー</h2>
              <div className="content">
                {apiDoc.servers.map((server) => (
                  <p key={server.url}>
                    <code>{server.url}</code>
                    {server.description && (
                      <span>
                        {" "}
                        {" - "} {server.description}
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </section>

            <section id="endpoints" className="box">
              <h2 className="title is-4">エンドポイント</h2>
              <div className="api-doc-summary-list">
                {apiDoc.endpoints.map((endpoint) => (
                  <a key={endpoint.id} className="api-doc-summary-card" href={`#${endpoint.id}`}>
                    <span className={`tag ${endpoint.method === "GET" ? "is-success" : "is-danger"}`}>
                      {endpoint.method}
                    </span>
                    <code>{endpoint.path}</code>
                    <span>{endpoint.summary ?? endpoint.operationId ?? endpoint.id}</span>
                  </a>
                ))}
              </div>
            </section>

            {apiDoc.endpoints.map((endpoint) => (
              <section key={endpoint.id} id={endpoint.id} className="box api-doc-endpoint">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <span className={`tag is-medium ${endpoint.method === "GET" ? "is-success" : "is-danger"}`}>
                        {endpoint.method}
                      </span>
                    </div>
                    <div className="level-item">
                      <code>{endpoint.path}</code>
                    </div>
                  </div>
                </div>

                <h3 className="title is-5">{endpoint.summary ?? endpoint.operationId ?? endpoint.id}</h3>
                {endpoint.description && <p className="mb-3">{endpoint.description}</p>}

                <div className="content">
                  {endpoint.operationId && (
                    <p>
                      <strong>operationId:</strong> <code>{endpoint.operationId}</code>
                    </p>
                  )}
                  {endpoint.tags.length > 0 && (
                    <div className="tags">
                      {endpoint.tags.map((tag) => (
                        <span key={tag} className="tag is-link is-light">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <p className="has-text-weight-semibold mb-2">curl</p>
                <pre>
                  <code>{buildCurlExample(endpoint)}</code>
                </pre>

                {endpoint.parameters.length > 0 && (
                  <>
                    <h4 className="title is-6 mt-5">Parameters</h4>
                    <div className="table-container">
                      <table className="table is-fullwidth is-striped is-hoverable">
                        <thead>
                          <tr>
                            <th>名前</th>
                            <th>場所</th>
                            <th>必須</th>
                            <th>型</th>
                            <th>說明</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.parameters.map((parameter) => (
                            <tr key={`${parameter.in}-${parameter.name}`}>
                              <td>
                                <code>{parameter.name}</code>
                              </td>
                              <td>{parameter.in}</td>
                              <td>{parameter.required ? "required" : ""}</td>
                              <td>{schemaTypeLabel(parameter.schema)}</td>
                              <td>{parameter.description ?? ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {endpoint.requestBody && (
                  <>
                    <h4 className="title is-6 mt-5">Request Body</h4>
                    <p className="mb-2">
                      <code>{endpoint.requestBody.contentType}</code>
                      {endpoint.requestBody.required && <span> required</span>}
                    </p>
                    {endpoint.requestBody.description && <p>{endpoint.requestBody.description}</p>}
                    <SchemaBlock schema={endpoint.requestBody.schema} />
                    {endpoint.requestBody.example !== undefined && (
                      <>
                        <p className="has-text-weight-semibold mt-4 mb-2">例</p>
                        <pre>
                          <code>{formatJson(endpoint.requestBody.example)}</code>
                        </pre>
                      </>
                    )}
                  </>
                )}

                <h4 className="title is-6 mt-5">Responses</h4>
                <div className="api-doc-response-list">
                  {endpoint.responses.map((response) => (
                    <ResponseBlock key={`${endpoint.id}-${response.status}`} response={response} />
                  ))}
                </div>
              </section>
            ))}

            <section id="schemas" className="box">
              <h2 className="title is-4">Schema</h2>
              <div className="api-doc-schema-list">
                {apiDoc.schemas.map((entry) => (
                  <section key={entry.name} className="box api-doc-schema-entry">
                    <h3 className="title is-5">
                      <code>{entry.name}</code>
                    </h3>
                    <SchemaBlock schema={entry.schema} />
                  </section>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
