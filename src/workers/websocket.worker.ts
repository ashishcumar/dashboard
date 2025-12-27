import type { ORDER_BOOK } from "../types/types";

const TRADE_BUFFER_TIME = 100;

const batch = {
  trade: [],
  orderBook: [],
  candlestick: [],
};

const orderBook = {
  bids: new Map<number, string>(),
  asks: new Map<number, string>(),

  bidsArray: [] as [number, string][],
  asksArray: [] as [number, string][],
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
  const arr = batch[stream as keyof typeof batch];
  if (Array.isArray(arr)) {
    arr.length = 0;
  }
};

const updateOrderBook = (data: ORDER_BOOK) => {
  if (data?.b?.length > 0) {
    data.b.forEach(([price, quantity]) => {
      const numPrice = Number(price);
      if (quantity === "0.00000000") {
        orderBook.bids.delete(numPrice);
      } else {
        orderBook.bids.set(numPrice, quantity);
      }
    });

    orderBook.bidsArray = Array.from(orderBook.bids.entries()).sort(
      (a, b) => a[0] - b[0]
    );
  }
  if (data?.a?.length > 0) {
    data.a.forEach(([price, quantity]) => {
      const numPrice = Number(price);
      if (quantity === "0.00000000") {
        orderBook.asks.delete(numPrice);
      } else {
        orderBook.asks.set(numPrice, quantity);
      }
    });

    orderBook.asksArray = Array.from(orderBook.asks.entries()).sort(
      (a, b) => a[0] - b[0]
    );
  }

  return {
    bids: orderBook.bidsArray,
    asks: orderBook.asksArray,
  };
};

self.postMessage({ type: "RESULT", data: "Hello from the worker!" });

self.onmessage = (event) => {
  try {
    const { type, data, stream } = event.data;
    if (type === "CONNECT") {
      try {
        const ws = new WebSocket(data);
        connections[stream] = ws;

        ws.onopen = () => {
          try {
            if (intervals[stream]) {
              clearInterval(intervals[stream]);
            }
            intervals[stream] = setInterval(() => {
              try {
                const batch = getBatchForStream(stream);
                if (batch.length > 0) {
                  self.postMessage({ type: stream, data: batch });
                  clearBatch(stream);
                }
              } catch (error) {
                console.error(
                  `Error in batch processing for ${stream}:`,
                  error
                );
              }
            }, TRADE_BUFFER_TIME);
          } catch (error) {
            console.error(`Error setting up interval for ${stream}:`, error);
            self.postMessage({
              type: "ERROR",
              stream,
              error: "Failed to setup interval",
            });
          }
        };

        ws.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            if (stream === "trade") {
              addToBatch(stream, parsedData);
            } else if (stream === "orderBook") {
              const orderBookData = updateOrderBook(parsedData as ORDER_BOOK);
              self.postMessage({ type: stream, data: orderBookData });
            }
          } catch (error) {
            console.error(`Error parsing message for ${stream}:`, error);
            self.postMessage({
              type: "ERROR",
              stream,
              error: "Failed to parse message",
            });
          }
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for ${stream}:`, error);
          self.postMessage({
            type: "ERROR",
            stream,
            error: "WebSocket connection error",
          });
        };

        ws.onclose = (event) => {
          if (intervals[stream]) {
            clearInterval(intervals[stream]);
            delete intervals[stream];
          }
          if (event.code !== 1000) {
            console.warn(
              `WebSocket closed unexpectedly for ${stream}:`,
              event.code,
              event.reason
            );
            self.postMessage({
              type: "ERROR",
              stream,
              error: `Connection closed: ${event.reason || event.code}`,
            });
          }
        };
      } catch (error) {
        console.error(`Error creating WebSocket for ${stream}:`, error);
        self.postMessage({
          type: "ERROR",
          stream,
          error: "Failed to create WebSocket",
        });
      }
    }
  } catch (error) {
    console.error("Error in worker message handler:", error);
    self.postMessage({ type: "ERROR", error: "Unknown error in worker" });
  }
};

self.onerror = (error) => {
  try {
    console.error("Worker error:", error);
    self.postMessage({ type: "ERROR", error: "Worker encountered an error" });
  } catch (e) {
    console.error("Worker error:", e);
  }
  return true;
};

self.onunhandledrejection = (event) => {
  try {
    console.error("Unhandled promise rejection in worker:", event.reason);
    self.postMessage({ type: "ERROR", error: "Unhandled promise rejection" });
    event.preventDefault();
    event.stopPropagation();
  } catch (e) {
    console.error("Unhandled promise rejection in worker:", e);
  }
  return true;
};
