export const graphqlQueryExample = `query Convert($date: GregorianDateTimeString!) {
  fromGregorian(datetime: $date) {
    imperial {
      formatted
      holidayNames
    }
    julianDay {
      day
      second
    }
    solarLongitudeDegrees
  }
}`;

export const graphqlVariablesExample = { date: "2026-06-01T12:00:00+09:00" };

export const graphqlCurlExample = `curl https://martian-imperial-year-table.c4se.jp/graphql \\
  -H 'Content-Type: application/json' \\
  --data '${JSON.stringify({ query: graphqlQueryExample, variables: graphqlVariablesExample })}'`;
