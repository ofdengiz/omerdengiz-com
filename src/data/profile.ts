/**
 * profile.ts — the single source of truth for identity and contact details.
 *
 * SOURCE OF TRUTH: Omer_Dengiz_Resume.pdf (revision 2026-07-12), header block.
 *
 * Every page, the resume link, the structured data and the OG tags read from
 * here. Nothing about Omer is hard-coded into a template, so changing a phone
 * number is a one-line edit rather than a six-file find-and-replace.
 */

export interface ProfileLink {
  /** Short label used in the contact grid, e.g. "GitHub". */
  label: string;
  /** Text shown to the reader — usually a shortened form of the URL. */
  display: string;
  href: string;
  /** Machine-readable identifier for structured data / rel attributes. */
  rel?: string;
}

export const profile = {
  name: 'Omer Dengiz',

  /** The resume's positioning line, verbatim. */
  role: 'Cloud Infrastructure · Systems Administration · Networking · IT Operations',

  /** Compressed form for the title block and tab titles. */
  roleShort: 'Cloud · Systems · Networking',

  location: {
    city: 'Kanata',
    region: 'ON',
    country: 'Canada',
    /** Rendered in the title block LOCATION cell — matches the resume header. */
    short: 'Kanata, ON',
    /** Wider framing used in prose. */
    metro: 'Ottawa metro',
  },

  /** Availability line. Set to null to hide it everywhere at once. */
  availability: 'Open to Cloud, DevOps, Systems & Networking roles',

  /**
   * Summary, transcribed from the resume. Rendered on the home page so the
   * two surfaces cannot drift apart.
   */
  summary:
    'Computer Systems Technician – Networking graduate (Apr 2026) and AWS Certified Solutions Architect – Associate with hands-on experience in AWS cloud infrastructure, Linux and Windows administration, enterprise networking, and IT operations at Interac Corp. and Nioyatech LLC. Builds reliable hybrid environments with Terraform, Ansible, Docker, Kubernetes, and CI/CD pipelines, and supports teams through structured troubleshooting, clear documentation, and collaboration across engineering, operations, and security functions.',

  email: 'omerdengiz368@gmail.com',
  phone: {
    display: '(647) 446-9905',
    href: 'tel:+16474469905',
  },

  links: [
    {
      label: 'GitHub',
      display: 'github.com/ofdengiz',
      href: 'https://github.com/ofdengiz',
      rel: 'me',
    },
    {
      label: 'LinkedIn',
      display: '/in/omer-faruk-dengiz',
      href: 'https://www.linkedin.com/in/omer-faruk-dengiz',
      rel: 'me',
    },
  ] satisfies ProfileLink[],

  /**
   * Drawing title-block metadata. `revision` tracks the resume revision the
   * site content is aligned to — it is displayed, so keep it honest.
   */
  sheet: {
    revision: '2026.07',
    project: 'omerdengiz.com',
  },
} as const;

export type Profile = typeof profile;
