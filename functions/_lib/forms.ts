export type FormKind =
  | "contact"
  | "consultation"
  | "lead";

export interface Env {
  ENVIRONMENT?: string;

  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_HOSTNAMES?: string;

  RESEND_API_KEY?: string;
  FORM_FROM_EMAIL?: string;
  FORM_NOTIFICATION_EMAIL?: string;

  ALLOWED_ORIGINS?: string;
}

interface TurnstileResult {
  success: boolean;
  hostname?: string;
  "error-codes"?: string[];
}

interface Submission {
  replyTo: string;
  subject: string;
  fields: Array<[string, string]>;
}

class FormError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "FormError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const MAX_BODY_BYTES = 64_000;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SERVICE_OPTIONS = new Set([
  "individual-tax-preparation",
  "business-tax-preparation",
  "tax-planning",
  "self-employed-tax-services",
  "amended-return",
  "prior-year-return",
  "multi-state-tax-preparation",
  "real-estate-investor-tax",
  "tax-notice-assistance",
  "not-sure",
]);

function clean(
  value: FormDataEntryValue | undefined,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\0/g, "")
    .trim();
}

function json(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control":
          "no-store, max-age=0",
        "X-Content-Type-Options":
          "nosniff",
        "X-Frame-Options":
          "DENY",
        "Referrer-Policy":
          "strict-origin-when-cross-origin",
      },
    },
  );
}

function wantsHtml(
  request: Request,
): boolean {
  const accept =
    request.headers.get("accept") ?? "";

  return (
    accept.includes("text/html") &&
    !accept.includes("application/json")
  );
}

function successResponse(
  request: Request,
  kind: FormKind,
  requestId: string,
): Response {
  if (wantsHtml(request)) {
    const target = new URL(
      "/form-confirmation/",
      request.url,
    );

    target.searchParams.set(
      "type",
      kind,
    );

    return Response.redirect(
      target.toString(),
      303,
    );
  }

  return json({
    ok: true,
    requestId,
  });
}

function errorResponse(
  request: Request,
  error: FormError,
  requestId: string,
): Response {
  if (wantsHtml(request)) {
    return new Response(
      [
        "The form could not be submitted.",
        "",
        error.message,
        "",
        "Please return to the previous page and try again.",
      ].join("\n"),
      {
        status: error.status,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
          "Cache-Control":
            "no-store, max-age=0",
          "X-Content-Type-Options":
            "nosniff",
        },
      },
    );
  }

  return json(
    {
      ok: false,
      message: error.message,
      fieldErrors: error.fieldErrors,
      requestId,
    },
    error.status,
  );
}

function requireField(
  data: FormData,
  errors: Record<string, string>,
  key: string,
  label: string,
  maxLength: number,
  minLength = 1,
): string {
  const value = clean(data.get(key) ?? undefined);

  if (!value) {
    errors[key] =
      `${label} is required.`;

    return "";
  }

  if (value.length < minLength) {
    errors[key] =
      `${label} is too short.`;
  }

  if (value.length > maxLength) {
    errors[key] =
      `${label} is too long.`;
  }

  return value;
}

function optionalField(
  data: FormData,
  errors: Record<string, string>,
  key: string,
  label: string,
  maxLength: number,
): string {
  const value = clean(data.get(key) ?? undefined);

  if (value.length > maxLength) {
    errors[key] =
      `${label} is too long.`;
  }

  return value;
}

function validateEmail(
  email: string,
  errors: Record<string, string>,
): void {
  if (
    email &&
    !EMAIL_PATTERN.test(email)
  ) {
    errors.email =
      "Enter a valid email address.";
  }
}

function validatePhone(
  phone: string,
  errors: Record<string, string>,
  required: boolean,
): void {
  if (!phone && !required) {
    return;
  }

  const digits =
    phone.replace(/\D/g, "");

  if (
    digits.length < 7 ||
    digits.length > 15
  ) {
    errors.phone =
      "Enter a valid phone number.";
  }
}

function requireConsent(
  data: FormData,
  errors: Record<string, string>,
): void {
  if (
    clean(data.get("consent") ?? undefined) !==
    "yes"
  ) {
    errors.consent =
      "Consent is required.";
  }
}

function throwIfInvalid(
  errors: Record<string, string>,
): void {
  if (
    Object.keys(errors).length > 0
  ) {
    throw new FormError(
      400,
      "Review the form fields and try again.",
      errors,
    );
  }
}

