"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import type { Point } from "@/lib/vision/body";

/**
 * An image (or video frame) with an SVG overlay in the media's own pixel coordinates.
 * Taps are reported in those coordinates so measurements never depend on screen size.
 */
export function Stage({
  src,
  width,
  height,
  children,
  onTap,
  media,
}: {
  src?: string;
  width: number;
  height: number;
  children?: ReactNode;
  onTap?: (p: Point) => void;
  media?: ReactNode;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const tap = (e: PointerEvent<SVGSVGElement>) => {
    if (!onTap || !svg.current) return;
    const r = svg.current.getBoundingClientRect();
    onTap({ x: ((e.clientX - r.left) / r.width) * width, y: ((e.clientY - r.top) / r.height) * height });
  };
  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: `${width} / ${height}`, maxHeight: "70vh", maxWidth: `calc(70vh * ${width / height})` }}>
      {media ?? (src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-contain" draggable={false} />
      ))}
      <svg
        ref={svg}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 size-full touch-none"
        onPointerDown={tap}
        style={{ cursor: onTap ? "crosshair" : "default" }}
      >
        {children}
      </svg>
    </div>
  );
}

/** Stroke width that looks the same on screen whatever the media resolution. */
export const strokeFor = (w: number) => Math.max(2, w / 300);
