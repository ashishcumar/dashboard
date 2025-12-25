import { useEffect, useState } from "react";
import "./App.css";
import { TRADE_BUFFER_SIZE } from "./utils/constants";
import Header from "./components/Header/Header";
import HeaderSkeleton from "./components/Header/HeaderSkeleton";
import { useAtom } from "jotai";
import { tradesAtom } from "./atoms/trades";
import { orderBookAtom } from "./atoms/orderBook";
import MarketTrades from "./components/MarketTrades/MarketTrades";
import MarketTradesSkeleton from "./components/MarketTrades/MarketTradesSkeleton";
import OrderBook from "./components/OrderBook/OrderBook";
import OrderBookSkeleton from "./components/OrderBook/OrderBookSkeleton";
import CandlestickChart from "./components/CandlestickChart/CandlestickChart";
import CandlestickChartSkeleton from "./components/CandlestickChart/CandlestickChartSkeleton";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

function App() {
  const [trades, setTrades] = useAtom(tradesAtom);
  const [orderBook, setOrderBook] = useAtom(orderBookAtom);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let worker: Worker | null = null;
    let hasReceivedData = false;

    try {
      worker = new Worker(
        new URL("./workers/websocket.worker.ts", import.meta.url)
      );

      worker.onmessage = (event) => {
        try {
          const { type, data, error } = event.data;

          if (type === "ERROR") {
            if (error && typeof error === "string") {
              console.error("Worker error:", error);
            }
            if (!hasReceivedData) {
              setIsLoading(false);
            }
            return;
          }

          if (type === "trade") {
            if (!hasReceivedData) {
              hasReceivedData = true;
              setIsLoading(false);
            }
            if (Array.isArray(data)) {
              setTrades((prev) => {
                if (prev.length + data.length > TRADE_BUFFER_SIZE) {
                  return [...prev, ...data].slice(-TRADE_BUFFER_SIZE);
                } else {
                  return [...prev, ...data];
                }
              });
            }
          }

          if (type === "orderBook") {
            if (data && (data.bids || data.asks)) {
              setOrderBook(data);
              if (!hasReceivedData) {
                hasReceivedData = true;
                setIsLoading(false);
              }
            }
          }
        } catch (error) {
          console.error("Error processing worker message:", error);
        }
      };

      worker.onerror = (error) => {
        if (error.message) {
          console.error("Worker error:", error.message);
        }
        setIsLoading(false);
        error.preventDefault?.();
        return true;
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

      const timeout = setTimeout(() => {
        if (!hasReceivedData) {
          setIsLoading(false);
        }
      }, 3000);

      return () => {
        clearTimeout(timeout);
        if (worker) {
          worker.terminate();
        }
      };
    } catch (error) {
      console.error("Error creating worker:", error);
      setIsLoading(false);
      return () => {
        if (worker) {
          worker.terminate();
        }
      };
    }
  }, []);

  const currentPrice =
    trades.length > 0
      ? parseFloat(trades[trades.length - 1].p).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : undefined;

  const hasData =
    trades.length > 0 ||
    (orderBook && (orderBook.bids?.length > 0 || orderBook.asks?.length > 0));
  const showSkeletons = isLoading || !hasData;

  return (
    <ErrorBoundary>
      <div className="app">
        <ErrorBoundary>
          {showSkeletons ? (
            <HeaderSkeleton />
          ) : (
            <Header currentPrice={currentPrice} />
          )}
        </ErrorBoundary>
        <div className="app-main-content">
          <ErrorBoundary>
            <div className="app-section-orderbook">
              {showSkeletons ? <OrderBookSkeleton /> : <OrderBook />}
            </div>
          </ErrorBoundary>
          <ErrorBoundary>
            <div className="app-section-chart">
              {showSkeletons ? (
                <CandlestickChartSkeleton />
              ) : (
                <CandlestickChart />
              )}
            </div>
          </ErrorBoundary>
          <ErrorBoundary>
            <div className="app-section-trades">
              {showSkeletons ? <MarketTradesSkeleton /> : <MarketTrades />}
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
