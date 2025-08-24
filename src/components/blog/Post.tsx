"use client";

import { formatDate } from "@/app/utils/formatDate";
import { Flex, Heading, SmartImage, SmartLink, Tag, Text } from "@/once-ui/components";
import styles from "./Posts.module.scss";

interface PostProps {
  post: any;
  thumbnail: boolean;
}

export default function Post({ post, thumbnail }: PostProps) {
  const tags = post.metadata.tag?.split(",")?.map((tag: string) => tag?.trim());
  return (
    <SmartLink
      className={styles.hover}
      style={{
        textDecoration: "none",
        margin: "0",
        height: "fit-content",
      }}
      key={post.slug}
      href={`/blog/${post.slug}`}
    >
      <Flex
        position="relative"
        mobileDirection="column"
        fillWidth
        paddingY="12"
        paddingX="16"
        gap="32"
      >
        {post.metadata.image && thumbnail && (
          <Flex maxWidth={20} fillWidth className={styles.image}>
            <SmartImage
              priority
              sizes="640px"
              style={{
                cursor: "pointer",
                border: "1px solid var(--neutral-alpha-weak)",
              }}
              radius="m"
              src={post.metadata.image}
              alt={"Thumbnail of " + post.metadata.title}
              aspectRatio="16 / 9"
            />
          </Flex>
        )}
        <Flex position="relative" fillWidth gap="8" direction="column" justifyContent="center">
          <Heading as="h2" variant="heading-strong-l" wrap="balance">
            {post.metadata.title}
          </Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {formatDate(post.metadata.publishedAt, false)}
          </Text>
          {tags.length > 0 && (
            <Flex gap="8">
              {tags.map((tag: string, index: number) =>
                index < 3 ? <Tag key={index} label={tag} variant="neutral" /> : null
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </SmartLink>
  );
}
