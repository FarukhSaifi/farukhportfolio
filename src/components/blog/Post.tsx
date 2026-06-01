"use client";

import { LazyMedia } from "@/components/LazyMedia";
import { BlogPostListItem } from "@/lib/blog-posts";
import { ROUTES } from "@/lib/constants";
import { person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { Avatar, Card, Column, RevealFx, Row, Text } from "@once-ui-system/core";

interface PostProps {
  post: BlogPostListItem;
  thumbnail: boolean;
  direction?: "row" | "column";
  index?: number;
  priority?: boolean;
}

export default function Post({ post, thumbnail, direction, index = 0, priority = false }: PostProps) {
  const revealDelay = Math.min(index * 0.08, 0.48);

  return (
    <RevealFx fillWidth translateY={12} delay={revealDelay} speed="fast">
      <Card
        fillWidth
        href={`${ROUTES.BLOG}/${post.slug}`}
        transition="micro-medium"
        direction={direction}
        border="transparent"
        background="transparent"
        padding="4"
        radius="l-4"
        gap={direction === "column" ? undefined : "24"}
        s={{ direction: "column" }}
      >
        {post.metadata.image && thumbnail && (
          <LazyMedia
            src={post.metadata.image}
            alt={`Thumbnail of ${post.metadata.title}`}
            priority={priority}
            sizes={direction === "column" ? "(max-width: 768px) 100vw, 480px" : "(max-width: 768px) 100vw, 640px"}
          />
        )}
        <Row fillWidth>
          <Column maxWidth={28} paddingY="24" paddingX="l" gap="20" vertical="center">
            <Row gap="24" vertical="center">
              <Row vertical="center" gap="16">
                <Avatar src={person.avatar} size="s" />
                <Text variant="label-default-s">{person.name}</Text>
              </Row>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {formatDate(post.metadata.publishedAt, false)}
              </Text>
            </Row>
            <Text variant="heading-strong-l" wrap="balance">
              {post.metadata.title}
            </Text>
            {post.metadata.tag && (
              <Text variant="label-strong-s" onBackground="neutral-weak">
                {post.metadata.tag}
              </Text>
            )}
          </Column>
        </Row>
      </Card>
    </RevealFx>
  );
}
