---
sheet: "01"
order: 1
title: Hybrid MSP Infrastructure & AWS Kubernetes Service
summary: >-
  A 17-VM, two-site managed-service environment for two client tenants,
  extended with a public HTTPS service on a Terraform-provisioned Kubernetes
  cluster.
context: Algonquin College capstone
period: Jan – Apr 2026
topology: true
stack:
  - Proxmox VE
  - OPNsense
  - Windows Server 2022
  - Samba AD
  - iSCSI
  - Veeam
  - OpenVPN
  - Terraform
  - AWS EC2
  - Route 53
  - kubeadm
  - Flannel
  - Docker
  - Caddy
  - Let's Encrypt
cells:
  - label: Discipline
    value: Infrastructure · Networking
  - label: Sites
    value: Two, VPN-linked
  - label: Tenants
    value: Lumora · ClearRoots
    accent: true
  - label: Delivered
    value: Apr 2026
source: https://github.com/ofdengiz/clearroots-k8s-aws
sourceLabel: Cloud site source
document:
  href: /assets/docs/Capstone_Technical_Report.pdf
  label: Technical report
  note: 122 pages · 8.7 MB
metrics:
  - value: "17"
    label: Virtual machines
    note: Public-cloud site
  - value: "8"
    label: VLAN segments
    note: MSP · LAN · DMZ · SAN
  - value: "2"
    label: Client tenants
    note: Separate directory platforms
  - value: "9"
    label: AWS resources
    note: Terraform-provisioned
    accent: true
notes:
  - title: Storage is deliberately unroutable
    body: >-
      C1SAN and C2SAN are not carried through OPNsense. Block transport never
      shares a trust boundary with tenant user traffic, and when a share
      disappears the investigation starts at the consumer, C1FS or C2FS, rather
      than at the firewall. It makes the storage problem space smaller
      at the exact moment that matters.
  - title: Only the bastions are published
    body: >-
      No tenant server is reachable from the edge. Jump64 is published on
      33464 to RDP and MSPUbuntuJump on 33564 to SSH; everything else is
      reached from inside. That narrows the attack surface, but the bigger
      benefit is that it prevents ad-hoc administrative habits: if support work
      has to begin on a bastion, the audit path stays predictable.
  - title: Two directory platforms, on purpose
    body: >-
      Lumora runs Windows Server 2022 AD DS; ClearRoots runs Samba AD on
      Ubuntu. Standing up one template twice would have been faster and would
      have demonstrated nothing. No cross-domain trust exists between
      c1.local and c2.local, so administrative independence is structural
      rather than procedural.
  - title: The cloud site is genuinely independent
    tone: annotate
    body: >-
      clearroots.omerdengiz.com does not traverse the OPNsense edge, the VPN
      tunnel, the MSP segment, or any tenant LAN. A Site 2 outage does not
      take the public endpoint down, and a cloud failure does not imply an
      internal problem. The trade-off is a second operational surface with its
      own failure modes and its own on-call reasoning.
revisions:
  - >-
    Move TLS into cert-manager with an ingress controller. Caddy on the worker
    was the right call for a defence demo (one Caddyfile line and no YAML), but
    it is not how a production cluster should terminate TLS.
  - >-
    Replace the self-managed kubeadm cluster with EKS for anything beyond a
    teaching environment. Bootstrapping the control plane by hand was the
    point of the exercise; running it that way in production is not.
  - >-
    Split the Terraform root into modules. The team hit merge pain near
    deadlines exactly where module boundaries would have absorbed it.
  - >-
    Extend Prometheus and Grafana across both sites. The on-prem side had
    Zabbix and the cloud side had nothing; one observability story would have
    been cleaner than two partial ones.
---

## The brief

Emerging Technologies hands a team a blank-slate managed-service contract:
design, build, and operate shared infrastructure for two client organisations
across two physical sites, to a stated set of availability and security
requirements, then extend it with a public-facing cloud service.

The two clients are deliberately mismatched. **Lumora** is a mission-driven
organisation that wants a professionally supported environment, predictable
cost, centralised identity, and Canadian data handling. **ClearRoots** is a
budget-conscious NGO that prefers open-source platforms, wants to avoid vendor
lock-in, and still needs fault-tolerant core services. One tenant pulls toward
Microsoft; the other pulls away from it. They share hardware regardless.

Deliverables were a working environment, a 122-page technical handover, a
client-facing SLA, and a live defence.

## Scope of my work

End-to-end ownership of the **public-cloud site**. The MSP edge, both tenant
stacks, the dual-bastion operations layer, the backup target, and the
AWS-hosted service extension were designed, built, and operated solo. The
on-prem site was delivered collaboratively.

## The MSP boundary

A single OPNsense instance, `rp-msp-gateway`, carries the WAN edge and anchors
eight internal segments: a shared management network, a LAN and a DMZ for each
tenant, and two isolated storage bridges.

Segmentation here is not only a security control. It is also a triage aid. Each
network tells a support engineer where to look first. If the problem is on the
MSP segment, it starts at the gateway, a bastion, or the backup host. If it is
on C1DMZ, it is a Lumora publication issue and not a ClearRoots identity
issue. If storage breaks, the routed network can be perfectly healthy while the
file service fails, which is why the SAN bridges sit outside the routed path
entirely (see note 1).

Firewall policy is written against named aliases rather than one-off addresses,
so a tenant's reachable scope is described once and reused. Each tenant LAN may
reach its own scope, the shared web nodes, and the DNS authorities, and is
explicitly blocked from the other tenant's scope.

## Tenant services

**Lumora** runs a Windows-centric stack: two Windows Server 2022 domain
controllers holding AD DS, DNS, DHCP, and Group Policy; a Windows file server
presenting SMB shares from iSCSI-backed storage; an IIS server in the DMZ; and
both Windows and Ubuntu domain-joined endpoints.

**ClearRoots** runs the Linux equivalent: two Samba AD nodes paired for DHCP
failover, providing AD-compatible authentication, DNS, and SMB; a Linux file
server with iSCSI-backed and replicated shares; an nginx server in the DMZ; and
a domain-joined Linux client.

The interesting work was not either stack individually. It was keeping them
cleanly separated on shared hardware without letting DNS or DHCP scope bleed
across the tenant boundary (see note 3).

## Operations

Site 2 is operated through a **dual-bastion model**. Jump64 is the Windows
inspection platform, best for AD and backup administration. MSPUbuntuJump is
the Linux platform, faster for identity, file, and web validation. Splitting
them by operating model resists the temptation to overload one host with every
tool in the environment.

S2Veeam anchors recovery: it holds the local repository and receives the
offsite copy from Site 1 across the VPN tunnel, on an explicitly enumerated set
of ports rather than an open path between sites. Only the two bastions are
published at the edge (see note 2).

## The cloud extension

The public service is a containerised site running on a **two-node kubeadm
cluster** on EC2, published at `clearroots.omerdengiz.com`.

Every AWS resource is declared in Terraform: the IAM role and instance
profile, the security group, both instances, the Elastic IP, the Route 53
record. Remote state lives in S3, so the environment can be destroyed and
rebuilt reproducibly. That mattered concretely: during the defence, the entire
cloud site was torn down and rebuilt from scratch in front of the panel.

The worker carries the Elastic IP because it is the traffic-serving node, which
keeps the DNS record valid across worker reboots. The control plane needs no
stable public address for browser traffic, and publishing both would add
exposure without improving delivery. Caddy on the worker terminates TLS and
proxies to a NodePort service, so certificate issuance and renewal need no
separate subsystem.

The cloud stack shares nothing with the internal environment (see note 4).
