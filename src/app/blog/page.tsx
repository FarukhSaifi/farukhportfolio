import { Mailchimp } from "@/components";
import { BlogPostsLazy } from "@/components/blog/BlogPostsLazy";
import Post from "@/components/blog/Post";
import { getBlogPostsPaginated } from "@/lib/blog-posts";
import { API_ENDPOINTS, BLOG_CONFIG } from "@/lib/constants";
import { baseURL, blog, person } from "@/resources";
import { Column, Grid, Heading, Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: blog.title,
    description: blog.description,
    baseURL: baseURL,
    image: `${API_ENDPOINTS.OG_GENERATE}?title=${encodeURIComponent(blog.title)}`,
    path: blog.path,
  });
}

export default async function Blog() {
  const { posts: initialPosts, total } = await getBlogPostsPaginated(0, BLOG_CONFIG.INITIAL_PAGE_SIZE);

  const featured = initialPosts[0];
  const spotlight = initialPosts.slice(1, 3);
  const earlier = initialPosts.slice(3);

  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`${API_ENDPOINTS.OG_GENERATE}?title=${encodeURIComponent(blog.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/blog`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
        {blog.title}
      </Heading>
      <Column fillWidth flex={1} gap="40">
        {featured && <Post post={featured} thumbnail />}

        {spotlight.length > 0 && (
          <Grid columns="2" s={{ columns: 1 }} fillWidth gap="16">
            {spotlight.map((post) => (
              <Post key={post.slug} post={post} thumbnail direction="column" />
            ))}
          </Grid>
        )}

        <Mailchimp marginBottom="l" />

        {(earlier.length > 0 || total > BLOG_CONFIG.INITIAL_PAGE_SIZE) && (
          <Column fillWidth gap="24">
            <Heading as="h2" variant="heading-strong-xl" marginLeft="l">
              Earlier posts
            </Heading>
            <BlogPostsLazy
              initialPosts={earlier}
              total={total}
              startOffset={initialPosts.length}
              pageSize={BLOG_CONFIG.LAZY_PAGE_SIZE}
              columns="2"
              thumbnail
            />
          </Column>
        )}
      </Column>
    </Column>
  );
}
