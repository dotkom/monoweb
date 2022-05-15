---
slug: /
sidebar_position: 1
---

# Monoweb | Galactic Thunderdome X

Galactic Thunderdome X is the monorepo behind Onlineweb, the main application for Online, student organization for Informatics at NTNU. A monorepo is quite simply a collection of different projects at the same place, instead of splitting it to different repositories. The current available applications are:

- Mail handler
- [Core API](https://github.com/dotkom/galactic-thunderdome-x/tree/master/apps/ow-api)
- [Web](https://github.com/dotkom/galactic-thunderdome-x/tree/master/apps/web)
- [Dashboard](https://github.com/dotkom/galactic-thunderdome-x/tree/master/apps/dashboard)
- [Docs](https://github.com/dotkom/galactic-thunderdome-x/tree/master/apps/docs), which you're reading now!


Each application might make use of the internal packages available in [packages](https://github.com/dotkom/galactic-thunderdome-x/tree/master/packages). For instance, both **dashboard** and **web** might make use of [ow-ui](https://github.com/dotkom/galactic-thunderdome-x/tree/master/packages/ow-ui), our design systems. All systems also uses a structured configured [logger](https://github.com/dotkom/galactic-thunderdome-x/tree/master/packages/logger) for logging. The current available packages are:

- **eslint-config-ow**: ESLint configuration
- **ow-db**: Fully typed database client and migrator
- **ow-logger**: Structured logger
- **ow-ui**: Design System.