function validateContact(
  data: FormData,
): Submission {
  const errors: Record<string, string> = {};

  const name = requireField(
    data,
    errors,
    "name",
    "Name",
    100,
    2,
  );

  const email = requireField(
    data,
    errors,
    "email",
    "Email",
    160,
  );

  const phone = optionalField(
    data,
    errors,
    "phone",
    "Phone",
    30,
  );

  const subject = requireField(
    data,
    errors,
    "subject",
    "Subject",
    140,
    3,
  );

  const message = requireField(
    data,
    errors,
    "message",
    "Message",
    3000,
    10,
  );

  validateEmail(
    email,
    errors,
  );

  validatePhone(
    phone,
    errors,
    false,
  );

  requireConsent(
    data,
    errors,
  );

  throwIfInvalid(errors);

  return {
    replyTo: email,
    subject:
      "[Global Bash Tax] New contact inquiry",
    fields: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone || "Not provided"],
      ["Subject", subject],
      ["Message", message],
    ],
  };
}

function validateConsultation(
  data: FormData,
): Submission {
  const errors: Record<string, string> = {};

  const firstName = requireField(
    data,
    errors,
    "firstName",
    "First name",
    60,
  );

  const lastName = requireField(
    data,
    errors,
    "lastName",
    "Last name",
    60,
  );

  const email = requireField(
    data,
    errors,
    "email",
    "Email",
    160,
  );

  const phone = requireField(
    data,
    errors,
    "phone",
    "Phone",
    30,
  );

  const service = requireField(
    data,
    errors,
    "service",
    "Service",
    80,
  );

  const contactMethod = optionalField(
    data,
    errors,
    "contactMethod",
    "Contact method",
    20,
  );

  const language = optionalField(
    data,
    errors,
    "language",
    "Language",
    20,
  );

  const clientType = optionalField(
    data,
    errors,
    "clientType",
    "Client type",
    40,
  );

  const taxYears = optionalField(
    data,
    errors,
    "taxYears",
    "Tax years",
    100,
  );

  const states = optionalField(
    data,
    errors,
    "states",
    "States",
    160,
  );

  const message = requireField(
    data,
    errors,
    "message",
    "Brief description",
    3000,
    10,
  );

  validateEmail(
    email,
    errors,
  );

  validatePhone(
    phone,
    errors,
    true,
  );

  if (
    service &&
    !SERVICE_OPTIONS.has(service)
  ) {
    errors.service =
      "Select a valid service.";
  }

  requireConsent(
    data,
    errors,
  );

  throwIfInvalid(errors);

  return {
    replyTo: email,
    subject:
      "[Global Bash Tax] New consultation request",
    fields: [
      [
        "Name",
        `${firstName} ${lastName}`,
      ],
      ["Email", email],
      ["Phone", phone],
      [
        "Preferred contact method",
        contactMethod || "Not specified",
      ],
      [
        "Preferred language",
        language || "Not specified",
      ],
      [
        "Client type",
        clientType || "Not specified",
      ],
      ["Service", service],
      [
        "Tax year or years",
        taxYears || "Not provided",
      ],
      [
        "States involved",
        states || "Not provided",
      ],
      ["Description", message],
    ],
  };
}

function validateLead(
  data: FormData,
): Submission {
  const errors: Record<string, string> = {};

  const name = requireField(
    data,
    errors,
    "name",
    "Name",
    100,
    2,
  );

  const email = requireField(
    data,
    errors,
    "email",
    "Email",
    160,
  );

  const phone = optionalField(
    data,
    errors,
    "phone",
    "Phone",
    30,
  );

  const message = optionalField(
    data,
    errors,
    "message",
    "Message",
    1000,
  );

  validateEmail(
    email,
    errors,
  );

  validatePhone(
    phone,
    errors,
    false,
  );

  requireConsent(
    data,
    errors,
  );

  throwIfInvalid(errors);

  return {
    replyTo: email,
    subject:
      "[Global Bash Tax] New website lead",
    fields: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone || "Not provided"],
      ["Message", message || "Not provided"],
    ],
  };
}

function validateSubmission(
  kind: FormKind,
  data: FormData,
): Submission {
  switch (kind) {
    case "contact":
      return validateContact(data);

    case "consultation":
      return validateConsultation(data);

    case "lead":
      return validateLead(data);
  }
}

function validateOrigin(
  request: Request,
  env: Env,
): void {
  const fetchSite =
    request.headers.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    throw new FormError(
      403,
      "The form request was rejected.",
    );
  }

  const origin =
    request.headers.get("origin");

  if (!origin) {
    return;
  }

  const requestOrigin =
    new URL(request.url).origin;

  const configuredOrigins =
    env.ALLOWED_ORIGINS
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  const allowedOrigins =
    new Set([
      requestOrigin,
      ...configuredOrigins,
    ]);

  if (!allowedOrigins.has(origin)) {
    throw new FormError(
      403,
      "The form request was rejected.",
    );
  }
}

