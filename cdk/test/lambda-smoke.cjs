const assert = require("node:assert/strict");
const { handler } = require(process.argv[2]);

async function main() {
  const response = await handler(
    {
      version: "2.0",
      routeKey: "$default",
      rawPath: "/api/imperial-datetime/current",
      rawQueryString: "",
      headers: { host: "example.com" },
      requestContext: {
        http: { method: "GET", path: "/api/imperial-datetime/current", sourceIp: "127.0.0.1" },
      },
      isBase64Encoded: false,
    },
    {},
  );
  assert.equal(response.statusCode, 200);
  assert.equal(typeof JSON.parse(response.body).imperialDateTimeFormatted, "string");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
