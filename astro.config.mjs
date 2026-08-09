import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site =
  process.env.PUBLIC_SITE_URL ??
  "https://globalbashtax.example";

const indexable =
  process.env.PUBLIC_NOINDEX === "false";

const excludedPaths = new Set([
  "/404/",
  "/form-confirmation/",
]);

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",

  vite: {
    css: {
      postcss: {
        plugins: [],
      },
    },
  },

  integrations: indexable
    ? [
        sitemap({
          filter(page) {
            const pathname = new URL(page).pathname;
            return !excludedPaths.has(pathname);
          },
        }),
      ]
    : [],
});