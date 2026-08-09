import type { APIRoute } from "astro";

const indexable =
  import.meta.env.PUBLIC_NOINDEX === "false";

export const GET: APIRoute = ({ site }) => {
  const origin =
    site ??
    new URL(
      import.meta.env.PUBLIC_SITE_URL ??
      "https://globalbashtax.example"
    );

  const body = indexable
    ? [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${new URL("sitemap-index.xml", origin).href}`,
        "",
      ].join("\n")
    : [
        "User-agent: *",
        "Disallow: /",
        "",
      ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};