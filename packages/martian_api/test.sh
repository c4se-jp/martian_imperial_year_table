#!/usr/bin/env bash
set -euo pipefail

# martian_api ローカル動作確認スクリプト
# 事前に `npm run -w martian_api start:dev` などで API を起動しておくこと。

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
API_BASE="${BASE_URL}/api"

echo "=== API: POST /api/gregorian-datetime/from-imperial ==="
curl -sS \
  -H 'Content-Type: application/json' \
  --data '{"imperialDateTimeFormatted":"1220-01-01T00:00:00+00:00","gregorianTimezone":"+09:00"}' \
  "${API_BASE}/gregorian-datetime/from-imperial" | jq .
echo

echo "=== API: GET /api/imperial-datetime/current ==="
curl -sS "${API_BASE}/imperial-datetime/current?timezone=%2B09%3A00" | jq .
echo

echo "=== API: POST /api/imperial-datetime/from-gregorian ==="
curl -sS \
  -H 'Content-Type: application/json' \
  --data '{"gregorianDateTime":"2026-02-16T00:00:00+00:00","imperialTimezone":"-01:00"}' \
  "${API_BASE}/imperial-datetime/from-gregorian" | jq .
echo

MCP_URL="${BASE_URL}/mcp"

echo "=== MCP: initialize ==="
curl -sS \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"martian_api_test","version":"1.0.0"}}}' \
  "${MCP_URL}"
echo

echo "=== MCP: tools/list ==="
curl -sS \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  "${MCP_URL}"
echo

echo "=== MCP: tools/call convert_imperial_to_gregorian_datetime ==="
curl -sS \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"convert_imperial_to_gregorian_datetime","arguments":{"imperialDateTimeFormatted":"1220-01-01T00:00:00+00:00","gregorianTimezone":"+09:00"}}}' \
  "${MCP_URL}"
echo

echo "=== MCP: tools/call get_current_imperial_datetime ==="
curl -sS \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_current_imperial_datetime","arguments":{"timezone":"-01:00"}}}' \
  "${MCP_URL}"
echo

echo "=== MCP: tools/call convert_gregorian_to_imperial_datetime ==="
curl -sS \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"convert_gregorian_to_imperial_datetime","arguments":{"gregorianDateTime":"2026-02-16T00:00:00+00:00","imperialTimezone":"-01:00"}}}' \
  "${MCP_URL}"
echo
