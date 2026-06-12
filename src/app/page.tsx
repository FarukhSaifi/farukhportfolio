import { API_ENDPOINTS, ROUTES } from "@/lib/constants";
import { about, baseURL, home, person, routes } from "@/resources";
import { Avatar, Badge, Button, Column, Heading, Line, Meta, RevealFx, Row, Schema, Text } from "@once-ui-system/core";
import dynamic from "next/dynamic";

const Posts = dynamic(() => import("@/components/blog/Posts").then((mod) => mod.Posts));
const Mailchimp = dynamic(() => import("@/components").then((mod) => mod.Mailchimp));

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  return (
    <Column maxWidth="m" gap="xl" paddingY="12" fillWidth horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`${API_ENDPOINTS.OG_GENERATE}?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column fillWidth horizontal="center" gap="m">
        <Column maxWidth="s" horizontal="center" align="center">
          {home.featured.display && (
            <RevealFx
              revealedByDefault={true}
              fillWidth
              horizontal="center"
              paddingTop="16"
              paddingBottom="32"
              paddingLeft="12"
            >
              <Badge
                background="brand-alpha-weak"
                paddingX="12"
                paddingY="4"
                onBackground="neutral-strong"
                textVariant="label-default-s"
                arrow={false}
                href={home.featured.href}
              >
                <Row paddingY="2">{home.featured.title}</Row>
              </Badge>
            </RevealFx>
          )}
          <RevealFx revealedByDefault={true} translateY="4" fillWidth horizontal="center" paddingBottom="16">
            <Heading wrap="balance" variant="display-strong-l">
              {home.headline}
            </Heading>
          </RevealFx>
          <RevealFx
            revealedByDefault={true}
            translateY="8"
            delay={0.1}
            fillWidth
            horizontal="center"
            paddingBottom="32"
          >
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {home.subline}
            </Text>
          </RevealFx>
          <RevealFx paddingTop="12" delay={0.2} horizontal="center" paddingLeft="12">
            <Button
              id="about"
              data-border="rounded"
              href={about.path}
              variant="secondary"
              size="m"
              weight="default"
              arrowIcon
            >
              <Row gap="8" vertical="center" paddingRight="4">
                {about.avatar.display && (
                  <Avatar marginRight="8" style={{ marginLeft: "-0.75rem" }} src={person.avatar} size="m" />
                )}
                {about.title}
              </Row>
            </Button>
          </RevealFx>
        </Column>
      </Column>
      {routes[ROUTES.BLOG] && (
        <Column fillWidth gap="24" marginBottom="l">
          <Row fillWidth s={{ hide: true }}>
            <Line maxWidth={48} />
          </Row>
          <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            <Row flex={1} fillWidth>
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Latest from the blog
              </Heading>
            </Row>
            <Row flex={3} fillWidth>
              <Posts range={[1, 2]} columns="2" />
            </Row>
          </Row>
          <Row fillWidth horizontal="end" s={{ hide: true }}>
            <Line maxWidth={48} />
          </Row>
        </Column>
      )}
      <Mailchimp />
    </Column>
  );
}
