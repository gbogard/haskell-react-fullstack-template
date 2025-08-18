# Full-stack React/Haskell application template

A template for a full-stack React/Haskell application.

## Features

- React frontend with Typescript and server-side rendering (SSR)
- Haskell backend with Scotty
- Support for running containerized services, like a development database, using Podman and Podman-compose
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
It also provides podman and podman-compose, to run containerized services, like a development database.

**Important:**: if you aren't on NixOS, you need to install the `uidmap` package, because Podman requires it to run containers.

```shell
sudo apt install uidmap
```

That's the only thing you'll need to install on your machine. Everything else is made available by the Nix shell.

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

You can run containerized services using podman-compose:

```bash
podman-compose up -d
```

(You will have to remember to stop them using `podman-compose down` when you're done)

This template includes a default `docker-compose.yaml` file that starts a Postgresql database.

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

## Solving Podman issues

If you're having issues starting containers with Podman, try these troubleshooting steps.

1. Make sure that the `uidmap` package is installed on your system.
2. Make sure that you have a `~/.config/containers/registries.conf` file that contains the following:

```toml
unqualified-search-registries = ["docker.io"]
```
3. Make sure that you have a `~/.config/containers/policy.json` file that contains the following:

```json
{
  "default": [
    {
      "type": "insecureAcceptAnything"
    }
  ]
}
```
This will allow Podman to pull images from Docker Hub (including potentially dangerous images).
