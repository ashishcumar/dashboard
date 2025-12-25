import "./Skeleton.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const Skeleton = ({ width, height, borderRadius, className = "" }: SkeletonProps) => {
  const style: React.CSSProperties = {
    width: width || "100%",
    height: height || "1em",
    borderRadius: borderRadius || "4px",
  };

  return <div className={`skeleton ${className}`} style={style} />;
};

export const SkeletonText = ({ lines = 1, className = "" }: { lines?: number; className?: string }) => {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="0.8em" className="skeleton-line" />
      ))}
    </div>
  );
};

export default Skeleton;

