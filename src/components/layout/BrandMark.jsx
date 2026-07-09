export default function BrandMark({ size = 40, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/picklePlay-logo.png"
        alt=""
        draggable="false"
        decoding="async"
        className="select-none"
        style={{
          width: "122%",
          height: "122%",
          objectFit: "cover",
          objectPosition: "center",
          transform: "scale(1.18)",
        }}
      />
    </span>
  );
}