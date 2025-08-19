# Monoweb 


Monoweb is the web application for Online, the informatics student organization at NTNU, found at https://online.ntnu.no. This monorepo contains all the source code for the
applications that power the OnlineWeb experience.

## Local Development

To get started with local development, ensure you have the [applicable tools](CONTRIBUTING.md#tools) installed. To build and run all the
applications, you can use the following commands:

Terminal 1:
```bash
git clone https://github.com/dotkom/monoweb
cd monoweb

doppler login
doppler setup # Press Y on every prompt

docker compose up -d

pnpm install
pnpm migrate:dev # Only needs to be run once to set up the database
pnpm dev
```

## Contributing

Please see the [developer guide](CONTRIBUTING.md) for information on how to get started with development.

## License

Licensed under the MIT license.
