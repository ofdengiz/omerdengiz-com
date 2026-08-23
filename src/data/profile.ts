/**
 * profile.ts — the single source of truth for identity and contact details.
 *
 * Every page, the resume link, structured data and the OG tags read from here.
 * Nothing about Omer is hard-coded into a template. Changing a phone number is
 * a one-line edit, not a six-file find-and-replace.
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

  /** One line, no verb. Sits under the name in the title block. */
  role: 'Cloud · Systems · Networking',

  /** Location as a recruiter would scan it. */
  location: {
    city: 'Kanata',
    region: 'ON',
    country: 'Canada',
    /** Rendered in the title block LOCATION cell. */
    short: 'Kanata, ON',
    /** Wider framing used in prose. */
    metro: 'Ottawa metro',
  },

  /** Availability line. Set to null to hide it everywhere at once. */
  availability: 'Open to Cloud, DevOps, Systems & Networking roles',

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
   * Drawing title-block metadata. `revision` is the date the site content was
   * last materially revised — it is displayed, so keep it honest.
   */
  sheet: {
    revision: '2026.05',
    project: 'omerdengiz.com',
  },
} as const;

export type Profile = typeof profile;
