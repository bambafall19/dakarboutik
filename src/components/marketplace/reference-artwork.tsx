/** Display a region of the supplied brand artwork without altering its pixels. */
export function ReferenceArtwork({
  rect,
  id,
  className,
  fill = false,
}: {
  rect: string;
  id: string;
  className?: string;
  fill?: boolean;
}) {
  const [x, y, width, height] = rect.split(" ");
  return (
    <svg
      viewBox={rect}
      preserveAspectRatio={fill ? "xMidYMid slice" : "xMidYMid meet"}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      <image
        href="/images/dakarboutik-home-reference.png"
        width="1024"
        height="1536"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}
