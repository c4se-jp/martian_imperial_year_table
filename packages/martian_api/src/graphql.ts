import {
  buildSchema,
  graphql,
  GraphQLError,
  GraphQLScalarType,
  Kind,
  parse,
  validate,
  type SelectionSetNode,
  type FragmentDefinitionNode,
} from "graphql";
import type { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import {
  GregorianDateTime,
  ImperialDateTime,
  ImperialYearMonth,
  JulianDay,
  ImperialSolNumber,
  MarsSolDate,
  TerrestrialTime,
  grdtToJuld,
  juldToGrdt,
  juldToTert,
  tertToJuld,
  tertToMrsd,
  mrsdToTert,
  mrsdToImsn,
  imsnToMrsd,
  imdtToImsn,
  imsnToImdt,
  tertToMrls,
} from "imperial_calendar";
import { validateTimezone } from "./datetime-conversion.js";
import { recordError } from "./telemetry.js";
import schemaSource from "./generated/graphql-schema.js";

export const schema = buildSchema(schemaSource);

function invalid(message: string, argument?: string): never {
  throw new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT", ...(argument ? { argument } : {}) } });
}

function timezone(value: unknown): string {
  if (typeof value !== "string" || validateTimezone(value)) invalid("タイムゾーンが不正です。");
  return value;
}

function gregorian(value: unknown): GregorianDateTime {
  if (typeof value !== "string") invalid("日時は文字列で指定してください。");
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) invalid("グレゴリオ曆日時の形式が不正です。");
  const [, y, mo, d, h, mi, s, fraction, offset] = match;
  const [year, month, day, hour, minute, second] = [y, mo, d, h, mi, s].map(Number);
  const ms = Number((fraction ?? "").padEnd(3, "0"));
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));
  if (
    year < 100 ||
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() + 1 !== month ||
    check.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  )
    invalid("存在しない日時です。");
  return new GregorianDateTime(
    year,
    month,
    day,
    hour,
    minute,
    second,
    ms,
    timezone(offset === "Z" ? "+00:00" : offset),
  );
}

function configureScalar(name: string, parse: (value: unknown) => string) {
  const scalar = schema.getType(name) as GraphQLScalarType;
  scalar.parseValue = parse;
  scalar.serialize = parse;
  scalar.parseLiteral = (node) =>
    node.kind === Kind.STRING ? parse(node.value) : invalid("文字列を指定してください。");
}
configureScalar("TimeZoneOffset", timezone);
configureScalar("GregorianDateTimeString", (value) => {
  gregorian(value);
  return value as string;
});

const pad = (value: number, width = 2) => String(value).padStart(width, "0");

function formatted(date: GregorianDateTime | ImperialDateTime, ms?: number) {
  return `${pad(date.year, 4)}-${pad(date.month)}-${pad(date.day)}T${pad(date.hour)}:${pad(date.minute)}:${pad(date.second)}${ms === undefined ? "" : `.${pad(ms, 3)}`}${date.timezone}`;
}

function instant(juld: JulianDay) {
  const utc = juldToGrdt(juld);
  if (![juld.day, juld.second, utc.year].every(Number.isFinite) || utc.year < 100 || utc.year > 9999) {
    throw new GraphQLError("計算可能範圍外です。", { extensions: { code: "OUT_OF_RANGE" } });
  }
  const tert = juldToTert(juld);
  const mrsd = tertToMrsd(tert);
  const imsn = mrsdToImsn(mrsd);
  return {
    julianDay: juld,
    terrestrialTime: tert.terrestrialTime,
    marsSolDate: mrsd.marsSolDate,
    imperialSolNumber: imsn,
    deltaTSeconds: juld.deltaT,
    solarLongitudeDegrees: tertToMrls(tert),
    gregorian: ({ timezone: tz }: { timezone: string }) => {
      const date = GregorianDateTime.fromUtcNaive(utc, tz);
      if (date.year < 100 || date.year > 9999)
        throw new GraphQLError("出力日時が範圍外です。", { extensions: { code: "OUT_OF_RANGE" } });
      return { ...date, millisecond: date.ms, formatted: formatted(date, date.ms) };
    },
    imperial: ({ timezone: tz }: { timezone: string }) => {
      const date = ImperialDateTime.fromStandardNaive(imsnToImdt(imsn), tz);
      return { ...date, millisecond: 0, formatted: formatted(date), holidayNames: date.holiday?.names ?? [] };
    },
  };
}

type SplitInput = { day: number; second: number };
function split(value: SplitInput, integral = false) {
  if (
    !Number.isFinite(value.second) ||
    value.second < 0 ||
    value.second >= 86400 ||
    (integral && !Number.isInteger(value.second))
  )
    invalid("秒の値が不正です。", "value.second");
  return value;
}

