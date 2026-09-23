/**
 * skills.ts — the source for the PortMatrix (patch-panel) component.
 *
 * SOURCE OF TRUTH: Omer_Dengiz_Resume.pdf (revision 2026-09-23), TECHNICAL
 * SKILLS block, transcribed verbatim and in the same order, including the
 * group names.
 *
 * The groups changed shape in this revision. They used to be split by tooling
 * layer (Cloud & DevOps / Systems & Platforms / Networking & Security /
 * Scripting & Automation); they are now split by what an operations team
 * actually owns — automation, the machines, the network, and the software
 * running on top. That reordering is deliberate and belongs on both surfaces.
 *
 * If a tool appears here but not on the resume — or the reverse — the two
 * surfaces have drifted and one of them is lying to a recruiter. Treat any
 * edit here as an edit to the resume too.
 */

export interface SkillGroup {
  /** Row label in the patch panel. */
  name: string;
  /** Two-letter code stencilled on the row, drawing-style. */
  code: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    name: 'Cloud & Automation',
    code: 'CA',
    items: [
      'AWS EC2', 'VPC', 'IAM', 'S3', 'RDS', 'Route 53', 'EKS',
      'CloudFormation', 'CloudWatch', 'Azure', 'Terraform', 'Ansible',
      'Helm', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD pipelines',
      'Infrastructure as code',
    ],
  },
  {
    name: 'Systems & Virtualization',
    code: 'SV',
    items: [
      'Linux (Red Hat, Ubuntu, SUSE)', 'Windows Server 2019/2022',
      'Active Directory', 'Group Policy', 'Samba AD', 'LDAP', 'Kerberos',
      'SSSD', 'VMware', 'Proxmox VE', 'iSCSI SAN', 'RAID',
      'HP ProLiant hardware', 'Veeam backup and restore',
    ],
  },
  {
    name: 'Networking & Security',
    code: 'NS',
    items: [
      'TCP/IP', 'DNS', 'DHCP', 'VLANs', 'IPv4 subnetting',
      'Routing and switching', 'OSPF', 'Firewalls (OPNsense)',
      'NAT and access rules', 'OpenVPN site-to-site',
      "TLS and Let's Encrypt automation", 'Cisco IOS', 'Wireshark', 'tcpdump',
    ],
  },
  {
    name: 'Applications & Scripting',
    code: 'AS',
    items: [
      'Tomcat', 'nginx', 'Caddy reverse proxy', 'MySQL', 'PostgreSQL', 'SQL',
      'Python', 'Bash', 'PowerShell', 'Prometheus', 'Grafana',
      'Technical documentation and runbooks',
    ],
  },
];
