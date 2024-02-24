# Using Neon Like a Pro

This guide will help you get started with the shared Neon database, and the steps you need to take in order to set up
your own branch on Neon.

Neon offers database branching, which essentially means you create a clone of the primary database for testing or
development purposes.

> If you are not a dotkom member, you will not have access to the Neon database. You can still run the applications, but
> you will have to provide the PostgreSQL database yourself.

## Setting up your own branch on Neon

1. Go to [Neon](https://neon.tech) and log in using the `dotbot` account. The email and password combination for this
   account can be found in Doppler.
2. Click on the `web-staging` project.
3. Follow the guide on [Neon Branching](https://neon.tech/docs/introduction/branching)

This provisions a specific compute endpoint for your branch, which you should use for development. Consult the primary
[developer guide](./developer-guide.md) for more information on how to override the environment variables (and database
URL) when running the applications.