type ImperialInput = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  timezone: string;
};

function roots(now: Date) {
  return {
    now: () => instant(grdtToJuld(gregorian(now.toISOString()).toUtcNaive())),
    fromGregorian: ({ datetime }: { datetime: string }) => instant(grdtToJuld(gregorian(datetime).toUtcNaive())),
    fromImperial: ({ datetime: d }: { datetime: ImperialInput }) => {
      if (d.year < 1 || d.year > 10000)
        throw new GraphQLError("年が範圍外です。", { extensions: { code: "OUT_OF_RANGE" } });
      if (
        d.month < 1 ||
        d.month > 24 ||
        d.day < 1 ||
        d.day > new ImperialYearMonth(d.year, d.month).days() ||
        d.hour < 0 ||
        d.hour > 23 ||
        d.minute < 0 ||
        d.minute > 59 ||
        d.second < 0 ||
        d.second > 59 ||
        d.millisecond !== 0
      )
        invalid("帝國火星曆日時が不正です。", "datetime");
      const date = new ImperialDateTime(d.year, d.month, d.day, d.hour, d.minute, d.second, d.timezone);
      return instant(tertToJuld(mrsdToTert(imsnToMrsd(imdtToImsn(date.toStandardNaive())))));
    },
    fromJulianDay: ({ value }: { value: SplitInput }) => {
      split(value);
      return instant(new JulianDay(value.day, value.second));
    },
    fromTerrestrialTime: ({ value }: { value: number }) => instant(tertToJuld(new TerrestrialTime(value))),
    fromMarsSolDate: ({ value }: { value: number }) => instant(tertToJuld(mrsdToTert(new MarsSolDate(value)))),
    fromImperialSolNumber: ({ value }: { value: SplitInput }) => {
      split(value, true);
      return instant(tertToJuld(mrsdToTert(imsnToMrsd(new ImperialSolNumber(value.day, value.second)))));
    },
  };
}

function checkQuery(source: string) {
  const document = parse(source, { maxTokens: 2048 });
  const errors = validate(schema, document, undefined, { maxErrors: 20 });
  if (errors.length) return errors;
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) fragments.set(definition.name.value, definition);
  }
  let fields = 0;
  function walk(set: SelectionSetNode, depth: number) {
    if (depth > 12) invalid("クエリの深さが上限を超えてゐます。");
    for (const selection of set.selections) {
      if (++fields > 256) invalid("クエリの複雜度が上限を超えてゐます。");
      if (selection.kind === Kind.FRAGMENT_SPREAD) walk(fragments.get(selection.name.value)!.selectionSet, depth + 1);
      else if (selection.selectionSet) walk(selection.selectionSet, depth + 1);
    }
  }
  for (const definition of document.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) walk(definition.selectionSet, 0);
  }
  return [];
}

export function registerGraphqlRoute(app: Hono) {
  app.use("/graphql", async (c, next) => {
    c.header("Cache-Control", "no-store");
    await next();
  });
  app.use(
    "/graphql",
    bodyLimit({
      maxSize: 16384,
      onError: (c) => c.json({ errors: [{ message: "リクエストが大き過ぎます。" }] }, 413),
    }),
  );
  app.post("/graphql", async (c) => {
    const text = await c.req.text();
    let body: { query?: unknown; variables?: unknown; operationName?: unknown };
    try {
      body = JSON.parse(text);
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    } catch {
      return c.json({ errors: [{ message: "JSON が不正です。" }] }, 400);
    }
    if (
      typeof body.query !== "string" ||
      (body.variables != null && (typeof body.variables !== "object" || Array.isArray(body.variables))) ||
      (body.operationName != null && typeof body.operationName !== "string")
    ) {
      return c.json({ errors: [{ message: "GraphQL リクエストが不正です。" }] }, 400);
    }
    try {
      const errors = checkQuery(body.query);
      if (errors.length) return c.json({ errors }, 400);
    } catch (error) {
      if (error instanceof GraphQLError) return c.json({ errors: [error] }, 400);
      throw error;
    }
    const result = await graphql({
      schema,
      source: body.query,
      rootValue: roots(new Date()),
      variableValues: body.variables as Record<string, unknown> | undefined,
      operationName: body.operationName as string | undefined,
    });
    const errors = result.errors?.map((error) => {
      if (error.originalError && !(error.originalError instanceof GraphQLError)) {
        recordError(error.originalError);
        return new GraphQLError("内部エラーが發生しました。", {
          path: error.path,
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      return error;
    });
    c.header("Cache-Control", "no-store");
    return c.json({ ...result, ...(errors ? { errors } : {}) }, result.data === undefined && errors ? 400 : 200);
  });
}
