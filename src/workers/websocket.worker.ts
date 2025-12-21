import type { ORDER_BOOK } from "../types/types";

const TRADE_BUFFER_TIME = 100;

const batch = {
  trade: [],
  orderBook: [],
  candlestick: [],
};

const orderBook = {
  bids: new Map<string, string>(),
  asks: new Map<string, string>(),
};

const connections: Record<string, WebSocket> = {};
const intervals: Record<string, number> = {};

const getBatchForStream = (stream: string) => {
  return batch[stream as keyof typeof batch] || [];
};

const addToBatch = (stream: string, data: unknown) => {
  batch[stream as keyof typeof batch].push(data as never);
};

const clearBatch = (stream: string) => {
  batch[stream as keyof typeof batch] = [];
};

const updateOrderBook = (data: ORDER_BOOK) => {
  if (data?.b?.length > 0) {
    data.b.forEach(([price, quantity]) => {
      if (quantity === "0.00000000") {
        orderBook.bids.delete(price);
      } else {
        orderBook.bids.set(price, quantity);
      }
    });
  }
  if (data?.a?.length > 0) {
    data.a.forEach(([price, quantity]) => {
      if (quantity === "0.00000000") {
        orderBook.asks.delete(price);
      } else {
        orderBook.asks.set(price, quantity);
      }
    });
  }
  return {
    bids: Array.from(orderBook.bids.entries()).sort(
      (a, b) => parseFloat(b[0]) - parseFloat(a[0])
    ),
    asks: Array.from(orderBook.asks.entries()).sort(
      (a, b) => parseFloat(b[0]) - parseFloat(a[0])
    ),
  };
};

self.postMessage({ type: "RESULT", data: "Hello from the worker!" });

self.onmessage = (event) => {
  const { type, data, stream } = event.data;
  if (type === "CONNECT") {
    const ws = new WebSocket(data);
    connections[stream] = ws;

    ws.onopen = () => {
      if (intervals[stream]) {
        clearInterval(intervals[stream]);
      }
      intervals[stream] = setInterval(() => {
        const batch = getBatchForStream(stream);
        if (batch.length > 0) {
          self.postMessage({ type: stream, data: batch });
          clearBatch(stream);
        }
      }, TRADE_BUFFER_TIME);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (stream === "trade") {
        addToBatch(stream, data);
      } else if (stream === "orderBook") {
        const orderBookData = updateOrderBook(data as ORDER_BOOK);
        self.postMessage({ type: stream, data: orderBookData });
      }
    };
  }
};
