# React + Vite + TypeScript Template (react-vite-ui)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Dan5py/react-vite-ui/blob/main/LICENSE)

A React + Vite template powered by shadcn/ui.

## 🎉 Features

- **React** - A JavaScript library for building user interfaces.
- **Vite** - A fast, opinionated frontend build tool.
- **TypeScript** - A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS** - A utility-first CSS framework.
- **Tailwind Prettier Plugin** - A Prettier plugin for formatting Tailwind CSS classes.
- **ESLint** - A pluggable linting utility for JavaScript and TypeScript.
- **PostCSS** - A tool for transforming CSS with JavaScript.
- **Autoprefixer** - A PostCSS plugin to parse CSS and add vendor prefixes.
- **shadcn/ui** - Beautifully designed components that you can copy and paste into your apps.

## ⚙️ Prerequisites

Make sure you have the following installed on your development machine:

- Node.js (version 16 or above)
- pnpm (package manager)

## 🚀 Getting Started

Follow these steps to get started with the react-vite-ui template:

1. Clone the repository:

   ```bash
   git clone https://github.com/dan5py/react-vite-ui.git
   ```

2. Navigate to the project directory:

   ```bash
   cd react-vite-ui
   ```

3. Install the dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

## 📜 Available Scripts

- pnpm dev - Starts the development server.
- pnpm build - Builds the production-ready code.
- pnpm lint - Runs ESLint to analyze and lint the code.
- pnpm preview - Starts the Vite development server in preview mode.

## 📂 Project Structure

The project structure follows a standard React application layout:

```python
react-vite-ui/
  ├── node_modules/      # Project dependencies
  ├── public/            # Public assets
  ├── src/               # Application source code
  │   ├── components/    # React components
  │   │   └── ui/        # shadc/ui components
  │   ├── styles/        # CSS stylesheets
  │   ├── lib/           # Utility functions
  │   ├── App.tsx        # Application entry point
  │   └── index.tsx      # Main rendering file
  ├── eslint.config.js     # ESLint configuration
  ├── index.html         # HTML entry point
  ├── postcss.config.js  # PostCSS configuration
  ├── tailwind.config.ts # Tailwind CSS configuration
  ├── tsconfig.json      # TypeScript configuration
  └── vite.config.ts     # Vite configuration
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://choosealicense.com/licenses/mit/) file for details.

# Vite Application with Docker and Nginx

This repository contains a Vite-built React application that can be served locally using Docker and Nginx.

## Why Docker and Nginx?

When building a Vite application with `npm run build`, the resulting files in the `dist` directory are optimized for production with:
- Hashed filenames for cache busting (e.g., `index-DzP5xbg0.css`)
- Minified and bundled JavaScript and CSS
- Static assets with optimized paths

These files need to be served with the correct MIME types and path configurations, which can cause issues when using simple development servers like Live Server. Common errors include:

```
Refused to apply style from '...' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.
```

## Solution: Docker with Nginx

This repository includes a Docker Compose setup that properly serves your Vite application using Nginx, ensuring:
- Correct MIME types for all assets
- Proper handling of SPA routing
- Optimal cache headers

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running on your machine

### Running the Application

1. Build your Vite application (if you haven't already):
   ```bash
   npm run build
   ```

2. Start the Docker container:
   ```bash
   docker compose up
   ```

3. Access your application at:
   ```
   http://localhost:8080
   ```

4. To stop the container, press `Ctrl+C` in the terminal or run:
   ```bash
   docker compose down
   ```

## Configuration Files

### docker-compose.yml

```yaml
version: '3'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped
```

### nginx.conf

The custom Nginx configuration ensures:
- Proper MIME types for JavaScript, CSS, and SVG files
- SPA routing with fallback to index.html
- Appropriate cache headers

## Customization

- To change the port, modify the `ports` section in `docker-compose.yml`
- For additional Nginx configurations, edit the `nginx.conf` file

## Troubleshooting

If you encounter issues:

1. Ensure Docker is running on your system
2. Verify that the `dist` directory contains your built Vite application
3. Check that port 8080 is not already in use by another application
4. Review Docker logs with `docker compose logs`
