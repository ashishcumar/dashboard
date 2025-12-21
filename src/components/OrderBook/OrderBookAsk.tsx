import { useAtom } from "jotai";
import { orderBookAtom } from "../../atoms/orderBook";
import { useMemo } from "react";

const OrderBookAsk = () => {
  const [orderBook] = useAtom(orderBookAtom);
  
  const asksWithTotal = useMemo(() => {
    if (!orderBook?.asks) return [];
    let cumulativeTotal = 0;
    const result = orderBook.asks.map(([price, quantity]) => {
      cumulativeTotal += parseFloat(quantity);
      return { price, quantity, total: cumulativeTotal };
    });
    console.log("Asks data:", result.length, "items");
    return result;
  }, [orderBook?.asks]);

  return (
    <>
      {asksWithTotal.map(({ price, quantity, total }) => {
        return (
          <div className="order-book-ask" key={price}>
            <div className="order-book-ask-price">
              {parseFloat(price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="order-book-ask-quantity">
              {parseFloat(quantity).toFixed(5)}
            </div>
            <div className="order-book-ask-total">
              {total.toFixed(5)}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default OrderBookAsk;
