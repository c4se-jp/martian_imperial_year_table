const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../canary/transform-check/nodejs/node_modules/transformCheck.js"), "utf8");
const expected = "1428-17-28T07:04:27+00:00";

function createCanary(responses) {
  const steps = [];
  const errors = [];
  const requests = [];
  const synthetics = {
    getPage: async () => { throw new Error("browser unavailable"); },
    executeStep: async (name, check) => {
      steps.push(name);
      return check();
    },
  };
  const context = {
    require: (name) => name === "Synthetics" ? synthetics : { error: (message) => errors.push(message), info() {} },
    process: { env: { SITE_DOMAIN_NAME: "example.com" } },
    exports: {},
    AbortSignal,
    fetch: async (url, options) => {
      requests.push({ url, options });
      const response = responses[new URL(url).pathname];
      if (!response) throw new Error("unexpected request");
      return { status: response.status ?? 200, text: async () => response.body };
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, steps, errors, requests };
}

function validResponses() {
  return {
    "/api/imperial-datetime/from-gregorian": { body: JSON.stringify({ imperialDateTimeFormatted: expected }) },
    "/mcp": { body: `event: message\ndata: ${JSON.stringify({
      jsonrpc: "2.0", id: 1, result: { structuredContent: { response: { imperialDateTimeFormatted: expected } } },
    })}\n\n` },
    "/graphql": { body: JSON.stringify({ data: { fromGregorian: { imperial: { formatted: expected } } } }) },
  };
}

test("各 API の正常な變換結果を確認する", async () => {
  const { context, requests } = createCanary(validResponses());
  await context.checkRestApi();
  await context.checkMcp();
  await context.checkGraphql();
  assert.equal(requests.length, 3);
  assert.equal(requests[1].options.headers.Accept, "application/json, text/event-stream");
  assert.equal(JSON.parse(requests[0].options.body).gregorianDateTime, "2026-01-01T00:00:00+09:00");
});

test("HTTP、JSON、變換結果、GraphQL と MCP のエラーを檢出する", async () => {
  for (const [key, response, method, pattern] of [
    ["/api/imperial-datetime/from-gregorian", { status: 503 }, "checkRestApi", /HTTP 503/],
    ["/api/imperial-datetime/from-gregorian", { body: "{" }, "checkRestApi", /JSON/],
    ["/api/imperial-datetime/from-gregorian", { body: "{}" }, "checkRestApi", /expected=/],
    ["/graphql", { body: '{"errors":[{"message":"bad"}]}' }, "checkGraphql", /GraphQL/],
    ["/mcp", { body: "invalid" }, "checkMcp", /SSE/],
    ["/mcp", { body: 'data: {"jsonrpc":"2.0","id":1,"result":{"isError":true}}\n\n' }, "checkMcp", /JSON-RPC/],
    ["/mcp", { body: 'data: {"jsonrpc":"2.0","id":2,"result":{}}\n\n' }, "checkMcp", /JSON-RPC/],
  ]) {
    const responses = validResponses();
    responses[key] = response;
    await assert.rejects(createCanary(responses).context[method](), pattern);
  }
});

test("先行する檢查が失敗しても殘りを實行し、最後に失敗を報吿する", async () => {
  const responses = validResponses();
  responses["/graphql"] = { body: '{"errors":[{"message":"bad"}]}' };
  const { context, steps, errors, requests } = createCanary(responses);
  await assert.rejects(context.exports.handler(), /transform: .*browser unavailable.*calendar: .*browser unavailable.*graphql:/);
  assert.deepEqual(steps, ["transform", "calendar", "restApi", "mcp", "graphql"]);
  assert.equal(requests.length, 3);
  assert.equal(errors.length, 3);
});
