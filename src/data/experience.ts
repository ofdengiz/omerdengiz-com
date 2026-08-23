/**
 * experience.ts — professional history and education.
 *
 * BASELINE: Omer_Dengiz_Resume.pdf (revision 2026-07-12).
 *
 * ⚠ PENDING RESUME SYNC (2026-08-22)
 * The two Interac bullets below have been strengthened for the Canadian market
 * and now read more actively than the PDF currently deployed at
 * /assets/resume/Omer_Dengiz_Resume.pdf. Omer is updating the source document
 * to match. Until that lands, the site and the resume state the same facts in
 * different words — see PENDING_RESUME_SYNC.md at the repo root.
 *
 * Everything else on this page is the resume's own wording. The rule stands:
 * the site and the resume must never make different *claims*.
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
  /**
   * True once the credential has actually been conferred. Drives past-tense
   * framing ("Graduated") rather than an ambiguous bare date, which reads as
   * "expected" to a recruiter scanning quickly.
   */
  conferred?: boolean;
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
      'Automated device inventory data extraction from vendor APIs using Python, establishing a validation harness for API credentials and response schema that eliminated manual tracking effort.',
      'Collaborated with senior network engineers to manage ServiceNow incident and change tickets, and rewrote internal wiki runbooks with step-by-step procedures that accelerated onboarding for new team members.',
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
    conferred: true,
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
    conferred: true,
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
