/**
 * skills.ts — the source for the PortMatrix (patch-panel) component.
 *
 * Ordering is deliberate: groups appear in the order declared, and within a
 * group the strongest, most defensible items come first. A recruiter scans
 * the first three entries of each row.
 *
 * These lists must stay in lockstep with the resume's TECHNICAL SKILLS block.
 * If a tool is here but not on the resume (or vice versa) the two surfaces
 * have drifted and one of them is lying.
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
      'Linux (RHEL, Ubuntu, SUSE)', 'Windows 10/11',
      'Windows Server 2019/2022', 'Active Directory', 'Group Policy',
      'Samba AD', 'VMware', 'Proxmox VE', 'OPNsense', 'Microsoft 365',
      'ServiceNow', 'Veeam Backup',
    ],
  },
  {
    name: 'Networking & Security',
    code: 'NS',
    items: [
      'Cisco IOS', 'TCP/IP', 'OSPF', 'BGP', 'QoS', 'VLANs', 'DHCP', 'DNS',
      '802.11 a/b/g/n/ac', '802.1X EAP-PEAP', 'ArubaOS', 'OpenVPN',
      'Site-to-site VPN', 'Firewalls', 'Wireshark', 'iSCSI', 'PKI',
      'TLS/SSH', 'IDS/IPS', 'CVSS',
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
