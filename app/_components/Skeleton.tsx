/**
 * Reusable Skeleton loading component.
 * Provides smooth shimmer animation instead of jarring spinners.
 *
 * Usage:
 * <Skeleton className="h-4 w-3/4 rounded-lg" />           // text line
 * <Skeleton className="h-24 w-full rounded-2xl" />         // card block
 * <Skeleton className="h-10 w-10 rounded-full" />           // circle (avatar)
 */

export default function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
