import { InlineCode } from "@/once-ui/components";

const person = {
  firstName: "Farukh",
  lastName: "Saifi",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Software Engineer",
  avatar: "/images/avatar.jpg",
  location: "New Delhi, India", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: [], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
  description: (
    <>
      I occasionally write about design, technology, and share thoughts on the intersection of creativity and
      engineering.
    </>
  ),
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/FarukhSaifi",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/farukh-saifi",
  },
  {
    name: "X",
    icon: "x",
    link: "", // "https://x.com/iamfarukh1",
  },
  {
    name: "Email",
    icon: "email",
    link: "mailto:farook1x95@gmail.com",
  },
];

const home = {
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>I&apos;m a Software Engineer and enthusiastic towards Technology. </>,
  subline: (
    <>
      I&apos;m Farukh, a Software Engineer at <InlineCode>Earth 🌏</InlineCode>, where I craft intuitive
      <br /> user experiences. After hours, I build my own projects.
    </>
  ),
};

const about = {
  label: "About",
  title: "About me",
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
        Farukh is a Software Engineer with a passion for transforming complex challenges into simple, elegant design
        solutions. His work spans digital interfaces, interactive experiences, and the convergence of design and
        technology.
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
        images: [
          // optional: leave the array empty if you don't want to display images
          // {
          //   src: "/images/projects/project-01/cover-01.jpg",
          //   alt: "Once UI Project",
          //   width: 16,
          //   height: 9,
          // },
        ],
      },
      {
        company: "Etelligens Technologies",
        timeframe: "Feb 2020 - Sep 2021",
        role: "Software Developer",
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
            JavaScript (ES6+), TypeScript, HTML5, CSS3, JSX. Proficient in modern JavaScript features, type-safe
            development with TypeScript, and semantic HTML5 markup.
          </>
        ),
        images: [],
      },
      {
        title: "React.js",
        description: (
          <>
            React is the library for web and native user interfaces. Build user interfaces out of individual pieces
            called components written in JavaScript.
          </>
        ),
        images: [],
      },
      {
        title: "Next.js",
        description: (
          <>
            Built on a foundation of fast, production-grade tooling. Powered by React, Next.js enables server-side
            rendering, static site generation, and optimized performance.
          </>
        ),
        images: [],
      },
      {
        title: "Redux",
        description: (
          <>
            Predictable state container for JavaScript apps. Redux helps manage application state with a single source of
            truth and enables powerful debugging capabilities.
          </>
        ),
        images: [],
      },
      {
        title: "Vue.js & Vuex",
        description: (
          <>
            Progressive JavaScript framework for building user interfaces. Vue.js offers an approachable, versatile, and
            performant framework with Vuex for state management.
          </>
        ),
        images: [],
      },
      {
        title: "Frontend Libraries & Frameworks",
        description: (
          <>
            Material-UI (MUI), Ant Design, Bootstrap, Tailwind CSS. Experienced in using popular UI component libraries
            and utility-first CSS frameworks to build responsive and accessible interfaces.
          </>
        ),
        images: [],
      },
      {
        title: "Styling & CSS",
        description: (
          <>
            SASS/SCSS, styled-components, Responsive Design. Skilled in CSS preprocessors, CSS-in-JS solutions, and
            creating mobile-first, responsive layouts that work across all devices.
          </>
        ),
        images: [],
      },
      {
        title: "Node.js",
        description: (
          <>
            Node.js® is a free, open-source, cross-platform JavaScript runtime environment that lets developers create
            servers, web apps, command line tools and scripts.
          </>
        ),
        images: [],
      },
      {
        title: "Express.js",
        description: (
          <>
            Fast, unopinionated, minimalist web framework for Node.js. Express.js simplifies building robust RESTful APIs
            and web applications with a rich ecosystem of middleware.
          </>
        ),
        images: [],
      },
      {
        title: "APIs & Backend",
        description: (
          <>
            RESTful APIs, GraphQL, WebRTC, API design principles. Experienced in designing and implementing various API
            architectures, real-time communication protocols, and following best practices for scalable backend systems.
          </>
        ),
        images: [],
      },
      {
        title: "Authentication & Security",
        description: (
          <>
            Auth flow (OAuth, JWT). Skilled in implementing secure authentication mechanisms, OAuth 2.0 flows, and
            JSON Web Tokens for stateless authentication in modern web applications.
          </>
        ),
        images: [],
      },
      {
        title: "Build Tools & Bundlers",
        description: (
          <>
            Webpack, Babel, Vite. Experienced in modern build tooling for bundling, transpiling, and optimizing
            JavaScript applications for production with fast development experiences.
          </>
        ),
        images: [],
      },
      {
        title: "Package Managers & DevOps",
        description: (
          <>
            npm, yarn, Docker, Git. Proficient in package management, containerization with Docker, and version control
            with Git for collaborative development workflows.
          </>
        ),
        images: [],
      },
      // {
      //   title: "AJAX & Asynchronous Programming",
      //   description: (
      //     <>
      //       AJAX (Asynchronous JavaScript and XML) for creating dynamic, interactive web applications. Skilled in
      //       handling asynchronous operations, promises, and async/await patterns.
      //     </>
      //   ),
      //   images: [],
      // },
    ],
  },
};

const blog = {
  label: "Blog",
  title: "Writing about design and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  label: "Work",
  title: "My projects",
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};
const admin = {
  label: "Dashboard",
  title: "Admin Dashboard",
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery = {
  label: "Gallery",
  title: "My photo gallery",
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

export { about, admin, blog, gallery, home, newsletter, person, social, work };
