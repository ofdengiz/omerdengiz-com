/**
 * experience.ts — professional history and education.
 *
 * SOURCE OF TRUTH: Omer_Dengiz_Resume.pdf (revision 2026-09-23), transcribed
 * verbatim — including the Interac bullets, which were reworded for the
 * Canadian market and then carried back into the PDF so both surfaces read
 * identically. Verified by extracting the PDF text and diffing it against
 * this file.
 *
 * The rule: the site and the resume must never make different claims, and
 * should not even use different words. If you edit a bullet here, regenerate
 * the PDF in the same sitting — see the resume workflow in README.md.
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
  /**
   * Validity window, when the credential has one.
   *
   * Stated rather than omitted: AWS certifications expire after three years,
   * and presenting one with no date implies it is current indefinitely. The
   * resume qualifies them, so the site must too — a recruiter comparing the
   * two should not find the site making the stronger claim.
   */
  validity?: string;
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
      'Developed a Python-based Proof of Concept to automate device inventory extraction from vendor APIs, establishing a validation schema that paved the way for replacing manual tracking.',
      'Collaborated with senior engineers to manage ServiceNow incidents and updated internal wiki runbooks, accelerating onboarding for new team members.',
    ],
    stack: ['Python', 'REST APIs', 'ServiceNow', 'Runbooks'],
  },
  {
    title: 'DevOps Engineer',
    org: 'Nioyatech LLC',
    location: 'Remote from Ottawa, ON (US-based employer)',
    start: 'Nov 2022',
    end: 'May 2024',
    startISO: '2022-11',
    endISO: '2024-05',
    // Ansible leads, matching the resume: configuration management is the
    // closest thing in this role to the operations work being targeted.
    bullets: [
      'Improved reliability across 30+ Linux servers by authoring Ansible playbooks and roles for configuration, patch management, and compliance baselines, cutting manual setup effort across fleets.',
      'Automated provisioning for 3 multi-tier AWS environments (EC2, S3, RDS, Lambda, IAM, VPC, EKS) with Terraform and CloudFormation, standardizing reusable infrastructure patterns.',
      'Built Jenkins and Git CI/CD pipelines for 20+ applications and deployed containerized workloads with Docker and Kubernetes, enabling zero downtime releases.',
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
    marks: ['Graduated with Honours', 'GPA 3.75 / 4.0'],
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
    name: 'CCNA: Switching, Routing and Wireless Essentials',
    issuer: 'Cisco Networking Academy',
  },
  {
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    validity: '2023 – 2026, recertification planned',
    // href: 'https://www.credly.com/badges/...',   ← add verification link
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    validity: '2023 – 2026, recertification planned',
    // href: 'https://www.credly.com/badges/...',
  },
];

export const languages = [
  { name: 'English', level: 'Professional' },
  { name: 'Turkish', level: 'Native' },
  { name: 'Mandarin Chinese', level: 'Advanced — HSK 6' },
];
