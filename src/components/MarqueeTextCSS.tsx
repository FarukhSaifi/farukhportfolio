"use client";

import { useEffect, useRef, useState } from "react";

interface MarqueeTextCSSProps {
  children: string;
  maxWidth?: number;
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function MarqueeTextCSS({
  children,
  maxWidth = 200,
  speed = 5,
  pauseOnHover = false,
  className,
  style,
}: MarqueeTextCSSProps) {
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = textRef.current.clientWidth;
      setShouldScroll(textWidth > containerWidth);
    }
  }, [children]);

  return (
    <div
      ref={textRef}
      className={className}
      style={{
        maxWidth: `${maxWidth}px`,
        overflow: "hidden",
        whiteSpace: "nowrap",
        position: "relative",
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`marquee-content ${shouldScroll ? "marquee-scroll" : ""} ${
          pauseOnHover && isHovered ? "marquee-paused" : ""
        }`}
        style={{
          display: "inline-block",
          paddingRight: shouldScroll ? "20px" : "0",
          animationDuration: `${speed}s`,
        }}
      >
        {children}
      </div>

      <style jsx>{`
        .marquee-content {
          transition: none;
        }

        .marquee-scroll {
          animation: marquee-move linear infinite;
        }

        .marquee-paused {
          animation-play-state: paused;
        }

        @keyframes marquee-move {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
