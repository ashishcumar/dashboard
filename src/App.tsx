import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import type { TRADE } from "./types/types";
import { TRADE_BUFFER_SIZE } from "./utils/constants";

function App() {
  const [trades, setTrades] = useState<TRADE[]>([]);

  useEffect(() => {
    const worker = new Worker(
      new URL("./workers/websocket.worker.ts", import.meta.url)
    );
    worker.onmessage = (event) => {
      if (event.data.type === "MESSAGE" && event.data.data.length > 0) {
        setTrades((prev) => {
          if (prev.length + event.data.data.length > TRADE_BUFFER_SIZE) {
            return [...prev, ...event.data.data].slice(-TRADE_BUFFER_SIZE);
          } else {
            return [...prev, ...event.data.data];
          }
        });
      }
    };
    worker.postMessage({
      type: "CONNECT",
      data: "wss://stream.binance.com:9443/ws/btcusdt@trade",
      stream: "trade",
    });
    worker.postMessage({
      type: "CONNECT",
      data: "wss://stream.binance.com:9443/ws/btcusdt@depth@100ms",
      stream: "orderBook",
    });
  }, []);

  console.log(trades);

  return <></>;
}

export default App;
