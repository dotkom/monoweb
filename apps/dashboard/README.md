# Dashboard

Application for the OnlineWeb Dashboard.

## Setup

Create a .env file with the following contents for local development. This is required to ensure that Next Auth properly
redirects us to the dashboard port, and not the `web` port.

```env
NEXTAUTH_URL=http://localhost:3002
```