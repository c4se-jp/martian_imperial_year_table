# 帝國火星曆 (帝国火星暦。Imperial Martian Calendar)

https://martian-imperial-year-table.c4se.jp/
( https://c4se-jp.github.io/martian_imperial_year_table/ )

## 略語 (abbreviation)

- grdt : `GregorianDateTime`。グレゴリオ曆でのタイムゾーン附き日時
- juld : `JulianDay`。ユリウス通日
- delta_t : `JulianDay.delta_t`
- tert : `TerrestrialTime`
- mrls : Mars Ls (Areocentric Solar Longitude)
- mrsd : `MarsSolDate`
- imsn : `ImperialSolNumber`
- imdt : `ImperialDateTime`。帝國火星曆でのタイムゾーン附き日時

## 開發用 server の起動

$ npm run -w martian_ui dev

## packages/

- calendar_svg : 帝國火星曆の七曜表を描畫する library
- imperial_calendar : グレゴリオ曆と帝國火星曆とを相互に變換する library
- martian_api : AWS Lambda で動作する帝國火星曆 Web API
- martian_ui : Web frontend
