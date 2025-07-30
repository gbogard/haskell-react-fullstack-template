# Full-stack React/Haskell application template

A template for a full-stack React/Haskell application.

## Features

- React frontend with Typescript and server-side rendering (SSR)
- Haskell backend with Scotty
- PostgreSQL database
- Nix flake to provide a development environment with all the dependencies, and build the application (and, optionally, optimized Docker images)
- ESLint for linting the front-end code
- Sensible settings and recommended extensions for VS Code users

This template does not use a React framework, such as Next.js, Remix, or Tanstack Start, and instead features a minimal SSR setup based on Vite. 
You have to bring your own router (wouter, react-router, etc.), and you can bring any other library you want, no extra opinion included.

The SSR Setup is based on [create-vite-extra](https://github.com/bluwy/create-vite-extra).

The development environment includes the [Formolou](https://github.com/fourmolu/fourmolu) formatter for Haskell, whose behavior is configured in the `.fourmolu.yaml` file.
Formoulu is set as the default formatter for VS Code users, in the `.vscode/settings.json` file.

## Getting started

You can enter a development environment with all the dependencies by running:

```bash
nix develop
```

This environment provides the tools to work on the front end (node, npm, etc.) and the backend (GHC, cabal, formolou etc.). 
It also provides a PostgreSQL server with the database data stored in the local `.pgdata` directory. 
(See [Initializing and running the development database](#initializing-and-running-the-development-database) for more details.)

You can build the application using Nix:

```bash
nix build .#frontend
nix build .#backend
```

And/or run the built application like so:

```bash
nix run .#frontend
nix run .#backend
```

You can also run the frontend and backend in development mode, with hot reloading. To launch the server:

```bash
ghcid
```

This will launch the server and reload it anytime the code changes. It will also display any compilation error.

To launch the front end:

```
cd frontend && npm run dev
```

## Initializing and running the development database

This template comes with a PostgreSQL database for development purposes, and recommends that the database data is stored in the local `.pgdata` directory.

To initialize the postgres cluster, run:

```bash
nix develop
my_pg_ctl initdb
my_pg_ctl start
createdb
```

This will create the database, whose data will be stored in the `.pgdata` directory.

To start the database, run:

```bash
nix develop --command my_pg_ctl start
```

To stop the database, run:

```bash
nix develop --command my_pg_ctl stop
```

The `my_pg_ctl` command is a wrapper around the `pg_ctl` command that sets the required options to start the PostgreSQL server with the data directory set to `./.pgdata`.

## Building Docker images

You can use Nix to build minimal Docker images for the frontend and backend:

```bash
nix build .#frontendImage
# Or: nix build .#serverImage
```
And then load the images into Docker:

```bash
docker load < result
```

These images can then be used to run the application in a container, on systems that don't use NixOS.

## Runtime configuration

This template comes with a simple system to inject runtime configuration into the frontend.

You can update the `frontend/src/server/config.ts` file to change the contents of the runtime configuration. The runtime configuration is serialized and injected into the HTML on the server,
and can be accessed from the client using the `getConfig` function.

This is useful for example to inject the API URL into the frontend, so that the frontend can make requests to the backend.
