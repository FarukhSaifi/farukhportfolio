"use client";

import styles from "@/components/LazyMedia.module.scss";
import { BLOG_CONFIG } from "@/lib/constants";
import { Media } from "@once-ui-system/core";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

interface LazyMediaProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
  rootMargin?: string;
}

export function LazyMedia({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 640px",
  aspectRatio = "16 / 9",
  rootMargin = BLOG_CONFIG.INTERSECTION_ROOT_MARGIN,
}: LazyMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(priority);
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    if (priority) return;

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, rootMargin]);

  useEffect(() => {
    if (!inView || !src) return;

    const img = new Image();
    img.onload = () => setMediaReady(true);
    img.onerror = () => setMediaReady(true);
    img.src = src;
  }, [inView, src]);

  const showSkeleton = !inView || !mediaReady;
  const loadMedia = inView || priority;

  return (
    <div ref={containerRef} className={styles.container}>
      {showSkeleton && (
        <div
          className={classNames(
            styles.skeleton,
            loadMedia && styles.skeletonOverlay,
            mediaReady && styles.skeletonHidden,
          )}
          style={{ aspectRatio: aspectRatio.replace(" / ", "/") }}
          aria-hidden
        />
      )}
      {loadMedia && (
        <div className={classNames(styles.mediaWrap, mediaReady && styles.mediaWrapVisible)}>
          <Media
            priority={priority && mediaReady}
            sizes={sizes}
            border="neutral-alpha-weak"
            cursor="interactive"
            radius="l"
            src={src}
            alt={alt}
            aspectRatio={aspectRatio}
          />
        </div>
      )}
    </div>
  );
}
