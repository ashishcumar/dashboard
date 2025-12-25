import Skeleton from "../Skeleton/Skeleton";
import "./Header.css";

const HeaderSkeleton = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="trading-pair">
          <Skeleton width="100px" height="24px" />
          <Skeleton width="24px" height="24px" borderRadius="4px" />
        </div>
        <div className="price-section">
          <Skeleton width="120px" height="28px" />
          <Skeleton width="100px" height="20px" />
        </div>
      </div>
      <div className="header-stats">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stat-item">
            <Skeleton width="80px" height="14px" />
            <Skeleton width="100px" height="18px" />
          </div>
        ))}
      </div>
      <div className="header-actions">
        <Skeleton width="32px" height="32px" borderRadius="4px" />
        <Skeleton width="32px" height="32px" borderRadius="4px" />
      </div>
    </header>
  );
};

export default HeaderSkeleton;
