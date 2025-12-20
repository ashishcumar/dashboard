let TRADE_BUFFER_TIME = 100;

const batch = {
  trade: [],
  orderBook: [],
  candlestick: [],
};

const connections: Record<string, WebSocket> = {};
const intervals: Record<string, number> = {};

const getBatchForStream = (stream: string) => {
  return batch[stream as keyof typeof batch] || [];
};

const addToBatch = (stream: string, data: unknown) => {
  console.log("addToBatch", stream, data);
  batch[stream as keyof typeof batch].push(data as never);
};

const clearBatch = (stream: string) => {
  batch[stream as keyof typeof batch] = [];
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
      addToBatch(stream, data);
    };
  }
};
