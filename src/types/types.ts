export interface TRADE {
  e: string;
  E: number;
  s: string;
  t: number;
  p: string;
  q: string;
  T: number;
  m: boolean;
  M: boolean;
}

export interface ORDER_BOOK {
  e: string; // event type
  E: number; // event time
  s: string; // symbol
  U: number; // first update id
  u: number; // last update id
  b: [string, string][]; // bids
  a: [string, string][]; // asks
}

