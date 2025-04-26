# Migrere data fra OW4

1. Eksporter OW4 tabell til en json fil

Alternative 1: bruke tableplus

åpne tableplus, klikk på tabellen du vil eksportere, klikk på export, velg json og klikk på export

Alternativ 2: bruke psql

```bash
psql "postgres://ow:owpassword123@localhost:4010/ow" -c "SELECT json_agg(t) FROM event t;" > data.json
```

- Bytt ut connection string med ow4 connection string
- Bytt ut `event` med tabellen du vil eksportere

Denne er litt jalla, du må slette noen linjer fra data.json

2. Skriv script som inserter inn i monoweb-db

3. Sett opp riktig miljø du vil migrere. Letteste er å bruke monoweb-rpc i riktig miljø.

4. Kjør scriptet i riktig miljø: `doppler run -- tsx ./src/scripts/migrate-offlines-from-ow4.ts`