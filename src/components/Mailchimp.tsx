"use client";

import { useToast } from "@/hooks/useToast";
import { getEmailValidationError } from "@/lib/validation";
import { mailchimp, newsletter } from "@/resources";
import type { OnceUiOpacity } from "@/types";
import { Background, Button, Column, Heading, Input, Row, SpacingToken, Text } from "@once-ui-system/core";
import { FormEvent, useMemo, useState } from "react";

export const Mailchimp: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const validationError = useMemo(() => getEmailValidationError(email), [email]);
  const canSubmit = !validationError && !isSubmitting;

  const validate = (value: string) => {
    const message = getEmailValidationError(value);
    setError(message ?? "");
    return message === null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (touched) {
      validate(value);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validate(email);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    const trimmedEmail = email.trim();
    if (!validate(trimmedEmail)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const website = (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, website }),
      });

      const json = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !json.success) {
        showError("Subscription failed", json.message || "Please try again later.");
        return;
      }

      success("Subscribed!", json.message || "Thanks for subscribing!");
      setEmail("");
      setError("");
      setTouched(false);
    } catch {
      showError("Subscription failed", "Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (newsletter.display === false) return null;

  return (
    <Column
      overflow="hidden"
      fillWidth
      padding="xl"
      radius="l"
      marginBottom="m"
      horizontal="center"
      align="center"
      background="surface"
      border="neutral-alpha-weak"
      {...flex}
    >
      <Background
        top="0"
        position="absolute"
        mask={{
          x: mailchimp.effects.mask.x,
          y: mailchimp.effects.mask.y,
          radius: mailchimp.effects.mask.radius,
          cursor: mailchimp.effects.mask.cursor,
        }}
        gradient={{
          display: mailchimp.effects.gradient.display,
          opacity: mailchimp.effects.gradient.opacity as OnceUiOpacity,
          x: mailchimp.effects.gradient.x,
          y: mailchimp.effects.gradient.y,
          width: mailchimp.effects.gradient.width,
          height: mailchimp.effects.gradient.height,
          tilt: mailchimp.effects.gradient.tilt,
          colorStart: mailchimp.effects.gradient.colorStart,
          colorEnd: mailchimp.effects.gradient.colorEnd,
        }}
        dots={{
          display: mailchimp.effects.dots.display,
          opacity: mailchimp.effects.dots.opacity as OnceUiOpacity,
          size: mailchimp.effects.dots.size as SpacingToken,
          color: mailchimp.effects.dots.color,
        }}
        grid={{
          display: mailchimp.effects.grid.display,
          opacity: mailchimp.effects.grid.opacity as OnceUiOpacity,
          color: mailchimp.effects.grid.color,
          width: mailchimp.effects.grid.width,
          height: mailchimp.effects.grid.height,
        }}
        lines={{
          display: mailchimp.effects.lines.display,
          opacity: mailchimp.effects.lines.opacity as OnceUiOpacity,
          size: mailchimp.effects.lines.size as SpacingToken,
          thickness: mailchimp.effects.lines.thickness,
          angle: mailchimp.effects.lines.angle,
          color: mailchimp.effects.lines.color,
        }}
      />
      <Column maxWidth="xs" horizontal="center">
        <Heading marginBottom="s" variant="display-strong-xs">
          {newsletter.title}
        </Heading>
        <Text wrap="balance" marginBottom="l" variant="body-default-l" onBackground="neutral-weak">
          {newsletter.description}
        </Text>
      </Column>
      <form
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
        onSubmit={handleSubmit}
        noValidate
        id="newsletter-subscribe-form"
        name="newsletter-subscribe-form"
      >
        <Row fillWidth maxWidth={24} s={{ direction: "column" }} gap="8">
          <label
            htmlFor="newsletter-email"
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: "0",
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: "0",
            }}
          >
            Email address
          </label>
          <Input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            value={email}
            disabled={isSubmitting}
            onChange={handleChange}
            onBlur={handleBlur}
            errorMessage={touched ? error : ""}
            aria-invalid={touched && Boolean(validationError)}
          />
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-5000px" }}
          />
          <Row height="48" vertical="center">
            <Button type="submit" size="m" fillWidth disabled={!canSubmit}>
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </Row>
        </Row>
      </form>
    </Column>
  );
};
