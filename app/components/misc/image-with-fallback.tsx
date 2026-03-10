import { useState, type ImgHTMLAttributes } from "react";

/** SVG data URI used as fallback when an image fails to load */
const FALLBACK_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

type Props = ImgHTMLAttributes<HTMLImageElement>;

/** Drop-in <img> replacement that shows a gray placeholder on load error. */
export function ImageWithFallback({ src, alt, className, style, ...rest }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 ${className ?? ""}`}
        style={style}
      >
        <img src={FALLBACK_SRC} alt={alt} data-original-url={src} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
