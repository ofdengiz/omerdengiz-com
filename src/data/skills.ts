/**
 * skills.ts — the source for the PortMatrix (patch-panel) component.
 *
 * SOURCE OF TRUTH: Omer_Dengiz_Resume.pdf (revision 2026-07-12), TECHNICAL
 * SKILLS block, transcribed verbatim and in the same order.
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
    name: 'Cloud & DevOps',
    code: 'CD',
    items: [
      'AWS EC2', 'S3', 'RDS', 'Lambda', 'VPC', 'Route 53', 'IAM', 'EKS',
      'ALB', 'Auto Scaling', 'CloudFormation', 'CloudWatch', 'ECR',
      'CloudFront', 'Terraform', 'Ansible', 'Docker', 'Kubernetes',
      'Jenkins', 'Helm', 'Git/GitHub', 'Prometheus', 'Grafana',
    ],
  },
  {
    name: 'Systems & Platforms',
    code: 'SP',
    items: [
      'Linux (Red Hat, Ubuntu, SUSE/openSUSE)', 'Windows 10/11',
      'Windows Server 2019/2022', 'Active Directory', 'Group Policy',
      'Samba AD', 'VMware', 'Proxmox VE', 'OPNsense', 'Microsoft 365',
      'ServiceNow', 'Veeam Backup',
    ],
  },
  {
    name: 'Networking & Security',
    code: 'NS',
    items: [
      'Cisco IOS', 'TCP/IP', 'OSPF', 'Routing and switching', 'VLANs',
      'DHCP', 'DNS', 'OpenVPN', 'Site-to-site VPN', 'Firewalls', 'IAM',
      'Security Groups', 'Wireshark', 'Cisco Packet Tracer', 'iSCSI',
    ],
  },
  {
    name: 'Scripting & Automation',
    code: 'SA',
    items: [
      'Python', 'Bash', 'PowerShell', 'SQL', 'YAML', 'HCL (Terraform)',
      'CI/CD pipeline design', 'Infrastructure as code',
    ],
  },
];
