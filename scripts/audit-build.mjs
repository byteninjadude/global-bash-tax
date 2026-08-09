import {
  access,
  readFile,
  readdir,
} from "node:fs/promises";

import {
  join,
  relative,
  resolve,
  sep,
} from "node:path";

const projectRoot = resolve(".");
const distDirectory = join(projectRoot, "dist");

const requiredRoutes = [
  "/",
  "/tax-services/",
  "/tax-services/individual-tax-preparation/",
  "/tax-services/business-tax-preparation/",
  "/tax-services/tax-planning/",
  "/tax-services/self-employed-tax-services/",
  "/tax-services/amended-prior-year-tax-returns/",
  "/tax-services/multi-state-tax-preparation/",
  "/tax-services/real-estate-investor-tax-services/",
  "/tax-services/remote-tax-preparation/",
  "/who-we-help/",
  "/about-milana-bash/",
  "/faq/",
  "/contact/",
  "/book-tax-consultation/",
  "/privacy-policy/",
  "/terms-of-use/",
  "/website-disclaimer/",
  "/accessibility/",
  "/form-confirmation/",
];

const requiredFiles = [
  "_headers",
  "_redirects",
  "robots.txt",
  "site.webmanifest",
];

const errors = [];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function routeToFile(route) {
  if (route === "/") {
    return join(distDirectory, "index.html");
  }

  return join(
    distDirectory,
    route.replace(/^\/|\/$/g, ""),
    "index.html",
  );
}

if (!(await exists(distDirectory))) {
  throw new Error(
    "The dist folder does not exist. Run npm run build first.",
  );
}

for (const route of requiredRoutes) {
  if (!(await exists(routeToFile(route)))) {
    errors.push(`Missing route: ${route}`);
  }
}

for (const file of requiredFiles) {
  if (!(await exists(join(distDirectory, file)))) {
    errors.push(`Missing output file: /${file}`);
  }
}

const allFiles = await walk(distDirectory);
const htmlFiles = allFiles.filter((file) =>
  file.endsWith(".html")
);

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");

  const displayPath = relative(
    distDirectory,
    file,
  )
    .split(sep)
    .join("/");

  const h1Count =
    (html.match(/<h1\b/gi) ?? []).length;

  if (h1Count !== 1) {
    errors.push(
      `${displayPath}: expected one H1, found ${h1Count}`,
    );
  }

  if (
    !/<meta[^>]+name=["']description["']/i.test(
      html,
    )
  ) {
    errors.push(
      `${displayPath}: missing meta description`,
    );
  }

  if (
    /href\s*=\s*["']\s*["']/i.test(html)
  ) {
    errors.push(
      `${displayPath}: empty href found`,
    );
  }

  if (
    html.includes(
      "3275 N Arlington Heights",
    ) ||
    html.includes(
      "Arlington Heights Rd",
    )
  ) {
    errors.push(
      `${displayPath}: former office address found`,
    );
  }
}

if (errors.length > 0) {
  console.error("\nWebsite audit failed:\n");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    `Website audit passed: ${htmlFiles.length} HTML pages checked.`,
  );
}