export interface Params {
  [key: string]: string;
}

export interface Query {
  [key: string]: undefined | string | string[] | Query | Query[];
}
