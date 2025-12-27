import { atom } from "jotai";

export const orderBookAtom = atom<
  | {
      bids: [number, string][];
      asks: [number, string][];
    }
  | undefined
>(undefined);
