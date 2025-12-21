import { useEffect, useRef, useState, useMemo } from "react";
import "./VirtualizedList.css";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (
    item: T,
    index: number,
    absoluteIndex: number
  ) => React.ReactNode;
  containerClassName?: string;
  innerContainerClassName?: string;
  bufferSize?: number;
}

const VirtualizedList = <T,>({
  items,
  itemHeight,
  renderItem,
  containerClassName = "",
  innerContainerClassName = "",
  bufferSize = 5,
}: VirtualizedListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const measureContainer = () => {
      if (containerRef.current && containerRef.current.clientHeight > 0) {
        const count = Math.ceil(containerRef.current.clientHeight / itemHeight);
        setVisibleCount(count);
      }
    };

    measureContainer();

    const resizeObserver = new ResizeObserver(measureContainer);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [itemHeight]);

  // Calculate which items to render based on scroll position
  const itemsToRender = useMemo(() => {
    if (!visibleCount) return [];

    const bufferStart = Math.max(0, startIndex - bufferSize);
    const bufferEnd = Math.min(
      items.length,
      startIndex + visibleCount + bufferSize
    );

    return items.slice(bufferStart, bufferEnd);
  }, [startIndex, visibleCount, items, bufferSize]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    setStartIndex(newStartIndex);
  };

  const bufferStartIndex = Math.max(0, startIndex - bufferSize);

  return (
    <div
      ref={containerRef}
      className={`virtualized-list-container ${containerClassName}`}
      onScroll={handleScroll}
    >
      <div
        className={`virtualized-list-inner ${innerContainerClassName}`}
        style={{
          height: `${items.length * itemHeight}px`,
          position: "relative",
        }}
      >
        {itemsToRender.map((item, index) => {
          const absoluteIndex = bufferStartIndex + index;
          return (
            <div
              key={absoluteIndex}
              className="virtualized-list-item"
              style={{
                position: "absolute",
                top: `${absoluteIndex * itemHeight}px`,
                height: `${itemHeight}px`,
                width: "100%",
                left: 0,
              }}
            >
              {renderItem(item, index, absoluteIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedList;
