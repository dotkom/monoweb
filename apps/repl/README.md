# REPL

Interact with the service layer using the nodejs REPL.

Read more: https://github.com/nodejs/node/blob/main/doc/api/repl.md

Example usage to get a spesific event:
```bash 
$ pnpm dev
$ await core.eventStore.getEvent('event-id')
```