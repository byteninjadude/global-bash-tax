export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: "General Tax Questions",
    items: [
      {
        question: "How can I legally reduce my taxes?",
        answer:
          "Lawful tax savings depend on your income, filing status, business activity, investments, expenses, and other circumstances. A professional review can help identify deductions, credits, elections, and planning opportunities that may apply.",
      },
      {
        question:
          "What deductions and tax credits do I qualify for?",
        answer:
          "Eligibility depends on your individual circumstances and supporting records. Milana reviews the relevant information and explains which deductions or credits may apply to your return.",
      },
      {
        question:
          "Why do I owe taxes after using tax software?",
        answer:
          "Tax software calculates a result from the information entered. Incorrect withholding, self-employment income, missing estimated payments, omitted income, or misunderstood questions may affect the result.",
      },
      {
        question:
          "Does professional preparation guarantee a refund?",
        answer:
          "No. A tax professional cannot guarantee a refund or a particular tax result. The outcome depends on the applicable tax rules and the facts reported on the return.",
      },
    ],
  },
  {
    title: "Business and Self-Employment",
    items: [
      {
        question:
          "What is the best business structure for tax savings?",
        answer:
          "There is no single structure that is best for every business. Income, ownership, administrative requirements, liability concerns, state rules, and long-term plans may all affect the decision.",
      },
      {
        question:
          "Which business returns does Global Bash prepare?",
        answer:
          "Global Bash prepares qualifying Forms 1120, 1120S, 1065, Schedule C filings, and applicable state returns.",
      },
      {
        question:
          "Does Global Bash provide bookkeeping?",
        answer:
          "Bookkeeping is not currently advertised as a confirmed standalone service.",
      },
      {
        question:
          "Does Global Bash process payroll or sales-tax returns?",
        answer:
          "Payroll processing and sales-tax services are not currently advertised as confirmed services.",
      },
    ],
  },
  {
    title: "Remote Tax Preparation",
    items: [
      {
        question:
          "Can the entire tax process be completed remotely?",
        answer:
          "Yes. The process can begin by phone, email, or the website consultation form. Secure document instructions are provided after the service and engagement are confirmed.",
      },
      {
        question:
          "Can I upload tax documents through the contact form?",
        answer:
          "No. Do not submit Social Security numbers, tax documents, banking details, or other sensitive personal information through a standard website form or regular email.",
      },
      {
        question:
          "Does Global Bash have a physical office?",
        answer:
          "Global Bash operates as a fully remote tax practice and does not advertise a public walk-in office.",
      },
      {
        question:
          "Which languages are available?",
        answer:
          "Tax services are available in English, Bulgarian, and Turkish.",
      },
    ],
  },
  {
    title: "Prior Returns and Tax Notices",
    items: [
      {
        question:
          "Can Global Bash amend a return prepared elsewhere?",
        answer:
          "Eligible errors or omissions may be corrected through an amended return after the original return and supporting documents are reviewed.",
      },
      {
        question:
          "Can Global Bash prepare late or prior-year returns?",
        answer:
          "Prior-year and late returns may be accepted after the years involved, available documents, and filing requirements are reviewed.",
      },
      {
        question:
          "Can Milana help with an IRS or state tax notice?",
        answer:
          "Milana may review notices, explain the filing issue involved, prepare related tax documents, or amend a return when appropriate. Broader representation or negotiation is not advertised.",
      },
    ],
  },
];