import {atom} from "jotai";
import type { TRADE } from "../types/types";

export const tradesAtom = atom<TRADE[]>([]);