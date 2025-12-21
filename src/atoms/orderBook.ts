import { atom } from "jotai";

export const orderBookAtom = atom<
  | {
      bids: [string, string][];
      asks: [string, string][];
    }
  | undefined
>(undefined);
