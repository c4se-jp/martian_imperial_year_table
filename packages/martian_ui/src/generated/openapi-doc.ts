import type { ApiDoc } from "../lib/apiDoc";

const apiDoc = {
  sourcePath: "packages/martian_api/openapi/openapi.yaml",
  info: {
    title: "帝國火星曆 API",
    version: "0.1.0",
    description: "帝國火星曆に關する Web API。 まづは現在日時の ImperialDateTime を返すエンドポイントを提供する。\n",
  },
  servers: [
    {
      url: "https://martian-imperial-year-table.c4se.jp/api/",
      description: "本番サーバー",
    },
  ],
  tags: [
    {
      name: "imperial-datetime",
      description: "帝國火星曆日時",
    },
  ],
  endpoints: [
    {
      id: "convertImperialToGregorianDateTime",
      path: "/gregorian-datetime/from-imperial",
      method: "POST",
      operationId: "convertImperialToGregorianDateTime",
      summary: "帝國火星曆日時をグレゴリオ曆日時に變換する",
      description:
        "帝國火星曆の文字列表記 (1428-19-18T01:29:08+00:00 のやうな形式) とグレゴリオ曆でのタイムゾーンを受け取り、對應するグレゴリオ曆日時 (ISO 8601 文字列) を返す。\n",
      tags: ["imperial-datetime"],
      parameters: [],
      requestBody: {
        required: true,
        contentType: "application/json",
        schema: {
          title: "ImperialToGregorianRequest",
          type: "object",
          required: ["imperialDateTimeFormatted", "gregorianTimezone"],
          example: {
            imperialDateTimeFormatted: "1428-19-18T01:29:08+09:00",
            gregorianTimezone: "+09:00",
          },
          properties: [
            {
              name: "imperialDateTimeFormatted",
              required: true,
              description: "變換元となる帝國火星曆日時文字列 (ISO 8601 と似た形式)。",
              schema: {
                description: "變換元となる帝國火星曆日時文字列 (ISO 8601 と似た形式)。",
                type: "string",
                pattern: "^(\\d{4,})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})([+-])(\\d{2}):(\\d{2})$",
                example: "1428-19-18T01:29:08+09:00",
              },
            },
            {
              name: "gregorianTimezone",
              required: true,
              description: "變換先のグレゴリオ曆でのタイムゾーン (±HH:MM)。",
              schema: {
                description: "變換先のグレゴリオ曆でのタイムゾーン (±HH:MM)。",
                type: "string",
                pattern: "^([+-])(\\d{2}):(\\d{2})$",
                example: "+09:00",
              },
            },
          ],
          additionalProperties: false,
          ref: "ImperialToGregorianRequest",
        },
        example: {
          imperialDateTimeFormatted: "1428-19-18T01:29:08+09:00",
          gregorianTimezone: "+09:00",
        },
      },
      responses: [
        {
          status: "200",
          description: "變換後のグレゴリオ曆日時",
          contentType: "application/json",
          schema: {
            title: "GregorianDateTimeConversionResponse",
            type: "object",
            required: ["gregorianDateTime"],
            example: {
              gregorianDateTime: "2026-02-14T21:34:56+09:00",
            },
            properties: [
              {
                name: "gregorianDateTime",
                required: true,
                description: "變換後のグレゴリオ曆日時 (ISO 8601)。",
                schema: {
                  description: "變換後のグレゴリオ曆日時 (ISO 8601)。",
                  type: "string",
                  format: "date-time",
                  example: "2026-02-14T21:34:56+09:00",
                },
              },
            ],
            additionalProperties: false,
            ref: "GregorianDateTimeConversionResponse",
          },
          example: {
            gregorianDateTime: "2026-02-14T21:34:56+09:00",
          },
        },
        {
          status: "400",
          description: "リクエストボディが不正",
          contentType: "application/json",
          schema: {
            title: "ErrorResponse",
            type: "object",
            required: ["message"],
            example: {
              message: "Invalid timezone format",
            },
            properties: [
              {
                name: "message",
                required: true,
                schema: {
                  type: "string",
                  example: "Invalid timezone format",
                },
              },
            ],
            additionalProperties: false,
            ref: "ErrorResponse",
          },
          example: {
            message: "Invalid timezone format",
          },
        },
        {
          status: "500",
          description: "サーバー内部エラー",
          contentType: "application/json",
          schema: {
            title: "ErrorResponse",
            type: "object",
            required: ["message"],
            example: {
              message: "Invalid timezone format",
            },
            properties: [
              {
                name: "message",
                required: true,
                schema: {
                  type: "string",
                  example: "Invalid timezone format",
                },
              },
            ],
            additionalProperties: false,
            ref: "ErrorResponse",
          },
          example: {
            message: "Invalid timezone format",
          },
        },
      ],
    },
    {
      id: "getCurrentImperialDateTime",
      path: "/imperial-datetime/current",
      method: "GET",
      operationId: "getCurrentImperialDateTime",
      summary: "現在の帝國火星曆での日時を取得する",
      description: "指定したタイムゾーン帝國火星曆での現在日時を返す。",
      tags: ["imperial-datetime"],
      parameters: [
        {
          name: "timezone",
          in: "query",
          required: false,
          description:
            "帝國火星曆のタイムゾーン。省略時は +00:00 (基準時)。 形式は +09:00 のやうな ±HH:MM。timezone=%2B09:00 等の樣にURLエンコードする事。\n",
          schema: {
            type: "string",
            pattern: "^([+-])(\\d{2}):(\\d{2})$",
            defaultValue: "+00:00",
            example: "+00:00",
          },
          defaultValue: "+00:00",
        },
      ],
      responses: [
        {
          status: "200",
          description: "現在の帝國火星曆日時",
          contentType: "application/json",
          schema: {
            title: "CurrentImperialDateTimeResponse",
            type: "object",
            required: ["gregorianDateTime", "imperialDateTime", "imperialDateTimeFormatted"],
            example: {
              gregorianDateTime: "2026-02-14T12:34:56Z",
              imperialDateTime: {
                year: 101,
                month: 5,
                day: 14,
                hour: 8,
                minute: 31,
                second: 42,
                timezone: "+09:00",
              },
              imperialDateTimeFormatted: "1428-19-18T01:29:08+00:00",
            },
            properties: [
              {
                name: "gregorianDateTime",
                required: true,
                description: "API がレスポンスを生成した UTC 時刻 (ISO 8601)。",
                schema: {
                  description: "API がレスポンスを生成した UTC 時刻 (ISO 8601)。",
                  type: "string",
                  format: "date-time",
                  example: "2026-02-14T12:34:56Z",
                },
              },
              {
                name: "imperialDateTime",
                required: true,
                schema: {
                  title: "ImperialDateTime",
                  type: "object",
                  required: ["year", "month", "day", "hour", "minute", "second", "timezone"],
                  example: {
                    year: 101,
                    month: 5,
                    day: 14,
                    hour: 8,
                    minute: 31,
                    second: 42,
                    timezone: "+09:00",
                  },
                  properties: [
                    {
                      name: "year",
                      required: true,
                      description: "帝國火星曆での年",
                      schema: {
                        description: "帝國火星曆での年",
                        type: "integer",
                        example: 101,
                      },
                    },
                    {
                      name: "month",
                      required: true,
                      description: "帝國火星曆での月",
                      schema: {
                        description: "帝國火星曆での月",
                        type: "integer",
                        minimum: 1,
                        maximum: 24,
                        example: 5,
                      },
                    },
                    {
                      name: "day",
                      required: true,
                      description: "帝國火星曆での日",
                      schema: {
                        description: "帝國火星曆での日",
                        type: "integer",
                        minimum: 1,
                        maximum: 28,
                        example: 14,
                      },
                    },
                    {
                      name: "hour",
                      required: true,
                      schema: {
                        type: "integer",
                        minimum: 0,
                        maximum: 23,
                        example: 8,
                      },
                    },
                    {
                      name: "minute",
                      required: true,
                      schema: {
                        type: "integer",
                        minimum: 0,
                        maximum: 59,
                        example: 31,
                      },
                    },
                    {
                      name: "second",
                      required: true,
                      schema: {
                        type: "integer",
                        minimum: 0,
                        maximum: 59,
                        example: 42,
                      },
                    },
                    {
                      name: "timezone",
                      required: true,
                      description: "タイムゾーン (±HH:MM)",
                      schema: {
                        description: "タイムゾーン (±HH:MM)",
                        type: "string",
                        pattern: "^([+-])(\\d{2}):(\\d{2})$",
                        example: "+09:00",
                      },
                    },
                  ],
                  additionalProperties: false,
                  ref: "ImperialDateTime",
                },
              },
              {
                name: "imperialDateTimeFormatted",
                required: true,
                description: "帝國火星曆の文字列表記 (ISO 8601 と似た形式)。",
                schema: {
                  description: "帝國火星曆の文字列表記 (ISO 8601 と似た形式)。",
                  type: "string",
                  example: "1428-19-18T01:29:08+00:00",
                },
              },
            ],
            additionalProperties: false,
            ref: "CurrentImperialDateTimeResponse",
          },
          example: {
            gregorianDateTime: "2026-02-14T12:34:56Z",
            imperialDateTime: {
              year: 101,
              month: 5,
              day: 14,
              hour: 8,
              minute: 31,
              second: 42,
              timezone: "+09:00",
            },
            imperialDateTimeFormatted: "1428-19-18T01:29:08+00:00",
          },
        },
        {
          status: "400",
          description: "リクエストパラメータが不正",
          contentType: "application/json",
          schema: {
            title: "ErrorResponse",
            type: "object",
            required: ["message"],
            example: {
              message: "Invalid timezone format",
            },
            properties: [
              {
                name: "message",
                required: true,
                schema: {
                  type: "string",
                  example: "Invalid timezone format",
                },
              },
            ],
            additionalProperties: false,
            ref: "ErrorResponse",
          },
          example: {
            message: "Invalid timezone format",
          },
        },
        {
          status: "500",
          description: "サーバー内部エラー",
          contentType: "application/json",
          schema: {
            title: "ErrorResponse",
            type: "object",
            required: ["message"],
            example: {
              message: "Invalid timezone format",
            },
            properties: [
              {
                name: "message",
                required: true,
                schema: {
                  type: "string",
                  example: "Invalid timezone format",
                },
              },
            ],
            additionalProperties: false,
            ref: "ErrorResponse",
          },
          example: {
            message: "Invalid timezone format",
          },
        },
      ],
    },
    {
      id: "convertGregorianToImperialDateTime",
      path: "/imperial-datetime/from-gregorian",
      method: "POST",
      operationId: "convertGregorianToImperialDateTime",
      summary: "グレゴリオ曆日時を帝國火星曆日時に變換する",
      description:
        "グレゴリオ曆での日時 (ISO 8601 文字列) と帝國火星曆でのタイムゾーンを受け取り、對應する帝國火星曆日時を返す。\n",
      tags: ["imperial-datetime"],
      parameters: [],
      requestBody: {
        required: true,
        contentType: "application/json",
        schema: {
          title: "GregorianToImperialRequest",
          type: "object",
          required: ["gregorianDateTime", "imperialTimezone"],
          example: {
            gregorianDateTime: "2026-02-14T12:34:56Z",
            imperialTimezone: "+09:00",
          },
          properties: [
            {
              name: "gregorianDateTime",
              required: true,
              description: "變換元となるグレゴリオ曆日時 (ISO 8601)。",
              schema: {
                description: "變換元となるグレゴリオ曆日時 (ISO 8601)。",
                type: "string",
                format: "date-time",
                example: "2026-02-14T12:34:56Z",
              },
            },
            {
              name: "imperialTimezone",
              required: true,
              description: "變換先の帝國火星曆でのタイムゾーン (±HH:MM)。",
              schema: {
                description: "變換先の帝國火星曆でのタイムゾーン (±HH:MM)。",
                type: "string",
                pattern: "^([+-])(\\d{2}):(\\d{2})$",
                example: "+09:00",
              },
            },
          ],
          additionalProperties: false,
          ref: "GregorianToImperialRequest",
        },
        example: {
          gregorianDateTime: "2026-02-14T12:34:56Z",
          imperialTimezone: "+09:00",
        },
      },
      responses: [
        {
          status: "200",
          description: "變換後の帝國火星曆日時",
          contentType: "application/json",
          schema: {
            title: "ImperialDateTimeConversionResponse",
            type: "object",
            required: ["imperialDateTime", "imperialDateTimeFormatted"],
            example: {
              imperialDateTime: {
                year: 101,
                month: 5,
                day: 14,
                hour: 8,
                minute: 31,
                second: 42,
                timezone: "+09:00",
              },
              imperialDateTimeFormatted: "1428-19-18T01:29:08+09:00",
            },
            properties: [
              {
                name: "imperialDateTime",
                required: true,
                schema: {
                  title: "ImperialDateTime",
                  type: "object",
                  required: ["year", "month", "day", "hour", "minute", "second", "timezone"],
                  example: {
                    year: 101,
                    month: 5,
                    day: 14,
                    hour: 8,
                    minute: 31,
                    second: 42,
                    timezone: "+09:00",
                  },
                  properties: [
                    {
                      name: "year",
                      required: true,
                      description: "帝國火星曆での年",
                      schema: {
                        description: "帝國火星曆での年",
                        type: "integer",
                        example: 101,
                      },
                    },
                    {
                      name: "month",
                      required: true,
                      description: "帝國火星曆での月",
                      schema: {
                        description: "帝國火星曆での月",
                        type: "integer",
                        minimum: 1,
                        maximum: 24,
                        example: 5,
                      },
                    },
                    {
                      name: "day",
                      required: true,
                      description: "帝國火星曆での日",
                      schema: {
                        description: "帝國火星曆での日",
                        type: "integer",
                        minimum: 1,
                        maximum: 28,
                        example: 14,
                      },
                    },
                    {
                      name: "hour",
                      required: true,
                      schema: {
                        type: "integer",
                        minimum: 0,
                        maximum: 23,
                        example: 8,
                      },
                    },
                    {
                      name: "minute",
                      required: true,
                      schema: {
                        type: "integer",
                        minimum: 0,
                        maximum: 59,
                        example: 31,
                      },
                    },
                    {
                      name: "second",
                      required: true,
                      schema: {
                        type: "integer",
                        minimum: 0,
                        maximum: 59,
                        example: 42,
                      },
                    },
                    {
                      name: "timezone",
                      required: true,
                      description: "タイムゾーン (±HH:MM)",
                      schema: {
                        description: "タイムゾーン (±HH:MM)",
                        type: "string",
                        pattern: "^([+-])(\\d{2}):(\\d{2})$",
                        example: "+09:00",
                      },
                    },
                  ],
                  additionalProperties: false,
                  ref: "ImperialDateTime",
                },
              },
              {
                name: "imperialDateTimeFormatted",
                required: true,
                description: "帝國火星曆の文字列表記 (ISO 8601 と似た形式)。",
                schema: {
                  description: "帝國火星曆の文字列表記 (ISO 8601 と似た形式)。",
                  type: "string",
                  example: "1428-19-18T01:29:08+09:00",
                },
              },
            ],
            additionalProperties: false,
            ref: "ImperialDateTimeConversionResponse",
          },
          example: {
            imperialDateTime: {
              year: 101,
              month: 5,
              day: 14,
              hour: 8,
              minute: 31,
              second: 42,
              timezone: "+09:00",
            },
            imperialDateTimeFormatted: "1428-19-18T01:29:08+09:00",
          },
        },
        {
          status: "400",
          description: "リクエストボディが不正",
          contentType: "application/json",
          schema: {
            title: "ErrorResponse",
            type: "object",
            required: ["message"],
            example: {
              message: "Invalid timezone format",
            },
            properties: [
              {
                name: "message",
                required: true,
                schema: {
                  type: "string",
                  example: "Invalid timezone format",
                },
              },
            ],
            additionalProperties: false,
            ref: "ErrorResponse",
          },
          example: {
            message: "Invalid timezone format",
          },
        },
        {
          status: "500",
          description: "サーバー内部エラー",
          contentType: "application/json",
          schema: {
            title: "ErrorResponse",
            type: "object",
            required: ["message"],
            example: {
              message: "Invalid timezone format",
            },
            properties: [
              {
                name: "message",
                required: true,
                schema: {
                  type: "string",
                  example: "Invalid timezone format",
                },
              },
            ],
            additionalProperties: false,
            ref: "ErrorResponse",
          },
          example: {
            message: "Invalid timezone format",
          },
        },
      ],
    },
  ],
  schemas: [
    {
      name: "ImperialToGregorianRequest",
      schema: {
        title: "ImperialToGregorianRequest",
        type: "object",
        required: ["imperialDateTimeFormatted", "gregorianTimezone"],
        example: {
          imperialDateTimeFormatted: "1428-19-18T01:29:08+09:00",
          gregorianTimezone: "+09:00",
        },
        properties: [
          {
            name: "imperialDateTimeFormatted",
            required: true,
            description: "變換元となる帝國火星曆日時文字列 (ISO 8601 と似た形式)。",
            schema: {
              description: "變換元となる帝國火星曆日時文字列 (ISO 8601 と似た形式)。",
              type: "string",
              pattern: "^(\\d{4,})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})([+-])(\\d{2}):(\\d{2})$",
              example: "1428-19-18T01:29:08+09:00",
            },
          },
          {
            name: "gregorianTimezone",
            required: true,
            description: "變換先のグレゴリオ曆でのタイムゾーン (±HH:MM)。",
            schema: {
              description: "變換先のグレゴリオ曆でのタイムゾーン (±HH:MM)。",
              type: "string",
              pattern: "^([+-])(\\d{2}):(\\d{2})$",
              example: "+09:00",
            },
          },
        ],
        additionalProperties: false,
        ref: "ImperialToGregorianRequest",
      },
    },
    {
      name: "GregorianDateTimeConversionResponse",
      schema: {
        title: "GregorianDateTimeConversionResponse",
        type: "object",
        required: ["gregorianDateTime"],
        example: {
          gregorianDateTime: "2026-02-14T21:34:56+09:00",
        },
        properties: [
          {
            name: "gregorianDateTime",
            required: true,
            description: "變換後のグレゴリオ曆日時 (ISO 8601)。",
            schema: {
              description: "變換後のグレゴリオ曆日時 (ISO 8601)。",
              type: "string",
              format: "date-time",
              example: "2026-02-14T21:34:56+09:00",
            },
          },
        ],
        additionalProperties: false,
        ref: "GregorianDateTimeConversionResponse",
      },
    },
    {
      name: "CurrentImperialDateTimeResponse",
      schema: {
        title: "CurrentImperialDateTimeResponse",
        type: "object",
        required: ["gregorianDateTime", "imperialDateTime", "imperialDateTimeFormatted"],
        example: {
          gregorianDateTime: "2026-02-14T12:34:56Z",
          imperialDateTime: {
            year: 101,
            month: 5,
            day: 14,
            hour: 8,
            minute: 31,
            second: 42,
            timezone: "+09:00",
          },
          imperialDateTimeFormatted: "1428-19-18T01:29:08+00:00",
        },
        properties: [
          {
            name: "gregorianDateTime",
            required: true,
            description: "API がレスポンスを生成した UTC 時刻 (ISO 8601)。",
            schema: {
              description: "API がレスポンスを生成した UTC 時刻 (ISO 8601)。",
              type: "string",
              format: "date-time",
              example: "2026-02-14T12:34:56Z",
            },
          },
          {
            name: "imperialDateTime",
            required: true,
            schema: {
              title: "ImperialDateTime",
              type: "object",
              required: ["year", "month", "day", "hour", "minute", "second", "timezone"],
              example: {
                year: 101,
                month: 5,
                day: 14,
                hour: 8,
                minute: 31,
                second: 42,
                timezone: "+09:00",
              },
              properties: [
                {
                  name: "year",
                  required: true,
                  description: "帝國火星曆での年",
                  schema: {
                    description: "帝國火星曆での年",
                    type: "integer",
                    example: 101,
                  },
                },
                {
                  name: "month",
                  required: true,
                  description: "帝國火星曆での月",
                  schema: {
                    description: "帝國火星曆での月",
                    type: "integer",
                    minimum: 1,
                    maximum: 24,
                    example: 5,
                  },
                },
                {
                  name: "day",
                  required: true,
                  description: "帝國火星曆での日",
                  schema: {
                    description: "帝國火星曆での日",
                    type: "integer",
                    minimum: 1,
                    maximum: 28,
                    example: 14,
                  },
                },
                {
                  name: "hour",
                  required: true,
                  schema: {
                    type: "integer",
                    minimum: 0,
                    maximum: 23,
                    example: 8,
                  },
                },
                {
                  name: "minute",
                  required: true,
                  schema: {
                    type: "integer",
                    minimum: 0,
                    maximum: 59,
                    example: 31,
                  },
                },
                {
                  name: "second",
                  required: true,
                  schema: {
                    type: "integer",
                    minimum: 0,
                    maximum: 59,
                    example: 42,
                  },
                },
                {
                  name: "timezone",
                  required: true,
                  description: "タイムゾーン (±HH:MM)",
                  schema: {
                    description: "タイムゾーン (±HH:MM)",
                    type: "string",
                    pattern: "^([+-])(\\d{2}):(\\d{2})$",
                    example: "+09:00",
                  },
                },
              ],
              additionalProperties: false,
              ref: "ImperialDateTime",
            },
          },
          {
            name: "imperialDateTimeFormatted",
            required: true,
            description: "帝國火星曆の文字列表記 (ISO 8601 と似た形式)。",
            schema: {
              description: "帝國火星曆の文字列表記 (ISO 8601 と似た形式)。",
              type: "string",
              example: "1428-19-18T01:29:08+00:00",
            },
          },
        ],
        additionalProperties: false,
        ref: "CurrentImperialDateTimeResponse",
      },
    },
    {
      name: "GregorianToImperialRequest",
      schema: {
        title: "GregorianToImperialRequest",
        type: "object",
        required: ["gregorianDateTime", "imperialTimezone"],
        example: {
          gregorianDateTime: "2026-02-14T12:34:56Z",
          imperialTimezone: "+09:00",
        },
        properties: [
          {
            name: "gregorianDateTime",
            required: true,
            description: "變換元となるグレゴリオ曆日時 (ISO 8601)。",
            schema: {
              description: "變換元となるグレゴリオ曆日時 (ISO 8601)。",
              type: "string",
              format: "date-time",
              example: "2026-02-14T12:34:56Z",
            },
          },
          {
            name: "imperialTimezone",
            required: true,
            description: "變換先の帝國火星曆でのタイムゾーン (±HH:MM)。",
            schema: {
              description: "變換先の帝國火星曆でのタイムゾーン (±HH:MM)。",
              type: "string",
              pattern: "^([+-])(\\d{2}):(\\d{2})$",
              example: "+09:00",
            },
          },
        ],
        additionalProperties: false,
        ref: "GregorianToImperialRequest",
      },
    },
    {
      name: "ImperialDateTimeConversionResponse",
      schema: {
        title: "ImperialDateTimeConversionResponse",
        type: "object",
        required: ["imperialDateTime", "imperialDateTimeFormatted"],
        example: {
          imperialDateTime: {
            year: 101,
            month: 5,
            day: 14,
            hour: 8,
            minute: 31,
            second: 42,
            timezone: "+09:00",
          },
          imperialDateTimeFormatted: "1428-19-18T01:29:08+09:00",
        },
        properties: [
          {
            name: "imperialDateTime",
            required: true,
            schema: {
              title: "ImperialDateTime",
              type: "object",
              required: ["year", "month", "day", "hour", "minute", "second", "timezone"],
              example: {
                year: 101,
                month: 5,
                day: 14,
                hour: 8,
                minute: 31,
                second: 42,
                timezone: "+09:00",
              },
              properties: [
                {
                  name: "year",
                  required: true,
                  description: "帝國火星曆での年",
                  schema: {
                    description: "帝國火星曆での年",
                    type: "integer",
                    example: 101,
                  },
                },
                {
                  name: "month",
                  required: true,
                  description: "帝國火星曆での月",
                  schema: {
                    description: "帝國火星曆での月",
                    type: "integer",
                    minimum: 1,
                    maximum: 24,
                    example: 5,
                  },
                },
                {
                  name: "day",
                  required: true,
                  description: "帝國火星曆での日",
                  schema: {
                    description: "帝國火星曆での日",
                    type: "integer",
                    minimum: 1,
                    maximum: 28,
                    example: 14,
                  },
                },
                {
                  name: "hour",
                  required: true,
                  schema: {
                    type: "integer",
                    minimum: 0,
                    maximum: 23,
                    example: 8,
                  },
                },
                {
                  name: "minute",
                  required: true,
                  schema: {
                    type: "integer",
                    minimum: 0,
                    maximum: 59,
                    example: 31,
                  },
                },
                {
                  name: "second",
                  required: true,
                  schema: {
                    type: "integer",
                    minimum: 0,
                    maximum: 59,
                    example: 42,
                  },
                },
                {
                  name: "timezone",
                  required: true,
                  description: "タイムゾーン (±HH:MM)",
                  schema: {
                    description: "タイムゾーン (±HH:MM)",
                    type: "string",
                    pattern: "^([+-])(\\d{2}):(\\d{2})$",
                    example: "+09:00",
                  },
                },
              ],
              additionalProperties: false,
              ref: "ImperialDateTime",
            },
          },
          {
            name: "imperialDateTimeFormatted",
            required: true,
            description: "帝國火星曆の文字列表記 (ISO 8601 と似た形式)。",
            schema: {
              description: "帝國火星曆の文字列表記 (ISO 8601 と似た形式)。",
              type: "string",
              example: "1428-19-18T01:29:08+09:00",
            },
          },
        ],
        additionalProperties: false,
        ref: "ImperialDateTimeConversionResponse",
      },
    },
    {
      name: "ImperialDateTime",
      schema: {
        title: "ImperialDateTime",
        type: "object",
        required: ["year", "month", "day", "hour", "minute", "second", "timezone"],
        example: {
          year: 101,
          month: 5,
          day: 14,
          hour: 8,
          minute: 31,
          second: 42,
          timezone: "+09:00",
        },
        properties: [
          {
            name: "year",
            required: true,
            description: "帝國火星曆での年",
            schema: {
              description: "帝國火星曆での年",
              type: "integer",
              example: 101,
            },
          },
          {
            name: "month",
            required: true,
            description: "帝國火星曆での月",
            schema: {
              description: "帝國火星曆での月",
              type: "integer",
              minimum: 1,
              maximum: 24,
              example: 5,
            },
          },
          {
            name: "day",
            required: true,
            description: "帝國火星曆での日",
            schema: {
              description: "帝國火星曆での日",
              type: "integer",
              minimum: 1,
              maximum: 28,
              example: 14,
            },
          },
          {
            name: "hour",
            required: true,
            schema: {
              type: "integer",
              minimum: 0,
              maximum: 23,
              example: 8,
            },
          },
          {
            name: "minute",
            required: true,
            schema: {
              type: "integer",
              minimum: 0,
              maximum: 59,
              example: 31,
            },
          },
          {
            name: "second",
            required: true,
            schema: {
              type: "integer",
              minimum: 0,
              maximum: 59,
              example: 42,
            },
          },
          {
            name: "timezone",
            required: true,
            description: "タイムゾーン (±HH:MM)",
            schema: {
              description: "タイムゾーン (±HH:MM)",
              type: "string",
              pattern: "^([+-])(\\d{2}):(\\d{2})$",
              example: "+09:00",
            },
          },
        ],
        additionalProperties: false,
        ref: "ImperialDateTime",
      },
    },
    {
      name: "ErrorResponse",
      schema: {
        title: "ErrorResponse",
        type: "object",
        required: ["message"],
        example: {
          message: "Invalid timezone format",
        },
        properties: [
          {
            name: "message",
            required: true,
            schema: {
              type: "string",
              example: "Invalid timezone format",
            },
          },
        ],
        additionalProperties: false,
        ref: "ErrorResponse",
      },
    },
  ],
} satisfies ApiDoc;

export default apiDoc;
