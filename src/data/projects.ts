/**
 * projects.ts: the work index.
 *
 * Editorial discipline: four entries carry the index. Everything else is
 * listed compactly under `additional`. A recruiter reading a portfolio gives
 * it roughly thirty seconds, and seven equally-weighted cards spend that
 * budget flattening the capstone down to the level of a small lab.
 *
 * `sheet` is the drawing index and is what the reader sees instead of an icon.
 * Order is deliberate: strongest first.
 */

export interface Project {
  /** Zero-padded drawing index. */
  sheet: string;
  title: string;
  /** One line, no marketing. What it is. */
  summary: string;
  /** Longer description shown in the expanded row. */
  detail: string;
  /** Context label: how this work came about. */
  context: string;
  period?: string;
  stack: string[];
  /** Internal case-study route, if one exists. */
  caseStudy?: string;
  /** Public source, if one exists. */
  source?: string;
  /** Overrides the "Source" link text where the repo is a subset of the work. */
  sourceLabel?: string;
  /** Live URL, if one exists. */
  live?: string;
  /** Marks the capstone: rendered with additional prominence. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    sheet: '01',
    title: 'Hybrid Managed-Service Environment',
    summary:
      'Two sites, two client organizations, one shared MSP edge, extended to AWS with a Terraform-provisioned Kubernetes cluster.',
    detail:
      'The second site (17 VMs on Proxmox) was designed, built and run end to end: Active Directory and Samba AD tenants, eight VLANs behind OPNsense, an isolated iSCSI SAN, Veeam with offsite copy over a site-to-site VPN, and an AWS extension running a kubeadm cluster behind Caddy TLS, all in Terraform. The on-premises site was delivered with the team.',
    context: 'Algonquin College capstone',
    period: 'Jan – Apr 2026',
    stack: [
      'Proxmox VE', 'OPNsense', 'Windows Server 2022', 'Samba AD', 'iSCSI',
      'Veeam', 'OpenVPN', 'Terraform', 'AWS EC2', 'Route 53', 'kubeadm',
      'Flannel', 'Docker', 'Caddy',
    ],
    caseStudy: '/projects/capstone',
    // The repository is the cloud site only: the Terraform, the bootstrap
    // scripts and the manifests behind the public HTTPS service. The
    // on-premises half was team work and is not published.
    source: 'https://github.com/ofdengiz/clearroots-k8s-aws',
    sourceLabel: 'Cloud site source',
    featured: true,
  },
  {
    sheet: '02',
    title: 'omerdengiz.com',
    summary:
      'This site: a private S3 origin behind CloudFront, with every resource in Terraform.',
    detail:
      'One Lambda@Edge function rewrites URLs on request and sets security headers on response, and the build fails on any Content-Security-Policy violation.',
    context: 'Self-directed',
    stack: [
      'AWS S3', 'CloudFront', 'ACM', 'Lambda@Edge', 'Route 53', 'Terraform', 'Astro',
    ],
    caseStudy: '/meta',
    source: 'https://github.com/ofdengiz/omerdengiz-com',
    // Both the apex and www are served. www stays the canonical address
    // because every published link (resume, GitHub, LinkedIn) already uses it.
    live: 'https://www.omerdengiz.com',
  },
  {
    sheet: '03',
    title: 'Spring PetClinic CI/CD on AWS EKS',
    summary:
      'Jenkins pipelines that build once and promote the same artifact through dev, staging and production on AWS EKS.',
    detail:
      'Deployed with Helm charts and observed through Prometheus and Grafana, with Maven builds, images in AWS ECR, artefacts in Nexus, Rancher-managed clusters and Selenium tests.',
    context: 'Self-directed · Spring PetClinic',
    stack: [
      'Jenkins', 'AWS EKS', 'Helm', 'ECR', 'Rancher', 'Nexus', 'Maven', 'Docker',
      'Selenium', 'Prometheus', 'Grafana',
    ],
    caseStudy: '/projects/petclinic',
    source: 'https://github.com/ofdengiz/petclinic-microservices-with-db',
  },
  {
    sheet: '04',
    title: 'Multi-AZ AWS Architecture',
    summary:
      'An Application Load Balancer and Auto Scaling group across availability zones, with RDS MySQL in private subnets and CloudFront at the edge.',
    detail:
      'Application Load Balancer fronting an Auto Scaling Group across public and private subnets, RDS MySQL isolated in private subnets, S3 and DynamoDB for media and state, CloudFront for edge delivery, and ACM-issued TLS.',
    context: 'Self-directed AWS reference build',
    stack: [
      'AWS VPC', 'ALB', 'Auto Scaling', 'EC2', 'RDS MySQL', 'S3', 'DynamoDB',
      'Lambda', 'CloudFront', 'Route 53', 'ACM',
    ],
    source: 'https://github.com/ofdengiz/aws-django-blog-asg',
  },
];

/**
 * Secondary work. Listed so the record is complete, weighted so it does not
 * compete with the four above.
 */
export const additional = [
  {
    title: 'terraform-aws-docker-instance',
    summary: 'Terraform pattern for bootstrapping a Dockerized EC2 workload.',
    source: 'https://github.com/ofdengiz/terraform-aws-docker-instance',
  },
  {
    title: 'ansible-docker-roles',
    summary: 'Reusable Ansible roles for fleet-level Docker and application configuration.',
    source: 'https://github.com/ofdengiz/ansible-docker-roles',
  },
];
