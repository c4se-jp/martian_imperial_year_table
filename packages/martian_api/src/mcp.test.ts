import { describe, expect, test } from "vitest";
import { app } from "./app.js";

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
};

async function postMcp(message: unknown, headers: HeadersInit = {}): Promise<Response> {
  return app.request("/mcp", {
    method: "POST",
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(message),
  });
}

async function parseSseJsonRpc(response: Response): Promise<JsonRpcResponse> {
  const body = await response.text();
  const dataLine = body.split(/\r?\n/).find((line) => line.startsWith("data: ") && line.length > "data: ".length);

  if (dataLine === undefined) {
    throw new Error(`SSE data line not found: ${body}`);
  }

  return JSON.parse(dataLine.slice("data: ".length)) as JsonRpcResponse;
}

describe("/mcp", () => {
  test("tools/list で公開ツール一覧を返す", async () => {
    const response = await postMcp({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {},
    });
    expect(response.status).toBe(200);

    const jsonrpc = await parseSseJsonRpc(response);
    expect(jsonrpc.error).toBeUndefined();
    expect(jsonrpc.id).toBe(1);

    const result = jsonrpc.result as {
      tools: Array<{ name: string }>;
    };
    expect(result.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "convert_gregorian_to_imperial_datetime",
        "get_current_imperial_datetime",
        "convert_imperial_to_gregorian_datetime",
      ]),
    );
  });

  test("tools/call で現在の帝國火星曆日時を返す", async () => {
    const response = await postMcp({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "get_current_imperial_datetime",
        arguments: {
          timezone: "+09:00",
        },
      },
    });
    expect(response.status).toBe(200);

    const jsonrpc = await parseSseJsonRpc(response);
    expect(jsonrpc.error).toBeUndefined();
    expect(jsonrpc.id).toBe(2);

    const result = jsonrpc.result as {
      content: Array<{ type: string; text: string }>;
      isError?: boolean;
    };
    expect(result.isError).toBeUndefined();

    const payload = JSON.parse(result.content[0]?.text ?? "{}") as {
      imperialDateTime: { timezone: string };
      imperialDateTimeFormatted: string;
    };
    expect(payload.imperialDateTime.timezone).toBe("+09:00");
    expect(payload.imperialDateTimeFormatted).toMatch(/[+-]\d{2}:\d{2}$/);
  });

  test("tools/call で timezone が不正な場合は isError=true を返す", async () => {
    const response = await postMcp({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_current_imperial_datetime",
        arguments: {
          timezone: "0900",
        },
      },
    });
    expect(response.status).toBe(200);

    const jsonrpc = await parseSseJsonRpc(response);
    expect(jsonrpc.error).toBeUndefined();
    expect(jsonrpc.id).toBe(3);

    const result = jsonrpc.result as {
      content: Array<{ type: string; text: string }>;
      isError?: boolean;
    };
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe("Invalid timezone format");
  });

  test("Accept ヘッダーが不足してゐる場合は 406 を返す", async () => {
    const response = await postMcp(
      {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/list",
        params: {},
      },
      { Accept: "application/json" },
    );
    expect(response.status).toBe(406);
    await expect(response.json()).resolves.toEqual({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Not Acceptable: Client must accept both application/json and text/event-stream",
      },
      id: null,
    });
  });
});