async function validateTurnstile(
  request: Request,
  env: Env,
  token: string,
): Promise<void> {
  const production =
    env.ENVIRONMENT === "production";

  if (!env.TURNSTILE_SECRET_KEY) {
    if (production) {
      throw new FormError(
        500,
        "The form security service is not configured.",
      );
    }

    return;
  }

  if (!token) {
    throw new FormError(
      400,
      "Complete the security verification and try again.",
    );
  }

  const body = new FormData();

  body.set(
    "secret",
    env.TURNSTILE_SECRET_KEY,
  );

  body.set(
    "response",
    token,
  );

  const remoteIp =
    request.headers.get(
      "CF-Connecting-IP",
    );

  if (remoteIp) {
    body.set(
      "remoteip",
      remoteIp,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
      },
    );
  } catch {
    throw new FormError(
      503,
      "The security verification service is temporarily unavailable.",
    );
  }

  if (!response.ok) {
    throw new FormError(
      503,
      "The security verification service is temporarily unavailable.",
    );
  }

  const result =
    await response.json() as TurnstileResult;

  if (!result.success) {
    throw new FormError(
      400,
      "The security verification was unsuccessful. Please try again.",
    );
  }

  const allowedHostnames =
    env.TURNSTILE_HOSTNAMES
      ?.split(",")
      .map((hostname) =>
        hostname.trim().toLowerCase(),
      )
      .filter(Boolean) ?? [];

  if (allowedHostnames.length > 0) {
    const hostname =
      result.hostname
        ?.trim()
        .toLowerCase();

    if (
      !hostname ||
      !allowedHostnames.includes(hostname)
    ) {
      throw new FormError(
        403,
        "The security verification hostname was rejected.",
      );
    }
  }
}

function buildEmailText(
  request: Request,
  kind: FormKind,
  requestId: string,
  submission: Submission,
): string {
  const source =
    request.headers.get("referer") ??
    new URL(request.url).origin;

  return [
    "Global Bash Tax Services",
    "New website form submission",
    "",
    `Form: ${kind}`,
    `Reference: ${requestId}`,
    `Received: ${new Date().toISOString()}`,
    `Source: ${source}`,
    "",
    ...submission.fields.flatMap(
      ([label, value]) => [
        `${label}:`,
        value,
        "",
      ],
    ),
    "Security reminder:",
    "Do not request sensitive tax documents through ordinary email.",
  ].join("\n");
}

async function sendEmail(
  request: Request,
  env: Env,
  kind: FormKind,
  requestId: string,
  submission: Submission,
): Promise<void> {
  if (
    !env.RESEND_API_KEY ||
    !env.FORM_FROM_EMAIL ||
    !env.FORM_NOTIFICATION_EMAIL
  ) {
    throw new FormError(
      503,
      "Email delivery is not configured yet.",
    );
  }

  const recipients =
    env.FORM_NOTIFICATION_EMAIL
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

  if (recipients.length === 0) {
    throw new FormError(
      503,
      "The notification recipient is not configured.",
    );
  }

  let response: Response;

  try {
    response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          from: env.FORM_FROM_EMAIL,
          to: recipients,
          reply_to: submission.replyTo,
          subject: submission.subject,
          text: buildEmailText(
            request,
            kind,
            requestId,
            submission,
          ),
        }),
      },
    );
  } catch {
    throw new FormError(
      502,
      "The notification service is temporarily unavailable.",
    );
  }

  if (!response.ok) {
    console.error(
      "Email delivery failed",
      {
        requestId,
        formKind: kind,
        status: response.status,
      },
    );

    throw new FormError(
      502,
      "The form could not be delivered. Please call or email Global Bash directly.",
    );
  }
}

export async function handleFormSubmission(
  request: Request,
  env: Env,
  kind: FormKind,
): Promise<Response> {
  const requestId =
    crypto.randomUUID();

  try {
    const contentLength =
      Number(
        request.headers.get(
          "content-length",
        ) ?? 0,
      );

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BODY_BYTES
    ) {
      throw new FormError(
        413,
        "The submitted form is too large.",
      );
    }

    validateOrigin(
      request,
      env,
    );

    const data =
      await request.formData();

    if (
      clean(
        data.get("company") ?? undefined,
      )
    ) {
      return successResponse(
        request,
        kind,
        requestId,
      );
    }

    const submission =
      validateSubmission(
        kind,
        data,
      );

    await validateTurnstile(
      request,
      env,
      clean(
        data.get(
          "cf-turnstile-response",
        ) ?? undefined,
      ),
    );

    await sendEmail(
      request,
      env,
      kind,
      requestId,
      submission,
    );

    return successResponse(
      request,
      kind,
      requestId,
    );
  } catch (error) {
    if (error instanceof FormError) {
      return errorResponse(
        request,
        error,
        requestId,
      );
    }

    console.error(
      "Unexpected form error",
      {
        requestId,
        formKind: kind,
      },
    );

    return errorResponse(
      request,
      new FormError(
        500,
        "An unexpected error occurred. Please call or email Global Bash directly.",
      ),
      requestId,
    );
  }
}