// 自動生成。generate:graphql-doc を實行してください。
import type { GraphqlDoc } from "../lib/graphqlDoc";
export default {
  "source": "\"\"\"固定オフセット ±HH:MM。時は00〜23、分は00〜59。\"\"\"\nscalar TimeZoneOffset\n\"\"\"グレゴリオ曆日時。年は0100〜9999、秒以下は3桁まで、オフセット必須。\"\"\"\nscalar GregorianDateTimeString\ninput JulianDayInput { day: Int!, second: Float! = 0 }\n\"\"\"共有ライブラリーに合はせ、秒は整數のみ。\"\"\"\ninput ImperialSolNumberInput { day: Int!, second: Float! = 0 }\n\"\"\"帝國火星曆の秒以下は未對應。millisecond は0のみ。\"\"\"\ninput ImperialDateTimeInput {\n  year: Int!, month: Int!, day: Int!, hour: Int! = 0, minute: Int! = 0,\n  second: Int! = 0, millisecond: Int! = 0, timezone: TimeZoneOffset! = \"+00:00\"\n}\ntype Query {\n  \"\"\"一回の實行中で固定したサーバー現在時刻。\"\"\"\n  now: CalendarInstant!\n  \"\"\"タイムゾーン附きグレゴリオ曆日時から變換する。\"\"\"\n  fromGregorian(datetime: GregorianDateTimeString!): CalendarInstant\n  \"\"\"構造化された帝國火星曆日時から變換する。\"\"\"\n  fromImperial(datetime: ImperialDateTimeInput!): CalendarInstant\n  \"\"\"日部と秒部に分けたユリウス通日から變換する。second は0以上86400未滿。\"\"\"\n  fromJulianDay(value: JulianDayInput!): CalendarInstant\n  \"\"\"地球時のユリウス日。單位は日、J2000は2451545.0。\"\"\"\n  fromTerrestrialTime(value: Float!): CalendarInstant\n  \"\"\"Mars Sol Date（sol 單位）から變換する。\"\"\"\n  fromMarsSolDate(value: Float!): CalendarInstant\n  \"\"\"日部と整數秒部に分けた帝國火星通日から變換する。\"\"\"\n  fromImperialSolNumber(value: ImperialSolNumberInput!): CalendarInstant\n}\n\"\"\"グレゴリオ曆UTCの年0100〜9999に對應する瞬間。\"\"\"\ntype CalendarInstant {\n  gregorian(timezone: TimeZoneOffset! = \"+00:00\"): GregorianDateTime!\n  imperial(timezone: TimeZoneOffset! = \"+00:00\"): ImperialDateTime!\n  julianDay: JulianDay!\n  \"\"\"地球時のユリウス日。單位は日。\"\"\"\n  terrestrialTime: Float!\n  \"\"\"Mars Sol Date。單位は sol。\"\"\"\n  marsSolDate: Float!\n  imperialSolNumber: ImperialSolNumber!\n  \"\"\"ΔT。單位は秒。\"\"\"\n  deltaTSeconds: Float!\n  \"\"\"火星の太陽黃經。單位は度、0以上360未滿。\"\"\"\n  solarLongitudeDegrees: Float!\n}\ntype GregorianDateTime {\n  year: Int!, month: Int!, day: Int!, hour: Int!, minute: Int!, second: Int!,\n  millisecond: Int!, timezone: TimeZoneOffset!, formatted: GregorianDateTimeString!\n}\ntype ImperialDateTime {\n  year: Int!, month: Int!, day: Int!, hour: Int!, minute: Int!, second: Int!,\n  \"\"\"秒以下は未對應のため常に0。\"\"\"\n  millisecond: Int!, timezone: TimeZoneOffset!, formatted: String!, holidayNames: [String!]!\n}\ntype JulianDay { day: Int!, second: Float! }\ntype ImperialSolNumber { day: Int!, second: Float! }\n",
  "types": [
    {
      "name": "Boolean",
      "kind": "scalar",
      "description": "The `Boolean` scalar type represents `true` or `false`.",
      "fields": []
    },
    {
      "name": "CalendarInstant",
      "kind": "type",
      "description": "グレゴリオ曆UTCの年0100〜9999に對應する瞬間。",
      "fields": [
        {
          "name": "gregorian",
          "description": "",
          "type": "GregorianDateTime!",
          "defaultValue": null,
          "args": [
            {
              "name": "timezone",
              "description": "",
              "type": "TimeZoneOffset!",
              "defaultValue": "\"+00:00\"",
              "args": []
            }
          ]
        },
        {
          "name": "imperial",
          "description": "",
          "type": "ImperialDateTime!",
          "defaultValue": null,
          "args": [
            {
              "name": "timezone",
              "description": "",
              "type": "TimeZoneOffset!",
              "defaultValue": "\"+00:00\"",
              "args": []
            }
          ]
        },
        {
          "name": "julianDay",
          "description": "",
          "type": "JulianDay!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "terrestrialTime",
          "description": "地球時のユリウス日。單位は日。",
          "type": "Float!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "marsSolDate",
          "description": "Mars Sol Date。單位は sol。",
          "type": "Float!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "imperialSolNumber",
          "description": "",
          "type": "ImperialSolNumber!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "deltaTSeconds",
          "description": "ΔT。單位は秒。",
          "type": "Float!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "solarLongitudeDegrees",
          "description": "火星の太陽黃經。單位は度、0以上360未滿。",
          "type": "Float!",
          "defaultValue": null,
          "args": []
        }
      ]
    },
    {
      "name": "Float",
      "kind": "scalar",
      "description": "The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).",
      "fields": []
    },
    {
      "name": "GregorianDateTime",
      "kind": "type",
      "description": "",
      "fields": [
        {
          "name": "year",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "month",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "day",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "hour",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "minute",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "second",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "millisecond",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "timezone",
          "description": "",
          "type": "TimeZoneOffset!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "formatted",
          "description": "",
          "type": "GregorianDateTimeString!",
          "defaultValue": null,
          "args": []
        }
      ]
    },
    {
      "name": "GregorianDateTimeString",
      "kind": "scalar",
      "description": "グレゴリオ曆日時。年は0100〜9999、秒以下は3桁まで、オフセット必須。",
      "fields": []
    },
    {
      "name": "ImperialDateTime",
      "kind": "type",
      "description": "",
      "fields": [
        {
          "name": "year",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "month",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "day",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "hour",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "minute",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "second",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "millisecond",
          "description": "秒以下は未對應のため常に0。",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "timezone",
          "description": "",
          "type": "TimeZoneOffset!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "formatted",
          "description": "",
          "type": "String!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "holidayNames",
          "description": "",
          "type": "[String!]!",
          "defaultValue": null,
          "args": []
        }
      ]
    },
    {
      "name": "ImperialDateTimeInput",
      "kind": "input",
      "description": "帝國火星曆の秒以下は未對應。millisecond は0のみ。",
      "fields": [
        {
          "name": "year",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "month",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "day",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "hour",
          "description": "",
          "type": "Int!",
          "defaultValue": "0",
          "args": []
        },
        {
          "name": "minute",
          "description": "",
          "type": "Int!",
          "defaultValue": "0",
          "args": []
        },
        {
          "name": "second",
          "description": "",
          "type": "Int!",
          "defaultValue": "0",
          "args": []
        },
        {
          "name": "millisecond",
          "description": "",
          "type": "Int!",
          "defaultValue": "0",
          "args": []
        },
        {
          "name": "timezone",
          "description": "",
          "type": "TimeZoneOffset!",
          "defaultValue": "\"+00:00\"",
          "args": []
        }
      ]
    },
    {
      "name": "ImperialSolNumber",
      "kind": "type",
      "description": "",
      "fields": [
        {
          "name": "day",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "second",
          "description": "",
          "type": "Float!",
          "defaultValue": null,
          "args": []
        }
      ]
    },
    {
      "name": "ImperialSolNumberInput",
      "kind": "input",
      "description": "共有ライブラリーに合はせ、秒は整數のみ。",
      "fields": [
        {
          "name": "day",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "second",
          "description": "",
          "type": "Float!",
          "defaultValue": "0",
          "args": []
        }
      ]
    },
    {
      "name": "Int",
      "kind": "scalar",
      "description": "The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.",
      "fields": []
    },
    {
      "name": "JulianDay",
      "kind": "type",
      "description": "",
      "fields": [
        {
          "name": "day",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "second",
          "description": "",
          "type": "Float!",
          "defaultValue": null,
          "args": []
        }
      ]
    },
    {
      "name": "JulianDayInput",
      "kind": "input",
      "description": "",
      "fields": [
        {
          "name": "day",
          "description": "",
          "type": "Int!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "second",
          "description": "",
          "type": "Float!",
          "defaultValue": "0",
          "args": []
        }
      ]
    },
    {
      "name": "Query",
      "kind": "type",
      "description": "",
      "fields": [
        {
          "name": "now",
          "description": "一回の實行中で固定したサーバー現在時刻。",
          "type": "CalendarInstant!",
          "defaultValue": null,
          "args": []
        },
        {
          "name": "fromGregorian",
          "description": "タイムゾーン附きグレゴリオ曆日時から變換する。",
          "type": "CalendarInstant",
          "defaultValue": null,
          "args": [
            {
              "name": "datetime",
              "description": "",
              "type": "GregorianDateTimeString!",
              "defaultValue": null,
              "args": []
            }
          ]
        },
        {
          "name": "fromImperial",
          "description": "構造化された帝國火星曆日時から變換する。",
          "type": "CalendarInstant",
          "defaultValue": null,
          "args": [
            {
              "name": "datetime",
              "description": "",
              "type": "ImperialDateTimeInput!",
              "defaultValue": null,
              "args": []
            }
          ]
        },
        {
          "name": "fromJulianDay",
          "description": "日部と秒部に分けたユリウス通日から變換する。second は0以上86400未滿。",
          "type": "CalendarInstant",
          "defaultValue": null,
          "args": [
            {
              "name": "value",
              "description": "",
              "type": "JulianDayInput!",
              "defaultValue": null,
              "args": []
            }
          ]
        },
        {
          "name": "fromTerrestrialTime",
          "description": "地球時のユリウス日。單位は日、J2000は2451545.0。",
          "type": "CalendarInstant",
          "defaultValue": null,
          "args": [
            {
              "name": "value",
              "description": "",
              "type": "Float!",
              "defaultValue": null,
              "args": []
            }
          ]
        },
        {
          "name": "fromMarsSolDate",
          "description": "Mars Sol Date（sol 單位）から變換する。",
          "type": "CalendarInstant",
          "defaultValue": null,
          "args": [
            {
              "name": "value",
              "description": "",
              "type": "Float!",
              "defaultValue": null,
              "args": []
            }
          ]
        },
        {
          "name": "fromImperialSolNumber",
          "description": "日部と整數秒部に分けた帝國火星通日から變換する。",
          "type": "CalendarInstant",
          "defaultValue": null,
          "args": [
            {
              "name": "value",
              "description": "",
              "type": "ImperialSolNumberInput!",
              "defaultValue": null,
              "args": []
            }
          ]
        }
      ]
    },
    {
      "name": "String",
      "kind": "scalar",
      "description": "The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.",
      "fields": []
    },
    {
      "name": "TimeZoneOffset",
      "kind": "scalar",
      "description": "固定オフセット ±HH:MM。時は00〜23、分は00〜59。",
      "fields": []
    }
  ]
} satisfies GraphqlDoc;
