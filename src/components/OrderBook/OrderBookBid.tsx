import { useAtom } from "jotai";
import { orderBookAtom } from "../../atoms/orderBook";
import { useMemo } from "react";

const OrderBookBid = () => {
  const [orderBook] = useAtom(orderBookAtom);

  const bidsWithTotal = useMemo(() => {
    if (!orderBook?.bids) return [];
    let cumulativeTotal = 0;
    return orderBook.bids.map(([price, quantity]) => {
      cumulativeTotal += parseFloat(quantity);
      return { price, quantity, total: cumulativeTotal };
    });
  }, [orderBook?.bids]);

  return (
    <>
      {bidsWithTotal.map(({ price, quantity, total }) => {
        return (
          <div className="order-book-bid" key={price}>
            <div className="order-book-bid-price">
              {parseFloat(price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="order-book-bid-quantity">
              {parseFloat(quantity).toFixed(5)}
            </div>
            <div className="order-book-bid-total">
              {total.toFixed(5)}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default OrderBookBid;
