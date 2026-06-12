import { Mailchimp } from "@/components";
import Post from "@/components/blog/Post";
import { getBlogPosts } from "@/lib/blog-posts";
import { API_ENDPOINTS } from "@/lib/constants";
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
  const allPosts = await getBlogPosts();
  const posts = allPosts.map(({ content: _content, ...rest }) => rest);

  const featured = posts[0];
  const spotlight = posts.slice(1, 3);
  const earlier = posts.slice(3);

  return (
    <Column maxWidth="m" paddingTop="24" fillWidth>
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
      <Heading marginBottom="l" variant="heading-strong-xl">
        {blog.title}
      </Heading>
      <Column fillWidth flex={1} gap="40">
        {featured && <Post post={featured} thumbnail index={0} priority />}

        {spotlight.length > 0 && (
          <Grid columns="2" s={{ columns: 1 }} fillWidth gap="16">
            {spotlight.map((post, index) => (
              <Post key={post.slug} post={post} thumbnail direction="column" index={index + 1} priority={index === 0} />
            ))}
          </Grid>
        )}

        {earlier.length > 0 && (
          <Column fillWidth gap="24">
            <Heading as="h2" variant="heading-strong-xl">
              Earlier posts
            </Heading>
            <Grid columns="2" s={{ columns: 1 }} fillWidth gap="16">
              {earlier.map((post, index) => (
                <Post key={post.slug} post={post} thumbnail index={index + 3} />
              ))}
            </Grid>
          </Column>
        )}

        <Mailchimp marginBottom="l" />
      </Column>
    </Column>
  );
}
