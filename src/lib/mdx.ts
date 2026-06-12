import fs from "fs";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import path from "path";

import { MDX_CONTENT_PATHS } from "@/lib/constants";

type MdxContentPath = (typeof MDX_CONTENT_PATHS)[keyof typeof MDX_CONTENT_PATHS];

type Team = {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
};

export type PostMetadata = {
  title: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tag?: string;
  team: Team[];
  link?: string;
};

type Metadata = PostMetadata;

function getMDXFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    notFound();
  }

  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  const metadata: Metadata = {
    title: data.title || "",
    subtitle: data.subtitle || "",
    publishedAt: data.publishedAt,
    summary: data.summary || "",
    image: data.image || "",
    images: data.images || [],
    tag: data.tag || [],
    team: data.team || [],
    link: data.link || "",
  };

  return { metadata, content };
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

const BLOG_POSTS_DIR = path.join(process.cwd(), "src", "app", "blog", "posts");
const WORK_PROJECTS_DIR = path.join(process.cwd(), "src", "app", "work", "projects");

const CONTENT_DIRS: Record<keyof typeof MDX_CONTENT_PATHS, string> = {
  BLOG: BLOG_POSTS_DIR,
  WORK: WORK_PROJECTS_DIR,
};

function contentPathKey(contentPath: MdxContentPath): keyof typeof MDX_CONTENT_PATHS {
  if (contentPath === MDX_CONTENT_PATHS.BLOG) return "BLOG";
  return "WORK";
}

export function getPosts(contentPath: MdxContentPath) {
  return getMDXData(CONTENT_DIRS[contentPathKey(contentPath)]);
}
