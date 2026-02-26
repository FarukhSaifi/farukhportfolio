"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Fade,
  Flex,
  IconButton,
  Line,
  Row,
  ToggleButton,
} from "@once-ui-system/core";

import { ROUTES } from "@/lib/constants";
import {
  about,
  blog,
  display,
  gallery,
  person,
  routes,
  work,
} from "@/resources";
import styles from "./Header.module.scss";
import { ThemeToggle } from "./ThemeToggle";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string; // Optionally allow locale, defaulting to 'en-GB'
};

// const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
//   const [currentTime, setCurrentTime] = useState("");

//   useEffect(() => {
//     const updateTime = () => {
//       const now = new Date();
//       const options: Intl.DateTimeFormatOptions = {
//         timeZone,
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: false,
//       };
//       const timeString = new Intl.DateTimeFormat(locale, options).format(now);
//       setCurrentTime(timeString);
//     };

//     updateTime();
//     const intervalId = setInterval(updateTime, 1000);

//     return () => clearInterval(intervalId);
//   }, [timeZone, locale]);

//   return <>{currentTime}</>;
// };

// export default TimeDisplay;

export const Header = () => {
  const pathname = usePathname() ?? "";

  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  // Toggle between light and dark
  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <Fade
        s={{ hide: true }}
        fillWidth
        position="fixed"
        height="80"
        zIndex={9}
      />
      <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        zIndex={9}
      />
      <Row
        fitHeight
        className={styles.position}
        position="sticky"
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
        data-border="rounded"
        s={{
          position: "fixed",
        }}
      >
        <Row
          paddingLeft="12"
          fillWidth
          vertical="center"
          textVariant="body-default-s"
        >
          {display.location && <Row s={{ hide: true }}>{person.location}</Row>}
        </Row>
        <Row fillWidth horizontal="center">
          <Row
            background="page"
            border="neutral-alpha-weak"
            radius="m-4"
            shadow="l"
            padding="4"
            horizontal="center"
            zIndex={1}
          >
            <Row
              gap="4"
              vertical="center"
              textVariant="body-default-s"
              suppressHydrationWarning
            >
              {routes[ROUTES.HOME] && (
                <ToggleButton
                  prefixIcon="home"
                  href={ROUTES.HOME}
                  selected={pathname === ROUTES.HOME}
                />
              )}
              <Line background="neutral-alpha-medium" vert maxHeight="24" />
              {routes[ROUTES.ABOUT] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="person"
                      href={ROUTES.ABOUT}
                      label={about.label}
                      selected={pathname === ROUTES.ABOUT}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="person"
                      href={ROUTES.ABOUT}
                      selected={pathname === ROUTES.ABOUT}
                    />
                  </Row>
                </>
              )}
              {routes[ROUTES.WORK] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="grid"
                      href={ROUTES.WORK}
                      label={work.label}
                      selected={pathname.startsWith(ROUTES.WORK)}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="grid"
                      href={ROUTES.WORK}
                      selected={pathname.startsWith(ROUTES.WORK)}
                    />
                  </Row>
                </>
              )}
              {routes[ROUTES.BLOG] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="book"
                      href={ROUTES.BLOG}
                      label={blog.label}
                      selected={pathname.startsWith(ROUTES.BLOG)}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="book"
                      href={ROUTES.BLOG}
                      selected={pathname.startsWith(ROUTES.BLOG)}
                    />
                  </Row>
                </>
              )}
              {routes[ROUTES.GALLERY] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="gallery"
                      href={ROUTES.GALLERY}
                      label={gallery.label}
                      selected={pathname.startsWith(ROUTES.GALLERY)}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="gallery"
                      href={ROUTES.GALLERY}
                      selected={pathname.startsWith(ROUTES.GALLERY)}
                    />
                  </Row>
                </>
              )}
              {display.themeSwitcher && (
                <>
                  <Line background="neutral-alpha-medium" vert maxHeight="24" />
                  <ThemeToggle />
                </>
              )}
            </Row>
          </Row>
        </Row>
        <Flex fillWidth horizontal="end" vertical="center">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <div onClick={handleThemeToggle}>
              <IconButton
                size="l"
                key={`theme-icon`}
                icon={theme === "dark" ? "sun" : "moon"}
                variant="secondary"
              />
            </div>
            {/* <Flex hide="s">{display.time && <TimeDisplay timeZone={person.location} />}</Flex> */}
          </Flex>
        </Flex>
      </Row>
    </>
  );
};
