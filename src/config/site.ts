export const site = {
  name: "Global Bash Tax Services",
  shortName: "Global Bash Tax",
  professionalName: "Milana Bash",
  professionalSuffix: "MBA",
  credential: "IRS-Registered Tax Return Preparer",

  temporaryOrigin: "https://globalbashtax.example",

  phoneDisplay: "847-454-7106",
  phoneHref: "tel:+18474547106",
  email: "taxes@globalbash.com",

  serviceModel: "Fully remote tax services",
  baseRegions: ["Illinois", "Florida"],
  languages: ["English", "Bulgarian", "Turkish"],

  realEstateLicense: "471019781",
  realEstateUrl: "https://www.globalbash.com/",

  defaultTitle:
    "Remote Tax Preparation & Planning | Milana Bash",

  defaultDescription:
    "Personalized remote tax preparation and planning for individuals, self-employed professionals, investors, and businesses with Milana Bash.",

  socialImage:
    "/images/portraits/milana-bash-hero-wide.webp",
} as const;

export const primaryNavigation = [
  { label: "Home", href: "/" },
  { label: "Tax Services", href: "/tax-services/" },
  { label: "Who We Help", href: "/who-we-help/" },
  { label: "About Milana", href: "/about-milana-bash/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contact", href: "/contact/" },
] as const;

export const serviceNavigation = [
  {
    label: "All Tax Services",
    href: "/tax-services/",
  },
  {
    label: "Individual Tax Preparation",
    href: "/tax-services/individual-tax-preparation/",
  },
  {
    label: "Business Tax Preparation",
    href: "/tax-services/business-tax-preparation/",
  },
  {
    label: "Tax Planning",
    href: "/tax-services/tax-planning/",
  },
  {
    label: "Self-Employed Tax Services",
    href: "/tax-services/self-employed-tax-services/",
  },
  {
    label: "Amended & Prior-Year Returns",
    href: "/tax-services/amended-prior-year-tax-returns/",
  },
  {
    label: "Multi-State Tax Preparation",
    href: "/tax-services/multi-state-tax-preparation/",
  },
  {
    label: "Real Estate Investor Tax Services",
    href: "/tax-services/real-estate-investor-tax-services/",
  },
  {
    label: "Remote Tax Preparation",
    href: "/tax-services/remote-tax-preparation/",
  },
] as const;

export const legalNavigation = [
  {
    label: "Privacy Policy",
    href: "/privacy-policy/",
  },
  {
    label: "Terms of Use",
    href: "/terms-of-use/",
  },
  {
    label: "Website Disclaimer",
    href: "/website-disclaimer/",
  },
  {
    label: "Accessibility",
    href: "/accessibility/",
  },
] as const;