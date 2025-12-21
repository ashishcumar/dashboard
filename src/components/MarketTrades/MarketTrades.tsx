import { useAtom } from "jotai";
import { tradesAtom } from "../../atoms/trades";
import "./MarketTrades.css";
import { formatTime } from "../../utils/helper";
import type { TRADE } from "../../types/types";
import VirtualizedList from "../VirtualizedList/VirtualizedList";

const TRADE_HEIGHT = 35;

const MarketTrades = () => {
  const [trades] = useAtom(tradesAtom);

  return (
    <div className="market-trades">
      <div className="market-trades-header">Market Trades</div>

      <div className="market-trades-body">
        <div className="market-trades-body-row">
          <div className="market-trades-body-row-cell">Price</div>
          <div className="market-trades-body-row-cell">Quantity</div>
          <div className="market-trades-body-row-cell">Time</div>
        </div>

        <VirtualizedList
          items={trades}
          itemHeight={TRADE_HEIGHT}
          containerClassName="market-trades-body-container"
          innerContainerClassName="market-trades-body-items-container"
          renderItem={(item: TRADE) => {
            const isBuy = !item.m;
            return (
              <div
                className={`market-trades-body-row trade-row ${
                  isBuy ? "buy" : "sell"
                }`}
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
          }}
        />
      </div>
    </div>
  );
};

export default MarketTrades;
