import { getResendClient } from "@/lib/resend";
import { ApiUtils } from "@/lib/server-utils";

export type NewsletterSubscribeResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; message: string; status: number };

function getNewsletterFromAddress(): string | null {
  return process.env.RESEND_FROM?.trim() || null;
}

function getNewsletterNotifyEmail(): string | null {
  return process.env.NEWSLETTER_NOTIFY_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || null;
}

function getNewsletterSegmentId(): string | undefined {
  const segmentId = process.env.RESEND_SEGMENT_ID?.trim();
  return segmentId || undefined;
}

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  const resend = getResendClient();
  if (!resend) {
    return {
      ok: false,
      message: "Newsletter service is not configured.",
      status: 503,
    };
  }

  const from = getNewsletterFromAddress();
  if (!from) {
    return {
      ok: false,
      message: "Newsletter sender is not configured.",
      status: 503,
    };
  }

  const segmentId = getNewsletterSegmentId();
  const contactParams = {
    email,
    unsubscribed: false as const,
    ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
  };

  const { data: created, error: createError } = await resend.contacts.create(contactParams);

  let alreadySubscribed = false;

  if (createError) {
    const duplicate =
      createError.name === "validation_error" ||
      createError.message.toLowerCase().includes("already") ||
      createError.message.toLowerCase().includes("exist");

    if (!duplicate) {
      console.error("Resend contact create failed:", createError);
      return {
        ok: false,
        message: "Could not subscribe right now. Please try again later.",
        status: 502,
      };
    }

    const { error: updateError } = await resend.contacts.update({
      email,
      unsubscribed: false,
      ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
    });

    if (updateError) {
      console.error("Resend contact update failed:", updateError);
      return {
        ok: false,
        message: "Could not subscribe right now. Please try again later.",
        status: 502,
      };
    }

    alreadySubscribed = true;
  }

  const notifyEmail = getNewsletterNotifyEmail();
  if (notifyEmail && !alreadySubscribed) {
    const { error: notifyError } = await resend.emails.send(
      {
        from,
        to: [notifyEmail],
        subject: "New newsletter subscriber",
        html: `<p>A new subscriber joined your newsletter:</p><p><strong>${email}</strong></p>`,
      },
      { idempotencyKey: `newsletter-notify/${email}` },
    );

    if (notifyError) {
      console.warn("Newsletter notify email failed:", notifyError);
    }
  }

  if (!created?.id && !alreadySubscribed) {
    return { ok: true, alreadySubscribed: false };
  }

  return { ok: true, alreadySubscribed };
}

export function newsletterSubscribeResponse(result: NewsletterSubscribeResult) {
  if (!result.ok) {
    return {
      body: ApiUtils.createErrorResponse(result.message, result.status),
      status: result.status,
    };
  }

  return {
    body: ApiUtils.createSuccessResponse(
      { alreadySubscribed: result.alreadySubscribed },
      result.alreadySubscribed ? "You are already subscribed." : "Thanks for subscribing!",
    ),
    status: 200,
  };
}
