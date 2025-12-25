import Skeleton from "../Skeleton/Skeleton";
import "./OrderBook.css";

const OrderBookSkeleton = () => {
  return (
    <div className="order-book">
      <div className="order-book-container">
        <Skeleton width="60px" height="16px" />
        <Skeleton width="80px" height="16px" />
        <Skeleton width="70px" height="16px" />
      </div>
      <div className="order-book-asks">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="order-book-row skeleton-row">
            <Skeleton width="80px" height="20px" />
            <Skeleton width="90px" height="20px" />
            <Skeleton width="100px" height="20px" />
          </div>
        ))}
      </div>
      <div className="order-book-bids">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="order-book-row skeleton-row">
            <Skeleton width="80px" height="20px" />
            <Skeleton width="90px" height="20px" />
            <Skeleton width="100px" height="20px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBookSkeleton;
