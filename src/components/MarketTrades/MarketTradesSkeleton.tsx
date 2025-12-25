import Skeleton from "../Skeleton/Skeleton";
import "./MarketTrades.css";

const MarketTradesSkeleton = () => {
  return (
    <div className="market-trades">
      <div className="market-trades-header">
        <Skeleton width="120px" height="20px" />
      </div>
      <div className="market-trades-body">
        <div className="market-trades-body-row">
          <Skeleton width="60px" height="16px" />
          <Skeleton width="70px" height="16px" />
          <Skeleton width="50px" height="16px" />
        </div>
        <div className="market-trades-body-container">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="market-trades-body-row skeleton-row">
              <Skeleton width="90px" height="20px" />
              <Skeleton width="80px" height="20px" />
              <Skeleton width="70px" height="20px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTradesSkeleton;
