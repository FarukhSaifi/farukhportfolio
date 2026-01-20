"use client";

import { baseURL } from "@/app/resources";
import { about, person, social } from "@/app/resources/content";
import NowPlaying from "@/components/NowPlaying";
import TableOfContents from "@/components/about/TableOfContents";
import styles from "@/components/about/about.module.scss";
import { Avatar, Button, Flex, Heading, Icon, IconButton, RevealFx, SmartImage, Tag, Text } from "@/once-ui/components";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ImageType {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export default function About() {
  const searchParams = useSearchParams();
  const [spotifyStatus, setSpotifyStatus] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const spotify = searchParams?.get("spotify");
    const token = searchParams?.get("token");

    if (spotify) {
      setSpotifyStatus(spotify);
      if (token) {
        setRefreshToken(token);
      }
    }
  }, [searchParams]);

  const structure = [
    {
      title: about.intro.title,
      display: about.intro.display,
      items: [],
    },
    {
      title: about.work.title,
      display: about.work.display,
      items: about.work.experiences.map((experience) => experience.company),
    },
    {
      title: about.studies.title,
      display: about.studies.display,
      items: about.studies.institutions.map((institution) => institution.name),
    },
    {
      title: about.technical.title,
      display: about.technical.display,
      items: about.technical.skills.map((skill) => skill.title),
    },
  ];
  return (
    <Flex maxWidth="m" direction="column">
      {/* Spotify Authorization Status */}
      {spotifyStatus && (
        <Flex
          direction="column"
          fillWidth
          gap="m"
          marginBottom="xl"
          padding="l"
          background={spotifyStatus === "success" ? "brand-alpha-weak" : "accent-alpha-weak"}
          border={spotifyStatus === "success" ? "brand-alpha-medium" : "accent-alpha-medium"}
          radius="m"
        >
          <Heading variant="heading-strong-m" onBackground={spotifyStatus === "success" ? "brand-weak" : "accent-weak"}>
            {spotifyStatus === "success" ? "✅ Spotify Connected!" : "❌ Spotify Error"}
          </Heading>

          {spotifyStatus === "success" && refreshToken && (
            <>
              <Text variant="body-default-m" onBackground="brand-weak">
                Your Spotify account has been successfully connected!
              </Text>
              <Text variant="body-default-s" onBackground="brand-weak">
                <strong>Refresh Token:</strong> {refreshToken}
              </Text>
              <Text variant="body-default-xs" onBackground="brand-weak">
                Copy this token and add it to your .env.local file as SPOTIFY_REFRESH_TOKEN
              </Text>
            </>
          )}

          {spotifyStatus === "error" && (
            <Text variant="body-default-m" onBackground="accent-weak">
              There was an error connecting to Spotify. Please try again.
            </Text>
          )}
        </Flex>
      )}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: person.name,
            jobTitle: person.role,
            description: about.intro.description,
            url: `https://${baseURL}/about`,
            image: `${baseURL}/images/${person.avatar}`,
            sameAs: social
              .filter((item) => item.link && !item.link.startsWith("mailto:")) // Filter out empty links and email links
              .map((item) => item.link),
            worksFor: {
              "@type": "Organization",
              name: about.work.experiences[0]?.company || "",
            },
          }),
        }}
      />
      {about.tableOfContent.display && (
        <Flex
          style={{ left: "0", top: "50%", transform: "translateY(-50%)" }}
          position="fixed"
          paddingLeft="24"
          gap="32"
          direction="column"
          hide="s"
        >
          <TableOfContents structure={structure} about={about} />
        </Flex>
      )}
      <Flex fillWidth mobileDirection="column" justifyContent="center">
        {about.avatar.display && (
          <Flex
            className={styles.avatar}
            minWidth="160"
            paddingX="l"
            paddingBottom="xl"
            gap="m"
            flex={3}
            direction="column"
            alignItems="center"
          >
            <RevealFx translateY="4" delay={0.1} justifyContent="center" alignItems="center">
              <Avatar src={person.avatar} size="xl" />
            </RevealFx>
            <RevealFx translateY="8" delay={0.2} justifyContent="center" alignItems="center">
              <Flex gap="8" alignItems="center">
                <Icon onBackground="accent-weak" name="globe" />
                {person.location}
              </Flex>
            </RevealFx>
            {/* Spotify Now Playing Banner */}
            <RevealFx translateY="12" delay={0.3} justifyContent="center" alignItems="center">
              <NowPlaying />
            </RevealFx>
            {person.languages.length > 0 && (
              <RevealFx translateY="16" delay={0.4} justifyContent="center" alignItems="center">
                <Flex wrap gap="8">
                  {person.languages.map((language, index) => (
                    <Tag key={index} size="l">
                      {language}
                    </Tag>
                  ))}
                </Flex>
              </RevealFx>
            )}
          </Flex>
        )}
        <Flex className={styles.blockAlign} flex={9} maxWidth={40} direction="column">
          <Flex
            id={about.intro.title}
            fillWidth
            minHeight="160"
            direction="column"
            justifyContent="center"
            marginBottom="32"
          >
            {about.calendar.display && (
              <RevealFx
                translateY="4"
                delay={0.1}
                justifyContent="flex-start"
                alignItems="center"
                className="s-justify-center"
              >
                <Flex
                  fitWidth
                  border="brand-alpha-medium"
                  className={styles.blockAlign}
                  style={{
                    backdropFilter: "blur(var(--static-space-1))",
                  }}
                  background="brand-alpha-weak"
                  radius="full"
                  padding="4"
                  gap="8"
                  marginBottom="m"
                  alignItems="center"
                >
                  <Flex paddingLeft="12">
                    <Icon name="calendar" onBackground="brand-weak" />
                  </Flex>
                  <Flex paddingX="8">Schedule a call</Flex>
                  <IconButton
                    href={about.calendar.link}
                    data-border="rounded"
                    variant="secondary"
                    icon="chevronRight"
                  />
                </Flex>
              </RevealFx>
            )}
            <RevealFx
              translateY="8"
              delay={0.2}
              justifyContent="flex-start"
              alignItems="center"
              className="s-justify-center"
            >
              <Heading className={styles.textAlign} variant="display-strong-xl">
                {person.name}
              </Heading>
            </RevealFx>
            <RevealFx
              translateY="12"
              delay={0.3}
              justifyContent="flex-start"
              alignItems="center"
              className="s-justify-center"
            >
              <Text className={styles.textAlign} variant="display-default-xs" onBackground="neutral-weak">
                {person.role}
              </Text>
            </RevealFx>
            {social.length > 0 && (
              <RevealFx
                translateY="16"
                delay={0.4}
                justifyContent="flex-start"
                alignItems="center"
                className="s-justify-center"
              >
                <Flex className={styles.blockAlign} paddingTop="20" paddingBottom="8" gap="8" wrap>
                  {social.map(
                    (item) =>
                      item.link && (
                        <Button
                          key={item.name}
                          href={item.link}
                          prefixIcon={item.icon}
                          label={item.name}
                          size="s"
                          variant="secondary"
                        />
                      )
                  )}
                </Flex>
              </RevealFx>
            )}
          </Flex>

          {about.intro.display && (
            <RevealFx
              translateY="20"
              delay={0.5}
              justifyContent="flex-start"
              alignItems="center"
              className="s-justify-center"
            >
              <Flex direction="column" textVariant="body-default-l" fillWidth gap="m" marginBottom="xl">
                {about.intro.description}
              </Flex>
            </RevealFx>
          )}

          {about.work.display && (
            <>
              <RevealFx translateY="24" delay={0.6} justifyContent="flex-start" alignItems="center">
                <Heading as="h2" id={about.work.title} variant="display-strong-s" marginBottom="m">
                  {about.work.title}
                </Heading>
              </RevealFx>
              <Flex direction="column" fillWidth gap="l" marginBottom="40">
                {about.work.experiences.map((experience, index) => (
                  <RevealFx
                    key={`${experience.company}-${experience.role}-${index}`}
                    translateY={28}
                    delay={0.7 + index * 0.1}
                    justifyContent="flex-start"
                    alignItems="center"
                  >
                    <Flex fillWidth direction="column">
                      <Flex fillWidth justifyContent="space-between" alignItems="flex-end" marginBottom="4">
                        <Text id={experience.company} variant="heading-strong-l">
                          {experience.company}
                        </Text>
                        <Text variant="heading-default-xs" onBackground="neutral-weak">
                          {experience.timeframe}
                        </Text>
                      </Flex>
                      <Text variant="body-default-s" onBackground="brand-weak" marginBottom="m">
                        {experience.role}
                      </Text>
                      <Flex as="ul" direction="column" gap="16">
                        {experience.achievements.map((achievement: JSX.Element, index: number) => (
                          <Text as="li" variant="body-default-m" key={`${experience.company}-${index}`}>
                            {achievement}
                          </Text>
                        ))}
                      </Flex>
                      {experience.images.length > 0 && (
                        <Flex fillWidth paddingTop="m" paddingLeft="40" wrap>
                          {experience.images.map((image: ImageType, index) => (
                            <Flex
                              key={index}
                              border="neutral-medium"
                              radius="m"
                              minWidth={image.width}
                              height={image.height}
                            >
                              <SmartImage
                                enlarge
                                radius="m"
                                sizes={image.width.toString()}
                                alt={image.alt}
                                src={image.src}
                              />
                            </Flex>
                          ))}
                        </Flex>
                      )}
                    </Flex>
                  </RevealFx>
                ))}
              </Flex>
            </>
          )}

          {about.studies.display && (
            <>
              <RevealFx translateY="32" delay={0.8} justifyContent="flex-start" alignItems="center">
                <Heading as="h2" id={about.studies.title} variant="display-strong-s" marginBottom="m">
                  {about.studies.title}
                </Heading>
              </RevealFx>
              <Flex direction="column" fillWidth gap="l" marginBottom="40">
                {about.studies.institutions.map((institution, index) => (
                  <RevealFx
                    key={`${institution.name}-${index}`}
                    translateY={36}
                    delay={0.9 + index * 0.1}
                    justifyContent="flex-start"
                    alignItems="center"
                    className="s-justify-center"
                  >
                    <Flex fillWidth gap="4" direction="column">
                      <Text id={institution.name} variant="heading-strong-l">
                        {institution.name}
                      </Text>
                      <Text variant="heading-default-xs" onBackground="neutral-weak">
                        {institution.description}
                      </Text>
                    </Flex>
                  </RevealFx>
                ))}
              </Flex>
            </>
          )}

          {about.technical.display && (
            <>
              <RevealFx translateY="40" delay={1.0} justifyContent="flex-start" alignItems="center">
                <Heading as="h2" id={about.technical.title} variant="display-strong-s" marginBottom="40">
                  {about.technical.title}
                </Heading>
              </RevealFx>
              <Flex direction="column" fillWidth gap="l">
                {about.technical.skills.map((skill, index) => (
                  <RevealFx
                    key={`${skill}-${index}`}
                    translateY={44}
                    delay={1.1 + index * 0.1}
                    justifyContent="flex-start"
                    alignItems="center"
                    className="s-justify-center"
                  >
                    <Flex fillWidth gap="4" direction="column">
                      <Text variant="heading-strong-l">{skill.title}</Text>
                      <Text variant="body-default-m" onBackground="neutral-weak">
                        {skill.description}
                      </Text>
                      {skill.images && skill.images.length > 0 && (
                        <Flex fillWidth paddingTop="m" gap="12" wrap>
                          {skill.images.map((image: ImageType, index) => (
                            <Flex
                              key={index}
                              border="neutral-medium"
                              radius="m"
                              minWidth={image.width}
                              height={image.height}
                            >
                              <SmartImage
                                enlarge
                                radius="m"
                                sizes={image.width.toString()}
                                alt={image.alt}
                                src={image.src}
                              />
                            </Flex>
                          ))}
                        </Flex>
                      )}
                    </Flex>
                  </RevealFx>
                ))}
              </Flex>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
