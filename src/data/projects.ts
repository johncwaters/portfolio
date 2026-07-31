export interface Project {
  title: string;
  description: string;
  impact: string;
  stack: string[];
  href?: string;
}

export const projects: Project[] = [
  {
    title: "AI Engineering Agent Platform",
    description: "An AI agent platform that executes real development workflows against Azure DevOps: typed run journals, crash-resume durability, model routing, and its own CI pipeline.",
    impact: "Automates routine engineering work end to end and serves as the org's reference implementation for infrastructure-as-code patterns.",
    stack: ["Python", "pydantic-ai", "Azure DevOps", "Bicep"],
  },
  {
    title: "Self-Healing Email Ticket Parser",
    description: "Parses 811 locate-ticket emails from dozens of inconsistent formats. Unknown formats trigger a single LLM call that generates a reusable static extraction profile.",
    impact: "Zero AI calls on the hot path: deterministic, auditable parsing that gets smarter without getting slower or costlier.",
    stack: ["Python", "LLM architecture", "Parsing"],
    href: "/blog/self-healing-email-parser",
  },
  {
    title: "Infrastructure and Access as Code",
    description: "Root-caused a production deploy 403 to a hand-edited Azure role shared by three services, then codified IAM in Bicep with a what-if drift gate in CI.",
    impact: "Deploy permissions are versioned, reviewed, and drift-checked instead of hand-edited in the portal.",
    stack: ["Bicep", "Azure RBAC", "CI/CD"],
    href: "/blog/the-403-that-refused-to-be-a-one-line-fix",
  },
  {
    title: "Documentation Compliance as a CI Gate",
    description: "Replaced a 24-repo manual README audit with a machine-checkable contract: a Python linter, a shared pipeline template, and a required branch policy.",
    impact: "Documentation standards are enforced on every pull request instead of decaying after a one-time cleanup.",
    stack: ["Python", "Azure Pipelines", "Developer experience"],
    href: "/blog/we-audited-24-readmes-then-deleted-the-process",
  },
  {
    title: "Dispatch Automation Reliability",
    description: "Hardened an Azure Durable Functions system that automates time-boxed regulatory dispatch calls: orchestrator refactors, recall handling, and an unsampled heartbeat metric with a liveness monitor.",
    impact: "Silent failure of a business-critical workflow now alerts within minutes instead of going unnoticed.",
    stack: ["C#", ".NET", "Durable Functions", "Datadog"],
  },
  {
    title: "Team AI Tooling and PR Analytics",
    description: "Built a Claude Code plugin encoding the org's PR, story, and release workflows as skills, plus an Azure DevOps extension dashboarding org-wide PR review health.",
    impact: "Standards apply themselves at the point of work, and PR review bottlenecks are visible instead of anecdotal.",
    stack: ["TypeScript", "React", "Claude Code", "Azure DevOps"],
  },
];
