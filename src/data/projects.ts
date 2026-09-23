/**
 * projects.ts — the work index.
 *
 * Editorial discipline: five entries carry the index. Everything else is
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
  /** Context label — how this work came about. */
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
  /** Marks the capstone — rendered with additional prominence. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    sheet: '01',
    title: 'Hybrid MSP Infrastructure & AWS Kubernetes Service',
    summary:
      'A 17-VM, two-site managed-service environment for two client tenants, extended with a public HTTPS service on a Terraform-provisioned Kubernetes cluster.',
    detail:
      'Two tenants — Lumora on Windows Server 2022 AD DS, ClearRoots on Samba AD — sharing an OPNsense edge across eight VLAN segments, with isolated iSCSI storage bridges deliberately kept off the routed path, Veeam backup copy over a site-to-site OpenVPN tunnel, and a dual-bastion operations model. The cloud site was designed, built and operated end to end; the on-prem site was delivered collaboratively.',
    context: 'Algonquin College capstone',
    period: 'Jan – Apr 2026',
    stack: [
      'Proxmox VE', 'OPNsense', 'Windows Server 2022', 'Samba AD', 'iSCSI',
      'Veeam', 'OpenVPN', 'Terraform', 'AWS EC2', 'Route 53', 'kubeadm',
      'Flannel', 'Docker', 'Caddy',
    ],
    caseStudy: '/projects/capstone',
    // The repository is the cloud site only — the Terraform, the bootstrap
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
      'This site. A static build on S3 behind CloudFront, with pretty URLs and security headers injected at the edge, provisioned entirely in Terraform.',
    detail:
      'A single Lambda@Edge function handles both viewer-request URL rewriting and viewer-response security headers, including a strict Content-Security-Policy that the build verifies against before it can ship. Rebuilt in a different AWS account in an afternoon after the original became unreachable — the entire stack is Terraform, so the recovery was a re-apply rather than a rebuild from memory.',
    context: 'Self-directed',
    stack: [
      'AWS S3', 'CloudFront', 'ACM', 'Lambda@Edge', 'Route 53', 'Terraform', 'Astro',
    ],
    caseStudy: '/meta',
    source: 'https://github.com/ofdengiz/omerdengiz-com',
    // www until the apex alias is released from the old account. The apex
    // currently fails at TLS, so linking it would hand a visitor a
    // certificate warning from the site's own project index.
    live: 'https://www.omerdengiz.com',
  },
  {
    sheet: '03',
    title: 'Enterprise Microservices CI/CD Pipeline',
    summary:
      'End-to-end Jenkins pipeline deploying a Java Spring microservices application to AWS EKS.',
    detail:
      'Multi-branch promotion across dev, staging and production, with Maven builds, images published to AWS ECR, artefacts in Nexus, Rancher-managed clusters, Selenium automation tests, and Prometheus and Grafana for monitoring.',
    context: 'Self-directed · Spring PetClinic',
    stack: [
      'Jenkins', 'AWS EKS', 'ECR', 'Rancher', 'Nexus', 'Maven', 'Docker',
      'Selenium', 'Prometheus', 'Grafana',
    ],
    caseStudy: '/projects/petclinic',
    source: 'https://github.com/ofdengiz/petclinic-microservices-with-db',
  },
  {
    sheet: '04',
    title: 'filmapp — DevSecOps Pipeline',
    summary:
      'A React and TypeScript application whose real artefact is its pipeline: every security gate runs before an image reaches the registry.',
    detail:
      'SonarQube quality gate, OWASP Dependency-Check, and Trivy filesystem and image scans run in sequence, followed by a Kubernetes rollout. A failing gate stops the build rather than producing a warning nobody reads.',
    context: 'Self-directed',
    stack: [
      'React', 'TypeScript', 'Jenkins', 'SonarQube', 'OWASP DC', 'Trivy',
      'Docker', 'Kubernetes',
    ],
    caseStudy: '/projects/filmapp',
    source: 'https://github.com/ofdengiz/filmapp',
  },
  {
    sheet: '05',
    title: 'Django Blog on Multi-AZ AWS',
    summary:
      'A Django application on a production-shaped AWS architecture: multi-AZ VPC, load-balanced auto-scaling tier, and managed data services.',
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
 * compete with the five above.
 */
export const additional = [
  {
    title: 'Terraform AWS patterns',
    summary: 'Reference modules for ALB, Launch Template, Auto Scaling Group and RDS wiring.',
    source: 'https://github.com/ofdengiz/terraform-aws-patterns',
  },
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
  {
    title: 'jenkins-maven-project',
    summary: 'Declarative Jenkins pipeline covering the Jenkins → Maven → JUnit loop.',
    source: 'https://github.com/ofdengiz/jenkins-maven-project',
  },
];
