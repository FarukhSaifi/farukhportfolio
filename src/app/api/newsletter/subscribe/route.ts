import { HTTP_STATUS } from "@/lib/constants";
import { newsletterSubscribeResponse, subscribeToNewsletter } from "@/lib/newsletter";
import { ApiUtils } from "@/lib/server-utils";
import { getEmailValidationError } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

type SubscribeBody = {
  email?: string;
  website?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubscribeBody;
    const email = body.email?.trim().toLowerCase() ?? "";
    const honeypot = body.website?.trim();

    if (honeypot) {
      return NextResponse.json(
        ApiUtils.createSuccessResponse({ alreadySubscribed: false }, "Thanks for subscribing!"),
        { status: HTTP_STATUS.OK },
      );
    }

    const validationError = getEmailValidationError(email);
    if (validationError) {
      return NextResponse.json(ApiUtils.createErrorResponse(validationError, HTTP_STATUS.BAD_REQUEST), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const result = await subscribeToNewsletter(email);
    const { body: responseBody, status } = newsletterSubscribeResponse(result);

    return NextResponse.json(responseBody, { status });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      ApiUtils.createErrorResponse(
        "Could not subscribe right now. Please try again later.",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
