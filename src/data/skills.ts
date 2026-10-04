/**
 * skills.ts: the source for the PortMatrix (patch-panel) component.
 *
 * SOURCE OF TRUTH: Omer_Dengiz_Resume.pdf (revision 2026-09-23), TECHNICAL
 * SKILLS block, transcribed verbatim and in the same order, including the
 * group names.
 *
 * The groups changed shape in this revision. They used to be split by tooling
 * layer (Cloud & DevOps / Systems & Platforms / Networking & Security /
 * Scripting & Automation); they are now split by what an operations team
 * actually owns: automation, the machines, the network, and the software
 * running on top. That reordering is deliberate and belongs on both surfaces.
 *
 * If a tool appears here but not on the resume, or the reverse, the two
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
    name: 'Networking',
    code: 'NW',
    items: [
      'Cisco IOS', 'Routing and switching', 'OSPF', 'VLANs and IPv4 subnetting',
      'TCP/IP', 'DNS', 'DHCP', 'OPNsense firewalls', 'NAT and access rules',
      'OpenVPN site-to-site', 'TLS and OpenSSL', 'Wireshark', 'tcpdump',
    ],
  },
  {
    name: 'Systems',
    code: 'SY',
    items: [
      'Windows Server 2019/2022', 'Active Directory', 'Group Policy', 'Samba AD',
      'LDAP', 'Kerberos', 'SSSD', 'Ubuntu', 'RHEL', 'Proxmox VE', 'VMware',
      'iSCSI SAN', 'RAID', 'Veeam backup and restore',
    ],
  },
  {
    name: 'Cloud & DevOps',
    code: 'CD',
    items: [
      'AWS EC2', 'VPC', 'IAM', 'S3', 'RDS', 'Route 53', 'EKS', 'CloudFront',
      'CloudWatch', 'Terraform', 'Ansible', 'Docker', 'Kubernetes (kubeadm, EKS)',
      'Helm', 'Jenkins', 'Git', 'CI/CD',
    ],
  },
  {
    name: 'Scripting & Services',
    code: 'SS',
    items: [
      'Python', 'Bash', 'PowerShell', 'SQL', 'nginx', 'Caddy', 'Tomcat',
      'Prometheus', 'Grafana', 'ServiceNow',
    ],
  },
];
