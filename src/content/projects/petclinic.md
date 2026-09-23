---
sheet: "03"
order: 3
title: Enterprise Microservices CI/CD Pipeline
summary: >-
  End-to-end Jenkins pipeline deploying a Java Spring microservices
  application to AWS EKS, with promotion across three environments.
context: Self-directed · Spring PetClinic
stack:
  - Jenkins
  - AWS EKS
  - ECR
  - Rancher
  - Nexus
  - Maven
  - Docker
  - Selenium
  - Prometheus
  - Grafana
source: https://github.com/ofdengiz/petclinic-microservices-with-db
cells:
  - label: Discipline
    value: CI/CD · Containers
  - label: Services
    value: Spring microservices
  - label: Target
    value: AWS EKS
    accent: true
metrics:
  - value: "3"
    label: Environments
    note: dev · staging · prod
  - value: "2"
    label: Test gates
    note: Maven · Selenium
    accent: true
notes:
  - title: Promotion is a pipeline concern, not a deploy script
    body: >-
      The same artefact moves through dev, staging, and production rather than
      being rebuilt per environment. If a build passes staging, the thing that
      reaches production is the thing that was tested, which removes an
      entire class of "it worked in staging" incident.
  - title: Rancher for cluster access, not cluster magic
    body: >-
      Rancher provides a consistent management surface across clusters. It is
      deliberately not doing the deployment. That stays in the pipeline, so
      the delivery path is legible from the Jenkinsfile alone.
revisions:
  - >-
    Move the pipeline to GitHub Actions. Jenkins was the right vehicle for
    learning the mechanics end to end, but a self-hosted controller is
    infrastructure to maintain for a project this size.
  - >-
    Replace Nexus with ECR alone. Running two artefact stores taught the
    difference between them, and then stopped earning its keep.
---

## What it is

Spring PetClinic decomposed into microservices, with a Jenkins pipeline that
takes a commit through build, test, image publication, and rollout to AWS EKS.

The application is a well-known reference implementation, and that is the
point: it removes application novelty from the exercise so the delivery
mechanics are the actual subject.

## The pipeline

Maven builds each service and runs its unit tests. Images are tagged and
pushed to **AWS ECR**. Deployment targets an **EKS** cluster managed through
Rancher, with Selenium exercising the running application before a build is
considered promotable.

Promotion runs across three environments on a multi-branch model, so a change
is validated in a real deployment before it is eligible for the next stage
(see note 1).

## Observability

Prometheus scrapes the cluster and the services; Grafana carries the
dashboards. The pipeline can report a green build, but a green build that
produces a service failing its readiness probe is not a successful delivery.
Having the metrics in the same place as the rollout closes that gap.
