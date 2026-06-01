"use client";

import styles from "@/components/LazyMedia.module.scss";
import { Carousel, Column, Flex, Heading, RevealFx, SmartLink, Text } from "@once-ui-system/core";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  title: string;
  content: string;
  description: string;
  link: string;
  index?: number;
}

function LazyProjectCarousel({ images, title, priority }: { images: string[]; title: string; priority?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || images.length === 0) return;

    const img = new Image();
    img.onload = () => setMediaReady(true);
    img.onerror = () => setMediaReady(true);
    img.src = images[0];
  }, [inView, images]);

  if (images.length === 0) {
    return <Flex fillWidth radius="l" background="neutral-alpha-weak" style={{ aspectRatio: "16 / 9" }} aria-hidden />;
  }

  const showSkeleton = !inView || !mediaReady;

  return (
    <div ref={containerRef} className={styles.container}>
      {showSkeleton && (
        <div
          className={classNames(styles.skeleton, inView && styles.skeletonOverlay, mediaReady && styles.skeletonHidden)}
          aria-hidden
        />
      )}
      {inView && (
        <div className={classNames(styles.mediaWrap, mediaReady && styles.mediaWrapVisible)}>
          <Carousel
            aspectRatio="16 / 9"
            priority={priority && mediaReady}
            sizes="(max-width: 768px) 100vw, 480px"
            translateY={8}
            items={images.map((image, imageIndex) => ({
              slide: image,
              alt: title,
              priority: priority && imageIndex === 0,
            }))}
          />
        </div>
      )}
    </div>
  );
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  images = [],
  title,
  content,
  description,
  link,
  priority,
  index = 0,
}) => {
  const revealDelay = Math.min(index * 0.08, 0.48);

  return (
    <RevealFx fillWidth translateY={12} delay={revealDelay} speed="fast">
      <Column fillWidth gap="m">
        <LazyProjectCarousel images={images} title={title} priority={priority} />
        <Column fillWidth paddingX="s" paddingTop="12" paddingBottom="24" gap="m">
          {title && (
            <Heading as="h2" wrap="balance" variant="heading-strong-l">
              {title}
            </Heading>
          )}
          {description?.trim() && (
            <Text
              variant="body-default-s"
              onBackground="neutral-weak"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </Text>
          )}
          {(content?.trim() || link) && (
            <Flex gap="24" wrap>
              {content?.trim() && (
                <SmartLink suffixIcon="arrowRight" style={{ margin: "0", width: "fit-content" }} href={href}>
                  <Text variant="body-default-s">About this project</Text>
                </SmartLink>
              )}
              {link && (
                <SmartLink
                  suffixIcon="arrowUpRightFromSquare"
                  style={{ margin: "0", width: "fit-content" }}
                  href={link}
                  aria-label={`View project ${title}`}
                >
                  <Text variant="body-default-s">View project</Text>
                </SmartLink>
              )}
            </Flex>
          )}
        </Column>
      </Column>
    </RevealFx>
  );
};
