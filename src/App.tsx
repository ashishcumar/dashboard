import { useEffect } from "react";
import "./App.css";
import { TRADE_BUFFER_SIZE } from "./utils/constants";
import Header from "./components/Header/Header";
import { useAtom } from "jotai";
import { tradesAtom } from "./atoms/trades";
import { orderBookAtom } from "./atoms/orderBook";
import MarketTrades from "./components/MarketTrades/MarketTrades";
import OrderBook from "./components/OrderBook/OrderBook";

function App() {
  const [trades, setTrades] = useAtom(tradesAtom);
  const [orderBook, setOrderBook] = useAtom(orderBookAtom);

  useEffect(() => {
    const worker = new Worker(
      new URL("./workers/websocket.worker.ts", import.meta.url)
    );
    worker.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === "trade") {
        setTrades((prev) => {
          if (prev.length + data.length > TRADE_BUFFER_SIZE) {
            return [...prev, ...data].slice(-TRADE_BUFFER_SIZE);
          } else {
            return [...prev, ...data];
          }
        });
      }
      if (type === "orderBook") {
        setOrderBook(data);
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

  // Calculate current price from latest trade
  const currentPrice =
    trades.length > 0
      ? parseFloat(trades[trades.length - 1].p).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : undefined;

 
  // console.log("orderBook --->", orderBook); console.log("trades --->", trades);

  return (
    <div className="app">
      <Header currentPrice={currentPrice} />
      {/* <MarketTrades /> */}
      <OrderBook />
    </div>
  );
}

export default App;
