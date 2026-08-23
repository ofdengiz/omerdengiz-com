/**
 * experience.ts — professional history and education.
 *
 * SOURCE OF TRUTH: Omer_Dengiz_Resume.pdf (revision 2026-07-12), transcribed
 * verbatim. The site and the resume must never make different claims, so
 * bullets are copied exactly rather than re-worded for the web. If a bullet
 * reads modestly here, that is deliberate — it is what the resume says.
 *
 * Shape notes:
 *   - `start` / `end` are display strings because the resume shows "Sep 2025",
 *     not an ISO timestamp. `startISO` / `endISO` drive <time> and sorting.
 *   - `end: null` means current.
 */

export interface Role {
  title: string;
  org: string;
  location: string;
  start: string;
  end: string | null;
  /** ISO yyyy-mm for machine-readable <time> and sorting. */
  startISO: string;
  endISO: string | null;
  /** Resume bullets, verbatim. */
  bullets: string[];
  /** Short tech list surfaced as mono labels. Drawn from the bullets only. */
  stack?: string[];
}

export interface Education {
  credential: string;
  institution: string;
  location: string;
  end: string;
  endISO: string;
  /** Honours and marks exactly as the resume states them. */
  marks?: string[];
  description?: string;
  /** Broad subject areas — deliberately not tool-specific. */
  areas?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  /** Verification URL if one exists. */
  href?: string;
}

/* -------------------------------------------------------------------------- */

export const roles: Role[] = [
  {
    title: 'System Engineering Intern',
    org: 'Interac Corp.',
    location: 'Toronto, ON',
    start: 'Sep 2025',
    end: 'Dec 2025',
    startISO: '2025-09',
    endISO: '2025-12',
    bullets: [
      "Wrote a Python script that pulled current device inventory data from vendor portals via their public API, and built a small test harness to validate the team's API key and response schema as a first step toward automating a manual inventory task.",
      'Shadowed senior network engineers on ServiceNow incident and change tickets and updated internal wiki and runbook pages with step by step procedures, making repeated operational tasks easier for other interns and newly onboarded team members to follow.',
    ],
    stack: ['Python', 'REST APIs', 'ServiceNow', 'Runbooks'],
  },
  {
    title: 'DevOps Engineer',
    org: 'Nioyatech LLC',
    location: 'Remote',
    start: 'Nov 2022',
    end: 'May 2024',
    startISO: '2022-11',
    endISO: '2024-05',
    bullets: [
      'Automated provisioning for 3 multi-tier AWS environments (EC2, S3, RDS, Lambda, IAM, VPC, EKS) with Terraform and CloudFormation, standardizing reusable infrastructure patterns and reducing deployment time for new application stacks.',
      'Improved reliability across 30+ Linux servers by authoring Ansible playbooks and roles for configuration, patch management, and compliance baselines, cutting manual setup effort and enforcing consistent state across fleets.',
      'Accelerated delivery for 20+ applications by building Jenkins and Git CI/CD pipelines and deploying containerized workloads with Docker and Kubernetes, enabling zero downtime microservices releases.',
    ],
    stack: ['AWS', 'Terraform', 'CloudFormation', 'Ansible', 'Jenkins', 'Docker', 'Kubernetes'],
  },
];

export const education: Education[] = [
  {
    credential: 'Computer Systems Technician — Networking',
    institution: 'Algonquin College',
    location: 'Ottawa, ON',
    end: 'Apr 2026',
    endISO: '2026-04',
    // Resume revision 2026-07-12 states GPA only.
    marks: ['GPA 3.75 / 4.0'],
    description:
      'Two-year diploma covering enterprise networking, systems and server administration, virtualization and storage, cloud infrastructure, scripting and automation, and information security.',
    areas: [
      'Routing & Switching',
      'Network Security',
      'Windows & Linux Admin',
      'Virtualization',
      'Cloud Infrastructure',
      'Scripting & Automation',
      'Databases',
    ],
  },
  {
    credential: 'Bachelor of Arts, Chinese Language',
    institution: 'Nanjing University',
    location: 'Nanjing, China',
    end: 'Jun 2016',
    endISO: '2016-06',
    description:
      'Four-year immersive program in Mandarin Chinese language, literature, and culture — building the communication skills that support work across multicultural engineering and operations teams.',
  },
];

export const certifications: Certification[] = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    // href: 'https://www.credly.com/badges/...',   ← add verification link
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    // href: 'https://www.credly.com/badges/...',
  },
];

export const languages = [
  { name: 'English', level: 'Professional' },
  { name: 'Turkish', level: 'Native' },
  { name: 'Mandarin Chinese', level: 'Advanced — HSK 6' },
];
