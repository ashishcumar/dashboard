import { useAtom } from "jotai";
import { orderBookAtom } from "../../atoms/orderBook";
import { useMemo } from "react";
import VirtualizedList from "../VirtualizedList/VirtualizedList";

const ORDERBOOK_ROW_HEIGHT = 35;

type OrderBookItem = {
  price: string;
  quantity: string;
  total: number;
  percentage: number;
};

const OrderBookBid = () => {
  const [orderBook] = useAtom(orderBookAtom);

  const bidsWithTotal = useMemo(() => {
    if (!orderBook?.bids) return [];
    let cumulativeTotal = 0;

    const result = orderBook.bids.map(([price, quantity]) => {
      const quantityNum = parseFloat(quantity);
      cumulativeTotal += quantityNum;
      return { price, quantity, total: cumulativeTotal };
    });
    const maxTotal = result.length > 0 ? result[result.length - 1].total : 1;
    return result.map((item) => ({
      ...item,
      percentage: (item.total / maxTotal) * 100,
    }));
  }, [orderBook?.bids]);

  return (
    <VirtualizedList
      items={bidsWithTotal}
      itemHeight={ORDERBOOK_ROW_HEIGHT}
      containerClassName="order-book-bids"
      renderItem={(item: OrderBookItem) => {
        return (
          <div
            className="order-book-bid"
            style={
              {
                "--depth-percentage": `${item.percentage}%`,
              } as React.CSSProperties
            }
          >
            <div className="order-book-bid-price">
              {parseFloat(item.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="order-book-bid-quantity">
              {parseFloat(item.quantity).toFixed(5)}
            </div>
            <div className="order-book-bid-total">{item.total.toFixed(5)}</div>
          </div>
        );
      }}
    />
  );
};

export default OrderBookBid;
