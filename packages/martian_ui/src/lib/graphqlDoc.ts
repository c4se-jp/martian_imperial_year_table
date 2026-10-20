export type GraphqlFieldDoc = {
  name: string;
  description: string;
  type: string;
  defaultValue: string | null;
  args: GraphqlFieldDoc[];
};

export type GraphqlDoc = {
  source: string;
  types: {
    name: string;
    kind: string;
    description: string;
    fields: GraphqlFieldDoc[];
  }[];
};
