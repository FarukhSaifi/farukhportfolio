import { ROUTES } from "@/lib/constants";
import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Farukh",
  lastName: "Saifi",
  name: `Farukh Saifi`,
  role: "Software Engineer",
  avatar: "/images/avatar.jpg",
  email: "farook1x95@gmail.com",
  location: "Asia/Kolkata", // New Delhi, India timezone
  languages: [], // optional: Leave the array empty if you don't want to display languages
  locale: "en", // BCP 47 language tag for the HTML lang attribute, e.g., 'en', 'ja', 'zh-TW'
};

const newsletter: Newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
  description: (
    <>
      I occasionally write about design, technology, and share thoughts on the intersection of creativity and
      engineering.
    </>
  ),
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /resources/icons.ts
  // Set essentials: true for links you want to show on the about page
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/FarukhSaifi",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/farukh-saifi",
    essential: true,
  },
  {
    name: "Instagram",
    icon: "instagram",
    link: "https://www.instagram.com/iamfarukh1",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const home: Home = {
  path: ROUTES.HOME,
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name} - Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>I&apos;m a Software Engineer and enthusiastic towards Technology.</>,
  featured: {
    display: false,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Featured</strong> <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: ROUTES.WORK,
  },
  subline: (
    <>
      I&apos;m {person.firstName}, a {person.role.toLowerCase()} at{" "}
      <Text as="span" size="xl" weight="strong">
        Earth 🌏
      </Text>
      — turning ambiguous problems into resilient, intelligent products.
    </>
  ),
};

