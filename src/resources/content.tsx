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
      , where I craft intuitive <br /> user experiences. After hours, I build my own projects.
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
          <>Implemented cost-effective solutions, resulting in a 20% reduction in project expenses.</>,
          <>Streamlined project workflows, enhancing overall efficiency by 25%.</>,
          <>
            Collaborated with designers to translate UI/UX wireframes into high-quality code, ensuring a seamless user
            experience.
          </>,
          <>
            Optimized web applications for maximum speed and scalability, implementing best practices for performance
            improvement.
          </>,
        ],
        images: [],
      },
      {
        company: "Etelligens Technologies",
        timeframe: "Feb 2020 - Sep 2021",
        role: "Frontend Developer",
        achievements: [
          <>
            Skilled in using Frontend frameworks like React and Vue to build products and integrate features according
            to client needs.
          </>,
          <>
            Proven proficiency as a backend developer utilizing Node.js with Express.js, Socket.io, and WebRTC to create
            API endpoints.
          </>,
          <>
            Able to manage multiple software projects simultaneously, actively participating in the entire software
            development process from inception to delivery.
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
            JavaScript (ES6+), TypeScript, HTML5, CSS3, JSON, JSX. Proficient in modern JavaScript features, type-safe
            development with TypeScript, semantic HTML5 markup, and structured data interchange with JSON.
          </>
        ),
        tags: [
          { name: "JavaScript" },
          { name: "TypeScript" },
          { name: "HTML" },
          { name: "CSS" },
          { name: "JSON" },
          { name: "JSX" },
        ],
        images: [],
      },
      {
        title: "Frontend",
        description: (
          <>
            Building modern, performant, and accessible user interfaces with industry-leading frameworks and libraries.
            Experienced in component-driven architecture, state management, utility-first styling, and comprehensive
            testing to deliver polished, production-ready applications.
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
            Designing and building scalable server-side architectures, RESTful and GraphQL APIs, real-time communication
            systems, and secure authentication flows. Experienced in creating robust backend services that power modern
            web applications.
          </>
        ),
        tags: [
          { name: "Node.js" },
          { name: "Express.js" },
          { name: "GraphQL" },
          { name: "RESTful APIs" },
          { name: "WebRTC" },
          { name: "Socket.io" },
          { name: "JWT Authentication" },
        ],
        images: [],
      },
      {
        title: "DevOps & Cloud",
        description: (
          <>
            Streamlining development workflows with cloud platforms, containerization, and continuous integration and
            delivery pipelines. Proficient in deploying and managing applications at scale with modern DevOps practices
            and infrastructure tooling.
          </>
        ),
        tags: [
          { name: "Google Cloud Platform (GCP)" },
          { name: "Git" },
          { name: "Google Firebase" },
          { name: "CI/CD Pipelines" },
          { name: "Docker" },
          { name: "Jenkins" },
          { name: "Webpack" },
        ],
        images: [],
      },
      {
        title: "AI & Developer Tools",
        description: (
          <>
            Integrating artificial intelligence capabilities into applications through LLM APIs, Retrieval-Augmented
            Generation (RAG), and AI agent architectures. Leveraging cutting-edge developer tools and AI-powered coding
            assistants to accelerate development and deliver intelligent features.
          </>
        ),
        tags: [
          { name: "AI/LLM API Integration" },
          { name: "RAG" },
          { name: "AI Agents" },
          { name: "ChatGPT" },
          { name: "Claude" },
          { name: "Cursor" },
          { name: "Copilot" },
          { name: "Antigravity" },
        ],
        images: [],
      },
      {
        title: "Methodologies & Core Skills",
        description: (
          <>
            Applying proven software development methodologies and strong interpersonal skills to deliver high-quality
            products collaboratively. Experienced in Agile workflows, systematic problem-solving, and performance
            optimization to ensure efficient, well-architected solutions.
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
