import "./OrderBook.css";
import OrderBookAsk from "./OrderBookAsk";
import OrderBookBid from "./OrderBookBid";

const OrderBook = () => {
  return (
    <div className="order-book">
      <div className="order-book-container">
        <div className="order-book-heading">Price</div>
        <div className="order-book-heading">Quantity</div>
        <div className="order-book-heading">Total</div>
      </div>
      <div className="order-book-asks">
        <OrderBookAsk />
      </div>
      <div className="order-book-bids">
        <OrderBookBid />
      </div>
    </div>
  );
};

export default OrderBook;
