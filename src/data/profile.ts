/**
 * profile.ts: the single source of truth for identity and contact details.
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
  /** Text shown to the reader: usually a shortened form of the URL. */
  display: string;
  href: string;
  /** Machine-readable identifier for structured data / rel attributes. */
  rel?: string;
}

export const profile = {
  name: 'Omer Dengiz',

  /**
   * The resume's positioning line, verbatim.
   *
   * Systems Administration leads as of the 2026-09 revision. The roles being
   * targeted are operations-first, and the ordering signals that before any
   * bullet is read.
   */
  role: 'Systems Administration · Cloud Infrastructure · Networking · IT Operations',

  /** Compressed form for the title block and tab titles. */
  roleShort: 'Systems · Cloud · Networking',

  location: {
    city: 'Kanata',
    region: 'ON',
    country: 'Canada',
    /** Rendered in the title block LOCATION cell. Matches the resume header. */
    short: 'Kanata, ON',
    /** Wider framing used in prose. */
    metro: 'Ottawa metro',
  },

  /** Availability line. Set to null to hide it everywhere at once. */
  availability: 'Open to Cloud, DevOps, Systems & Networking roles',

  /**
   * Security screening, when current. Set to null once it lapses.
   *
   * Stated on the site because it is on the resume and it materially changes
   * eligibility for Canadian public-sector and defence work. Leaving it off
   * one surface but not the other is the kind of gap a recruiter notices.
   */
  clearance: 'RCMP Facility Access Security Check, Level 2 (current)',

  /**
   * Summary, transcribed from the resume (revision 2026-09-23).
   *
   * It leads with the capstone rather than the credential, because the
   * hands-on infrastructure work is the strongest thing on the page and the
   * roles being targeted care about it more than about a diploma date.
   */
  summary:
    'Algonquin College Networking graduate with hands-on experience in cloud operations and Windows and Linux server administration across on-premises, hybrid and AWS environments. On a six-person capstone team, owned the second site end to end: Proxmox-hosted infrastructure, Active Directory and Samba AD, segmented VLANs behind OPNsense, and Veeam backup with an offsite copy. Extended it into AWS with Terraform and a Kubernetes cluster behind automated TLS. Previously worked as a DevOps Engineer, automating Linux server configuration with Ansible and building CI/CD pipelines for containerized applications. Holds a current RCMP Facility Access Security Check (Level 2). Fluent in English, Turkish, and Mandarin.',

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
   * site content is aligned to: it is displayed, so keep it honest.
   */
  sheet: {
    revision: '2026.09',
    project: 'omerdengiz.com',
  },
} as const;

export type Profile = typeof profile;