const about: About = {
  path: ROUTES.ABOUT,
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com/farukh-saifi",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        {person.firstName} is a {person.role.toLowerCase()} with a passion for transforming complex challenges into
        simple, elegant design solutions. Their work spans digital interfaces, interactive experiences, and the
        convergence of design and technology.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "Xebia",
        timeframe: "Oct 2021 - Present",
        role: "Senior Consultant",
        achievements: [
          <>
            Embedded with enterprise clients to own outcomes end-to-end—translating financial and product requirements
            into scalable dashboards and platforms while mentoring teams on AI-assisted workflows that lifted sprint
            velocity by 40%.
          </>,
          <>
            Architected high-performance React.js and TypeScript UIs with code splitting and lazy loading, driving a 25%
            increase in engagement and a 15% reduction in load times.
          </>,
          <>
            Orchestrated migration from monoliths to distributed microfrontends and client-ready architectures,
            improving system resilience and developer satisfaction by 20%.
          </>,
          <>
            Spearheaded a design system with Tailwind CSS and Material-UI adopted by 3 cross-functional teams,
            accelerating UI delivery by 35% across forward-deployed engagements.
          </>,
          <>
            Enforced WCAG 2.1 AA accessibility with semantic HTML and ARIA across 5 enterprise platforms, achieving 100%
            accessibility compliance.
          </>,
          <>
            Scaled state management with Redux Toolkit and Context API, and introduced Agentic AI / LLM-assisted
            patterns into delivery workflows to boost maintainability and shipping speed.
          </>,
        ],
        images: [],
      },
      {
        company: "Etelligens Technologies",
        timeframe: "Feb 2020 - Oct 2021",
        role: "Frontend Engineer",
        achievements: [
          <>
            Engineered low-latency real-time backends with Node.js, Socket.io, and WebRTC—handling 5,000+ concurrent
            sessions for production client deployments.
          </>,
          <>
            Directed migration of a legacy AngularJS monolith to React, applying asset optimization that boosted runtime
            performance by 30%.
          </>,
          <>
            Mentored 3 junior engineers through structured reviews and performance standards, cutting deployment bug
            rates by 15%.
          </>,
          <>
            Partnered with native teams to ship hybrid React Native and Flutter features, increasing mobile adoption by
            20% in client-facing products.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "Jamia Millia Islamia",
        description: <>Computer Science Engineering.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Languages",
        description: (
          <>
            Proficient in modern JavaScript (ES6+) and TypeScript for type-safe applications, plus Python for backend
            and AI workflows. Strong foundation in HTML5, CSS3, JSX, and structured formats like JSON and YAML.
          </>
        ),
        tags: [
          { name: "JavaScript (ES6+)" },
          { name: "TypeScript" },
          { name: "Python" },
          { name: "HTML5" },
          { name: "CSS3" },
          { name: "JSX" },
          { name: "JSON" },
          { name: "YAML" },
        ],
        images: [],
      },
      {
        title: "AI & Developer Tools",
        description: (
          <>
            Building intelligent applications with RAG pipelines, Agentic AI systems, LangChain/LangGraph, and LLM API
            integration. Experienced with Model Context Protocol (MCP) and AI-native developer tools to accelerate
            delivery of resilient, AI-powered features.
          </>
        ),
        tags: [
          { name: "RAG" },
          { name: "Agentic AI" },
          { name: "LangChain/LangGraph" },
          { name: "AI/LLM API Integration" },
          { name: "ChatGPT" },
          { name: "Claude Code" },
          { name: "Cursor" },
          { name: "Copilot" },
          { name: "Antigravity" },
          { name: "Model Context Protocol (MCP)" },
        ],
        images: [],
      },
      {
        title: "Frontend",
        description: (
          <>
            Building modern, performant, and accessible user interfaces with React, Next.js, and Vue. Experienced in
            component-driven architecture, Redux Toolkit state management, utility-first styling, and testing with Jest.
          </>
        ),
        tags: [
          { name: "React.js" },
          { name: "Next.js" },
          { name: "Redux" },
          { name: "Redux Toolkit" },
          { name: "Vue.js" },
          { name: "Tailwind CSS" },
          { name: "Material-UI (MUI)" },
          { name: "Vite" },
          { name: "Styled Components" },
          { name: "Jest" },
        ],
        images: [],
      },
      {
        title: "Backend",
        description: (
          <>
            Designing scalable server-side architectures with Node.js, Express, FastAPI, and Flask. Experienced in
            RESTful and GraphQL APIs, real-time systems via WebRTC and WebSockets, and secure JWT authentication.
          </>
        ),
        tags: [
          { name: "Node.js" },
          { name: "Express.js" },
          { name: "FastAPI" },
          { name: "Flask" },
          { name: "GraphQL" },
          { name: "RESTful APIs" },
          { name: "WebRTC" },
          { name: "Socket.io" },
          { name: "WebSockets" },
          { name: "JWT Authentication" },
        ],
        images: [],
      },
      {
        title: "Databases",
        description: (
          <>
            Working with relational and NoSQL databases for high-scale applications, including MongoDB Atlas, CosmosDB,
            Redis, and MySQL. Experienced in vector databases and NoSQL schema design for AI-backed workloads.
          </>
        ),
        tags: [
          { name: "CosmosDB" },
          { name: "MongoDB (Atlas)" },
          { name: "Redis" },
          { name: "MySQL" },
          { name: "Vector Databases" },
          { name: "NoSQL Schema Design" },
        ],
        images: [],
      },
      {
        title: "DevOps & Cloud",
        description: (
          <>
            Streamlining delivery with Git-based workflows, Docker, CI/CD pipelines, and cloud platforms. Proficient in
            GCP, Firebase, and Jenkins for deploying and managing applications at scale.
          </>
        ),
        tags: [
          { name: "Git" },
          { name: "GitHub" },
          { name: "Docker" },
          { name: "CI/CD Pipelines" },
          { name: "GitLab" },
          { name: "Bitbucket" },
          { name: "Google Cloud Platform (GCP)" },
          { name: "Google Firebase" },
          { name: "Jenkins" },
        ],
        images: [],
      },
      {
        title: "Methodologies",
        description: (
          <>
            Applying Agile (Scrum) practices, systematic problem-solving, and performance optimization to deliver
            high-quality products collaboratively across cross-functional teams.
          </>
        ),
        tags: [
          { name: "Agile (Scrum)" },
          { name: "Problem-Solving" },
          { name: "Interpersonal Skills" },
          { name: "Performance Optimization" },
        ],
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: ROUTES.BLOG,
  label: "Blog",
  title: "Writing about design and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: ROUTES.WORK,
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/work/projects
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: ROUTES.GALLERY,
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images from https://pexels.com
  images: [
    {
      src: "/images/gallery/img-01.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-02.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-03.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-04.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-05.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-06.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-07.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-08.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-09.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-10.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-11.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-12.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-13.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-14.jpg",
      alt: "image",
      orientation: "horizontal",
    },
  ],
};

export { about, blog, gallery, home, newsletter, person, social, work };
