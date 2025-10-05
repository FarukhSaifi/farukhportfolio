"use client";

import { baseURL } from "@/app/resources";
import { admin, person } from "@/app/resources/content";
import { Avatar, Button, Card, Flex, Heading, Icon, RevealFx, Text } from "@/once-ui/components";
import { useEffect, useState } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  color?: "brand" | "accent" | "neutral";
}

function StatsCard({ title, value, icon, description, color = "brand" }: StatsCardProps) {
  return (
    <Card
      padding="l"
      background="neutral-strong"
      border="neutral-medium"
      radius="m"
      fillWidth
      style={{
        minHeight: "120px",
      }}
    >
      <Flex direction="column" gap="m" alignItems="center" fillHeight justifyContent="center">
        <Text variant="body-default-s" onBackground="neutral-weak" style={{ textAlign: "center" }}>
          {title}
        </Text>
        <Text variant="heading-strong-xl" onBackground="neutral-strong">
          {value}
        </Text>
        <Icon name={icon} onBackground="neutral-weak" />
      </Flex>
    </Card>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color?: "brand" | "accent" | "neutral";
}

function QuickAction({ title, description, icon, href, color = "brand" }: QuickActionProps) {
  return (
    <RevealFx translateY="8" delay={0.2}>
      <Button
        href={href}
        variant="secondary"
        size="m"
        prefixIcon={icon}
        fillWidth
        style={{
          padding: "var(--static-space-16)",
          justifyContent: "flex-start",
          textAlign: "left",
        }}
      >
        <Flex direction="column" alignItems="flex-start" gap="xs">
          <Text variant="heading-strong-s">{title}</Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {description}
          </Text>
        </Flex>
      </Button>
    </RevealFx>
  );
}

export default function AdminDashboard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <Flex direction="column" fillWidth fillHeight background="neutral-weak" style={{ minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: admin.title,
            description: admin.description,
            url: `https://${baseURL}/admin`,
            isPartOf: {
              "@type": "WebSite",
              name: person.name,
              url: `https://${baseURL}`,
            },
          }),
        }}
      />

      {/* Header */}
      <RevealFx translateY="4" delay={0.1}>
        <Flex
          paddingX="l"
          paddingY="m"
          justifyContent="space-between"
          alignItems="center"
          fillWidth
          background="neutral-strong"
          border="neutral-medium"
          direction={isMobile ? "column" : "row"}
          gap={isMobile ? "m" : "0"}
        >
          {/* Logo */}
          <Flex gap="m" alignItems="center">
            <Icon name="document" onBackground="neutral-strong" />
            <Heading variant="heading-strong-m">SyncApp</Heading>
          </Flex>

          {/* Navigation */}
          <Flex
            gap={isMobile ? "s" : "m"}
            alignItems="center"
            direction={isMobile ? "column" : "row"}
            fillWidth={isMobile}
          >
            <Button
              variant="primary"
              size="s"
              prefixIcon="home"
              style={{
                background: "var(--neutral-background-strong)",
                color: "var(--neutral-on-background-strong)",
                minWidth: isMobile ? "100%" : "auto",
              }}
            >
              Dashboard
            </Button>
            <Button variant="secondary" size="s" prefixIcon="plus" style={{ minWidth: isMobile ? "100%" : "auto" }}>
              + New Post
            </Button>
            <Button variant="secondary" size="s" prefixIcon="settings" style={{ minWidth: isMobile ? "100%" : "auto" }}>
              Settings
            </Button>
          </Flex>

          {/* User Profile */}
          <Flex gap={isMobile ? "s" : "m"} alignItems="center" direction={isMobile ? "column" : "row"}>
            <Avatar src={person.avatar} size="s" />
            <Text variant="body-default-m">{person.name}</Text>
            <Icon name="chevronDown" onBackground="neutral-weak" />
          </Flex>
        </Flex>
      </RevealFx>

      {/* Main Content */}
      <Flex paddingX="l" paddingY="l" direction="column" gap="l" flex={1} maxWidth="xl" fillWidth>
        {/* Dashboard Header */}
        <RevealFx translateY="8" delay={0.2}>
          <Flex
            justifyContent="space-between"
            alignItems={isMobile ? "flex-start" : "center"}
            fillWidth
            direction={isMobile ? "column" : "row"}
            gap={isMobile ? "m" : "0"}
          >
            <Flex direction="column" gap="xs">
              <Heading variant="display-strong-l">Dashboard</Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Manage your blog posts and publishing status
              </Text>
            </Flex>
            <Button variant="primary" size="m" prefixIcon="plus" style={{ minWidth: isMobile ? "100%" : "auto" }}>
              + New Post
            </Button>
          </Flex>
        </RevealFx>

        {/* Stats Cards */}
        <RevealFx translateY="12" delay={0.3}>
          <Flex direction="column" gap="m">
            <Heading variant="heading-strong-s" onBackground="neutral-weak">
              Overview
            </Heading>
            <Flex
              direction={isMobile ? "column" : "row"}
              gap="m"
              fillWidth
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--static-space-16)",
              }}
            >
              <StatsCard title="Total Posts" value="0" icon="document" color="neutral" />
              <StatsCard title="Published" value="0" icon="check" color="neutral" />
              <StatsCard title="Drafts" value="0" icon="edit" color="neutral" />
              <StatsCard title="Platforms" value="0" icon="globe" color="neutral" />
            </Flex>
          </Flex>
        </RevealFx>

        {/* All Posts Section */}
        <RevealFx translateY="16" delay={0.4}>
          <Card
            padding="l"
            background="neutral-strong"
            border="neutral-medium"
            radius="m"
            fillWidth
            style={{ minHeight: "400px" }}
          >
            <Flex direction="column" gap="m" fillHeight>
              <Flex justifyContent="space-between" alignItems="center" fillWidth>
                <Heading variant="heading-strong-m">All Posts</Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  No posts yet. Create your first post to get started!
                </Text>
              </Flex>

              {/* Empty State */}
              <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                paddingY="xl"
                gap="m"
                fillWidth
                flex={1}
                style={{ minHeight: "300px" }}
              >
                <Icon name="globe" size="xl" onBackground="neutral-weak" />
                <Heading variant="heading-strong-m">No posts yet</Heading>
                <Text
                  variant="body-default-m"
                  onBackground="neutral-weak"
                  style={{ textAlign: "center", maxWidth: "400px" }}
                >
                  Start writing your first blog post to get published on Medium and DEV.to
                </Text>
                <Button variant="primary" size="m" style={{ minWidth: "200px" }}>
                  Create Your First Post
                </Button>
              </Flex>
            </Flex>
          </Card>
        </RevealFx>
      </Flex>

      {/* Footer */}
      <RevealFx translateY="20" delay={0.5}>
        <Flex justifyContent="center" paddingY="m" fillWidth>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            © 2025 SyncApp. Blog syndication made simple.
          </Text>
        </Flex>
      </RevealFx>
    </Flex>
  );
}
