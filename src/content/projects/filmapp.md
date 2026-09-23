---
sheet: "04"
order: 4
title: filmapp · DevSecOps Pipeline
summary: >-
  A React and TypeScript application whose real artefact is its pipeline:
  every security gate runs before an image reaches the registry.
context: Self-directed
stack:
  - React
  - TypeScript
  - Jenkins
  - SonarQube
  - OWASP Dependency-Check
  - Trivy
  - Docker
  - Kubernetes
source: https://github.com/ofdengiz/filmapp
cells:
  - label: Discipline
    value: DevSecOps
  - label: Gates
    value: Quality · Dependency · Image
  - label: Enforcement
    value: Blocking
    accent: true
metrics:
  - value: "3"
    label: Security gates
    note: SonarQube · OWASP · Trivy
    accent: true
  - value: "2"
    label: Trivy scans
    note: Filesystem and image
notes:
  - title: A gate that warns is not a gate
    body: >-
      Each stage fails the build rather than annotating it. A scanner whose
      output is a report nobody reads provides the appearance of security
      without the property, and the cost of that illusion is paid later.
  - title: Scanning happens before publication
    body: >-
      Trivy runs against the filesystem and again against the built image, and
      both run before the push. A vulnerable image that reaches the registry
      has to be assumed pulled. Keeping the scan upstream of publication
      means a failure is a non-event rather than an incident.
  - title: The application is the smaller half
    tone: annotate
    body: >-
      The React front end is deliberately modest. Judging this project on its
      UI would be reading the wrong artefact; the Jenkinsfile is the thing
      under review.
revisions:
  - >-
    Add SBOM generation and retention, so what shipped can be re-examined when
    a CVE lands after release rather than only before it.
  - >-
    Pin base images by digest instead of tag. A moving tag quietly undermines
    the guarantee the scan stage exists to provide.
---

## What it is

A streaming-app demo built with React and TypeScript, wrapped in a Jenkins
pipeline that treats security checks as build-blocking conditions rather than
advisory reports.

## The gates

**SonarQube** runs a quality gate over the source. **OWASP Dependency-Check**
audits the dependency tree against known advisories. **Trivy** scans the
filesystem and then the built image.

All three run before the image is pushed (see note 2). Any of them can fail
the build, and a failed build produces no artefact (see note 1).

## Rollout

A passing build produces a tagged image and a Kubernetes rollout. The
deployment step is intentionally unremarkable. By the time it runs, the
interesting decisions have already been made and enforced upstream.
