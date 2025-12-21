import { useAtom } from "jotai";
import { tradesAtom } from "../../atoms/trades";
import "./MarketTrades.css";
import { formatTime } from "../../utils/helper";
import { useEffect, useRef, useState } from "react";
import type { TRADE } from "../../types/types";

const BUFFER_SIZE = 5;
const TRADE_HEIGHT = 80;

const MarketTrades = () => {
  const [trades] = useAtom(tradesAtom);
  const containerRef = useRef<HTMLDivElement>(null);

  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [itemsToRender, setItemsToRender] = useState<TRADE[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const measureContainer = () => {
      if (containerRef.current && containerRef.current.clientHeight > 0) {
        const count = Math.ceil(
          containerRef.current.clientHeight / TRADE_HEIGHT
        );
        console.log("Container height:", containerRef.current.clientHeight);
        console.log("Visible count:", count);
        setVisibleCount(count);
      }
    };

    // Initial measurement
    measureContainer();

    // Use ResizeObserver to detect when container gets height
    const resizeObserver = new ResizeObserver(measureContainer);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log(
      "Second useEffect - visibleCount:",
      visibleCount,
      "trades.length:",
      trades.length,
      "startIndex:",
      startIndex
    );

    if (!visibleCount) return;

    const bufferStart = Math.max(0, startIndex - BUFFER_SIZE);
    const bufferEnd = Math.min(
      trades.length,
      startIndex + visibleCount + BUFFER_SIZE
    );

    console.log("Buffer range:", bufferStart, "to", bufferEnd);
    const sliced = trades.slice(bufferStart, bufferEnd);
    console.log("Sliced items:", sliced.length);
    setItemsToRender(sliced);
  }, [startIndex, visibleCount, trades]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newStartIndex = Math.floor(scrollTop / TRADE_HEIGHT);
    setStartIndex(newStartIndex);
  };

  const bufferStartIndex = Math.max(0, startIndex - BUFFER_SIZE);

  // console.log("itemsToRender --->", itemsToRender);

  return (
    <div className="market-trades">
      <div className="market-trades-header">Market Trades</div>

      <div className="market-trades-body">
        <div className="market-trades-body-row">
          <div className="market-trades-body-row-cell">Price</div>
          <div className="market-trades-body-row-cell">Quantity</div>
          <div className="market-trades-body-row-cell">Time</div>
        </div>

        <div
          ref={containerRef}
          className="market-trades-body-container"
          onScroll={handleScroll}
        >
          <div
            className="market-trades-body-items-container"
            style={{
              height: `${trades.length * TRADE_HEIGHT}px`,
              position: "relative",
            }}
          >
            {itemsToRender.map((item, index) => {
              const isBuy = !item.m;
              // Use position in full array as key (stable across re-renders)
              const positionInFullArray = bufferStartIndex + index;

              return (
                <div
                  key={`trade-${positionInFullArray}`}
                  className={`market-trades-body-row trade-row ${
                    isBuy ? "buy" : "sell"
                  }`}
                  style={{
                    position: "absolute",
                    top: `${(bufferStartIndex + index) * TRADE_HEIGHT}px`,
                    height: `${TRADE_HEIGHT}px`,
                    width: "100%",
                    left: 0,
                  }}
                >
                  <div className="market-trades-body-row-cell trade-price">
                    {parseFloat(item.p).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="market-trades-body-row-cell trade-amount">
                    {parseFloat(item.q).toFixed(5)}
                  </div>
                  <div className="market-trades-body-row-cell trade-time">
                    {formatTime(item.T)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTrades;
