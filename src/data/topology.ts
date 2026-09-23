/**
 * topology.ts: the capstone Site 2 network, as built.
 *
 * Source: "Integrated Technical Design, Configuration, and Handover Report",
 * §3.1 (public-cloud boundary, MSP entry, gateway model), Table 10 (segments
 * and gateways) and Table 11 (firewall policy and alias summary).
 *
 * Accuracy is the entire point of this artefact. The two SAN bridges are
 * modelled as `routed: false` because they genuinely sit outside the OPNsense
 * routed path: drawing them as ordinary subnets would misrepresent the
 * design and undercut the one detail that shows real architectural intent.
 */

export interface TopologyNode {
  id: string;
  /** Hostname as configured. */
  label: string;
  /** Host address within the segment. */
  addr?: string;
  /** Short description surfaced on interaction. */
  role: string;
  os?: 'windows' | 'linux' | 'appliance';
}

export interface TopologySegment {
  id: string;
  label: string;
  cidr: string;
  /** Gateway address, or null for the isolated storage bridges. */
  gateway: string | null;
  /** Which tenant owns this segment. `msp` is shared, `wan` is upstream. */
  owner: 'msp' | 'c1' | 'c2' | 'wan';
  /** False for segments deliberately kept off the routed path. */
  routed: boolean;
  purpose: string;
  nodes: TopologyNode[];
}

export interface TopologyEdge {
  from: string;
  to: string;
  kind: 'routed' | 'tunnel' | 'storage' | 'nat';
  label?: string;
}

export const tenants = {
  msp: { label: 'MSP', full: 'Managed service provider, shared' },
  c1: { label: 'Lumora', full: 'Company 1, Windows-centric tenant' },
  c2: { label: 'ClearRoots', full: 'Company 2, Linux-centric tenant' },
  wan: { label: 'WAN', full: 'Upstream provider network' },
} as const;

export const gateway: TopologyNode = {
  id: 'gw',
  label: 'rp-msp-gateway',
  role: 'OPNsense edge: routing, firewall policy, NAT publication, VPN termination',
  os: 'appliance',
};

export const segments: TopologySegment[] = [
  {
    id: 'wan',
    label: 'WAN',
    cidr: '172.20.64.1/16',
    gateway: 'upstream',
    owner: 'wan',
    routed: true,
    purpose: 'Provider-facing ingress and egress for the site edge',
    nodes: [],
  },
  {
    id: 'msp',
    label: 'MSP',
    cidr: '172.30.65.177/29',
    gateway: '172.30.65.177',
    owner: 'msp',
    routed: true,
    purpose: 'Shared management and recovery segment: bastions and backup',
    nodes: [
      { id: 'jump64', label: 'Jump64', addr: '.178', role: 'Windows bastion: AD and Veeam administration', os: 'windows' },
      { id: 'mspjump', label: 'MSPUbuntuJump', addr: '.179', role: 'Linux bastion: tenant and OPNsense inspection', os: 'linux' },
      { id: 's2veeam', label: 'S2Veeam', addr: '.180', role: 'Backup repository and offsite copy target', os: 'windows' },
    ],
  },
  {
    id: 'c1lan',
    label: 'C1LAN',
    cidr: '172.30.65.1/26',
    gateway: '172.30.65.1',
    owner: 'c1',
    routed: true,
    purpose: 'Lumora directory, file and endpoint network',
    nodes: [
      { id: 'c1dc1', label: 'C1DC1', addr: '.2', role: 'Primary domain controller: AD DS, DNS, DHCP, Group Policy', os: 'windows' },
      { id: 'c1dc2', label: 'C1DC2', addr: '.3', role: 'Secondary domain controller', os: 'windows' },
      { id: 'c1fs', label: 'C1FS', addr: '.4', role: 'Windows file server, iSCSI initiator', os: 'windows' },
      { id: 'c1win', label: 'C1WindowsClient', addr: '.11', role: 'Domain-joined Windows endpoint', os: 'windows' },
      { id: 'c1ubu', label: 'C1UbuntuClient', addr: '.36', role: 'Domain-joined Linux endpoint', os: 'linux' },
    ],
  },
  {
    id: 'c1dmz',
    label: 'C1DMZ',
    cidr: '172.30.65.161/29',
    gateway: '172.30.65.161',
    owner: 'c1',
    routed: true,
    purpose: 'Lumora web publication zone',
    nodes: [
      { id: 'c1web', label: 'C1WebServer', addr: '.162', role: 'Internal IIS server', os: 'windows' },
    ],
  },
  {
    id: 'c2lan',
    label: 'C2LAN',
    cidr: '172.30.65.65/26',
    gateway: '172.30.65.65',
    owner: 'c2',
    routed: true,
    purpose: 'ClearRoots identity, file and endpoint network',
    nodes: [
      { id: 'c2idm1', label: 'C2IdM1', addr: '.66', role: 'Samba AD: DNS, DHCP failover primary, SMB', os: 'linux' },
      { id: 'c2idm2', label: 'C2IdM2', addr: '.67', role: 'Samba AD: DHCP failover secondary', os: 'linux' },
      { id: 'c2fs', label: 'C2FS', addr: '.68', role: 'Linux file server, iSCSI initiator, replicated shares', os: 'linux' },
      { id: 'c2lin', label: 'C2LinuxClient', addr: '.75', role: 'Domain-joined Linux endpoint', os: 'linux' },
    ],
  },
  {
    id: 'c2dmz',
    label: 'C2DMZ',
    cidr: '172.30.65.169/29',
    gateway: '172.30.65.169',
    owner: 'c2',
    routed: true,
    purpose: 'ClearRoots web publication zone',
    nodes: [
      { id: 'c2web', label: 'C2WebServer', addr: '.170', role: 'nginx HTTPS server', os: 'linux' },
    ],
  },
  {
    id: 'c1san',
    label: 'C1SAN',
    cidr: '172.30.65.186/29',
    gateway: null,
    owner: 'c1',
    routed: false,
    purpose: 'Isolated block storage bridge, deliberately off the routed path',
    nodes: [],
  },
  {
    id: 'c2san',
    label: 'C2SAN',
    cidr: '172.30.65.194/29',
    gateway: null,
    owner: 'c2',
    routed: false,
    purpose: 'Isolated block storage bridge, deliberately off the routed path',
    nodes: [],
  },
];

export const edges: TopologyEdge[] = [
  { from: 'wan', to: 'gw', kind: 'routed' },
  { from: 'gw', to: 'msp', kind: 'routed' },
  { from: 'gw', to: 'c1lan', kind: 'routed' },
  { from: 'gw', to: 'c1dmz', kind: 'routed' },
  { from: 'gw', to: 'c2lan', kind: 'routed' },
  { from: 'gw', to: 'c2dmz', kind: 'routed' },
  { from: 'c1fs', to: 'c1san', kind: 'storage', label: 'iSCSI' },
  { from: 'c2fs', to: 'c2san', kind: 'storage', label: 'iSCSI' },
  { from: 'gw', to: 'site1', kind: 'tunnel', label: 'SITE1_OVPN' },
];

/** NAT publications: only the two bastions are reachable from the edge. */
export const natPublications = [
  { external: '33464', internal: '172.30.65.178:3389', node: 'jump64', proto: 'RDP' },
  { external: '33564', internal: '172.30.65.179:22', node: 'mspjump', proto: 'SSH' },
];

/** The cross-site link, drawn as a terminator rather than a full segment. */
export const site1Link = {
  id: 'site1',
  label: 'Site 1',
  detail: 'Veeam backup copy target 192.168.64.20 via SITE1_OVPN',
};
