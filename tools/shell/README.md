# Shell

Interact with the service layer using the nodejs REPL.

Read more: https://github.com/nodejs/node/blob/main/doc/api/repl.md

### Example usage
```bash 
$ pnpm dev
$ await core.eventStore.getEvent('event-id')
```

### Tips - Using Doppler to run against production database:
From root of the project:
```bash
doppler run --config=prd -- pnpm shell
```
