---
slug: /
sidebar_position: 1
---

# Monoweb | Galactic Thunderdome X

Galactic Thunderdome X is the monorepo behind Onlineweb, the main application for Online, student organization for Informatics at NTNU. A monorepo is quite simply a collection of different projects at the same place, instead of splitting it to different repositories. The current available applications are:

- Mail handler
- [Core API](/apps/ow-api)
- [Web](/apps/web)
- [Dashboard](/apps/dashboard)
- [Docs](/apps/docs), which you're reading now!


Each application might make use of the internal packages available in [packages](/packages). For instance, both **dashboard** and **web** might make use of [ow-ui](/packages/ow-ui), our design systems. All systems also uses a structured configured [logger](/packages/ow-logger) for logging. The current available packages are:

- **eslint-config-ow**: ESLint configuration
- **ow-db**: Fully typed database client and migrator
- **ow-logger**: Structured logger
- **ow-ui**: Design System.