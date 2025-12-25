import Skeleton from "../Skeleton/Skeleton";
import "./CandlestickChart.css";

const CandlestickChartSkeleton = () => {
  return (
    <div className="candlestick-chart">
      <div className="chart-controls">
        <div className="timeframe-selector">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="40px" height="32px" borderRadius="4px" />
          ))}
        </div>
        <div className="chart-info">
          <div className="chart-info-row">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} width="60px" height="14px" />
            ))}
          </div>
          <div className="chart-info-row">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width="70px" height="14px" />
            ))}
          </div>
        </div>
      </div>
      <Skeleton width="100%" height="100%" borderRadius="0" />
    </div>
  );
};

export default CandlestickChartSkeleton;
