import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./CandlestickChart.css";
import { tradesAtom } from "../../atoms/trades";
import { useAtom } from "jotai";
import { formatTime, formatDate } from "../../utils/helper";

type Timeframe = "1s" | "15m" | "1H" | "4H" | "1D" | "1W";

const TIMEFRAME_MS: Record<Timeframe, number> = {
  "1s": 1000,
  "15m": 15 * 60 * 1000,
  "1H": 60 * 60 * 1000,
  "4H": 4 * 60 * 60 * 1000,
  "1D": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
};

const CandlestickChart = () => {
  const [trades] = useAtom(tradesAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1s");
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const candles = useMemo(() => {
    if (trades.length === 0) return [];

    const grouped: Record<
      number,
      {
        timestamp: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }
    > = {};

    const INTERVAL_MS = TIMEFRAME_MS[timeframe];

    trades.forEach((trade) => {
      const intervalStart = Math.floor(trade.T / INTERVAL_MS) * INTERVAL_MS;
      const price = parseFloat(trade.p);
      const volume = parseFloat(trade.q);

      if (!grouped[intervalStart]) {
        grouped[intervalStart] = {
          timestamp: intervalStart,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: volume,
        };
      } else {
        grouped[intervalStart].high = Math.max(
          grouped[intervalStart].high,
          price
        );
        grouped[intervalStart].low = Math.min(
          grouped[intervalStart].low,
          price
        );
        grouped[intervalStart].close = price;
        grouped[intervalStart].volume += volume;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((c) => ({
        timestamp: c.timestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      }));
  }, [trades, timeframe]);

  const candlesWithMA = useMemo(() => {
    if (candles.length === 0) return [];

    return candles.map((candle, index) => {
      const ma7 =
        index >= 6
          ? candles
              .slice(index - 6, index + 1)
              .reduce((sum, c) => sum + c.close, 0) / 7
          : 0;

      const ma25 =
        index >= 24
          ? candles
              .slice(index - 24, index + 1)
              .reduce((sum, c) => sum + c.close, 0) / 25
          : 0;

      const ma99 =
        index >= 98
          ? candles
              .slice(index - 98, index + 1)
              .reduce((sum, c) => sum + c.close, 0) / 99
          : 0;

      return {
        ...candle,
        ma7,
        ma25,
        ma99,
      };
    });
  }, [candles]);

  const { maxPrice, minPrice, maxVolume } = useMemo(() => {
    if (candles.length === 0) return { maxPrice: 0, minPrice: 0, maxVolume: 0 };
    return {
      maxPrice: Math.max(...candles.map((c) => c.high)),
      minPrice: Math.min(...candles.map((c) => c.low)),
      maxVolume: Math.max(...candles.map((c) => c.volume)),
    };
  }, [candles]);

  const selectedCandle = useMemo(() => {
    if (hoveredCandle !== null && candlesWithMA[hoveredCandle]) {
      return candlesWithMA[hoveredCandle];
    }
    if (candlesWithMA.length > 0) {
      return candlesWithMA[candlesWithMA.length - 1];
    }
    return null;
  }, [hoveredCandle, candlesWithMA]);

  const candleInfo = useMemo(() => {
    if (!selectedCandle) return null;

    const change = selectedCandle.close - selectedCandle.open;
    const changePercent =
      selectedCandle.open !== 0 ? (change / selectedCandle.open) * 100 : 0;
    const amplitude =
      selectedCandle.open !== 0
        ? ((selectedCandle.high - selectedCandle.low) / selectedCandle.open) *
          100
        : 0;

    return {
      open: selectedCandle.open,
      high: selectedCandle.high,
      low: selectedCandle.low,
      close: selectedCandle.close,
      change,
      changePercent,
      amplitude,
      ma7: selectedCandle.ma7,
      ma25: selectedCandle.ma25,
      ma99: selectedCandle.ma99,
      timestamp: selectedCandle.timestamp,
      volume: selectedCandle.volume,
    };
  }, [selectedCandle]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const drawChart = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx || candlesWithMA.length === 0) return;

      ctx.scale(dpr, dpr);

      const chartHeight = height * 0.7;
      const volumeHeight = height * 0.3;
      const leftPadding = 10;
      const rightPadding = 70;
      const padding = leftPadding;
      const volumePadding = 10;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#161A1E";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#2B3139";
      ctx.lineWidth = 1;

      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight - 2 * padding) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - rightPadding, y);
        ctx.stroke();
      }

      const availableWidth = width - padding - rightPadding;
      const spacing =
        candlesWithMA.length > 1
          ? availableWidth / (candlesWithMA.length - 1)
          : 0;
      const candleWidth = Math.min(
        8,
        Math.max(2, spacing > 0 ? spacing * 0.4 : 6)
      );

      const priceToY = (price: number) => {
        const priceRange = maxPrice - minPrice;
        if (priceRange === 0) return chartHeight / 2;
        const ratio = (price - minPrice) / priceRange;
        return padding + (1 - ratio) * (chartHeight - 2 * padding);
      };

      const volumeToY = (volume: number) => {
        if (maxVolume === 0) return chartHeight + volumeHeight - volumePadding;
        const ratio = volume / maxVolume;
        return (
          chartHeight +
          volumeHeight -
          volumePadding -
          ratio * (volumeHeight - 2 * volumePadding)
        );
      };

      if (candlesWithMA.length > 1) {
        ctx.strokeStyle = "#FCD535";
        ctx.lineWidth = 1;
        ctx.beginPath();
        candlesWithMA.forEach((candle, index) => {
          if (candle.ma7 > 0) {
            const x = padding + index * spacing;
            const y = priceToY(candle.ma7);
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();

        ctx.strokeStyle = "#A792EE";
        ctx.beginPath();
        candlesWithMA.forEach((candle, index) => {
          if (candle.ma25 > 0) {
            const x = padding + index * spacing;
            const y = priceToY(candle.ma25);
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();

        ctx.strokeStyle = "#74FCFD";
        ctx.beginPath();
        candlesWithMA.forEach((candle, index) => {
          if (candle.ma99 > 0) {
            const x = padding + index * spacing;
            const y = priceToY(candle.ma99);
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();
      }

      candlesWithMA.forEach((candle, index) => {
        const openY = priceToY(candle.open);
        const highY = priceToY(candle.high);
        const lowY = priceToY(candle.low);
        const closeY = priceToY(candle.close);
        const x = padding + index * spacing;
        const isBullish = candle.close >= candle.open;
        const color = isBullish ? "#0ECB81" : "#F6465D";

        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY) || 1;
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

        if (hoveredCandle === index) {
          ctx.strokeStyle = "#FCD535";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            x - candleWidth / 2 - 2,
            Math.min(highY, lowY) - 2,
            candleWidth + 4,
            Math.abs(highY - lowY) + 4
          );
        }
      });

      candlesWithMA.forEach((candle, index) => {
        const x = padding + index * spacing;
        const isBullish = candle.close >= candle.open;
        const color = isBullish
          ? "rgba(14, 203, 129, 0.3)"
          : "rgba(246, 70, 93, 0.3)";

        const volumeBarTop = volumeToY(candle.volume);
        const volumeBarHeight =
          chartHeight + volumeHeight - volumePadding - volumeBarTop;
        const volumeBarWidth = candleWidth;

        ctx.fillStyle = color;
        ctx.fillRect(
          x - volumeBarWidth / 2,
          volumeBarTop,
          volumeBarWidth,
          volumeBarHeight
        );
      });

      if (
        mousePosition &&
        mousePosition.x >= padding &&
        mousePosition.x <= width - rightPadding
      ) {
        ctx.strokeStyle = "#848E9C";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(mousePosition.x, padding);
        ctx.lineTo(mousePosition.x, chartHeight + volumeHeight - volumePadding);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = "#848E9C";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      for (let i = 0; i <= 5; i++) {
        const price = minPrice + (maxPrice - minPrice) * (i / 5);
        const y = padding + (chartHeight - 2 * padding) * (1 - i / 5);
        ctx.fillText(price.toFixed(2), width - rightPadding + 8, y + 4);
      }

      if (candlesWithMA.length > 0) {
        const lastCandle = candlesWithMA[candlesWithMA.length - 1];
        const volBTC = (lastCandle.volume / 1e8).toFixed(3);
        const volUSDT = ((lastCandle.volume * lastCandle.close) / 1e11).toFixed(
          2
        );
        ctx.fillStyle = "#848E9C";
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(
          `Vol(BTC): ${volBTC}K Vol(USDT) ${volUSDT}B`,
          padding,
          chartHeight + 20
        );
      }
    };

    drawChart();

    const resizeObserver = new ResizeObserver(() => {
      drawChart();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    candlesWithMA,
    maxPrice,
    minPrice,
    maxVolume,
    hoveredCandle,
    mousePosition,
  ]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });

      const leftPadding = 10;
      const rightPadding = 70;
      const cssWidth = rect.width;
      const availableWidth = cssWidth - leftPadding - rightPadding;
      const spacing =
        candlesWithMA.length > 1
          ? availableWidth / (candlesWithMA.length - 1)
          : 0;

      if (
        x >= leftPadding &&
        x <= cssWidth - rightPadding &&
        candlesWithMA.length > 0 &&
        spacing > 0
      ) {
        const index = Math.round((x - leftPadding) / spacing);
        if (index >= 0 && index < candlesWithMA.length) {
          setHoveredCandle(index);
        }
      }
    },
    [candlesWithMA]
  );

  const handleMouseLeave = useCallback(() => {
    setMousePosition(null);
    setHoveredCandle(null);
  }, []);

  return (
    <div className="candlestick-chart">
      <div className="chart-controls">
        <div className="timeframe-selector">
          {(["1s", "15m", "1H", "4H", "1D", "1W"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? "active" : ""}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        {candleInfo && (
          <div className="chart-info">
            <div className="chart-info-row">
              <span className="info-date">
                {formatDate(candleInfo.timestamp)}
              </span>
              <span className="info-label">Open:</span>
              <span className="info-value">{candleInfo.open.toFixed(2)}</span>
              <span className="info-label">High:</span>
              <span className="info-value">{candleInfo.high.toFixed(2)}</span>
              <span className="info-label">Low:</span>
              <span className="info-value">{candleInfo.low.toFixed(2)}</span>
              <span className="info-label">Close:</span>
              <span className="info-value">{candleInfo.close.toFixed(2)}</span>
              <span className="info-label">CHANGE:</span>
              <span
                className={`info-value ${
                  candleInfo.change >= 0 ? "positive" : "negative"
                }`}
              >
                {candleInfo.changePercent.toFixed(2)}%
              </span>
              <span className="info-label">AMPLITUDE:</span>
              <span className="info-value">
                {candleInfo.amplitude.toFixed(2)}%
              </span>
            </div>
            <div className="chart-info-row">
              <span className="info-label">MA(7):</span>
              <span className="info-value ma-7">
                {candleInfo.ma7 > 0 ? candleInfo.ma7.toFixed(2) : "0.00"}
              </span>
              <span className="info-label">MA(25):</span>
              <span className="info-value ma-25">
                {candleInfo.ma25 > 0 ? candleInfo.ma25.toFixed(2) : "0.00"}
              </span>
              <span className="info-label">MA(99):</span>
              <span className="info-value ma-99">
                {candleInfo.ma99 > 0 ? candleInfo.ma99.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {mousePosition &&
        hoveredCandle !== null &&
        candlesWithMA[hoveredCandle] && (
          <div
            className="price-tooltip"
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y - 30}px`,
            }}
          >
            <div>Price: {candlesWithMA[hoveredCandle].close.toFixed(2)}</div>
            <div>{formatTime(candlesWithMA[hoveredCandle].timestamp)}</div>
          </div>
        )}
    </div>
  );
};

export default CandlestickChart;
