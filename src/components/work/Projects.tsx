import { ProjectCard } from "@/components";
import { MDX_CONTENT_PATHS, ROUTES } from "@/lib/constants";
import { getPosts } from "@/lib/mdx";
import { Grid } from "@once-ui-system/core";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export function Projects({ range, exclude }: ProjectsProps) {
  let allProjects = getPosts(MDX_CONTENT_PATHS.WORK);

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Grid columns="2" s={{ columns: 1 }} fillWidth gap="24" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          index={index}
          priority={index < 2}
          key={post.slug}
          href={`${ROUTES.WORK}/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          link={post.metadata.link || ""}
        />
      ))}
    </Grid>
  );
}
