import { FiStar, FiMoreHorizontal, FiSettings } from "react-icons/fi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { theme } from "../../theme";
import "./Header.css";

interface HeaderProps {
  currentPrice?: string;
  priceChange24h?: number;
  priceChangePercent24h?: number;
  high24h?: string;
  low24h?: string;
  volume24h?: string;
}

function Header({
  currentPrice = "88,304.27",
  priceChange24h = 276.05,
  priceChangePercent24h = 0.31,
  high24h = "89,399.97",
  low24h = "86,846.16",
  volume24h = "15,528.21",
}: Readonly<HeaderProps>) {
  const isPositive = priceChange24h >= 0;
  const changeColor = isPositive
    ? theme.colors.primary.green
    : theme.colors.primary.red;

  return (
    <header className="header">
      <div className="header-left">
        <div className="trading-pair">
          <h1 className="pair-name">BTC/USDT</h1>
          <button className="icon-button">
            <FiStar size={16} />
          </button>
        </div>

        <div className="price-section">
          <span className="current-price">{currentPrice}</span>
          <span className="price-change" style={{ color: changeColor }}>
            {isPositive ? (
              <MdKeyboardArrowUp size={20} />
            ) : (
              <MdKeyboardArrowDown size={20} />
            )}
            {Math.abs(priceChange24h).toLocaleString()} (
            {Math.abs(priceChangePercent24h).toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-item">
          <span className="stat-label">24h High</span>
          <span className="stat-value">{high24h}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24h Low</span>
          <span className="stat-value">{low24h}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24h Volume(BTC)</span>
          <span className="stat-value">{volume24h}</span>
        </div>
      </div>

      <div className="header-actions">
        <button className="icon-button">
          <FiSettings size={18} />
        </button>
        <button className="icon-button">
          <FiMoreHorizontal size={18} />
        </button>
      </div>
    </header>
  );
}

export default Header;
