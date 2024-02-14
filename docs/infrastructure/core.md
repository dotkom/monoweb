# Core Infrastructure

The core infrastructure of the project contains infrastructure resoruces that are either shared across all environments,
or that do not need to be duplicated across environments.

Examples of resources like this are public ecr repositories and vercel projects.

[Source](/infra/core/main.tf)

## Core Infrastructure Components

All vercel projects are managed in the core Terraform project. This is because vercel projects have their own
environments, and as such, we don't need multiple vercel projects for the same source code.
