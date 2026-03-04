# Grades

## Local Development

```bash
doppler setup # Press enter on every prompt

docker compose up -d
pnpm migrate:dev-grades-with-fixtures # Only needs to be run once to set up the database with sample data

# If the migrate command failed, you can reset the database and try again:
docker compose down
docker compose up -d
pnpm migrate:dev-grades-with-fixtures

# Then install dependencies and start the development server:
pnpm install
pnpm dev:grades

# The frontend will be available at http://localhost:5001
```
