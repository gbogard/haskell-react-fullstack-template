{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = (import (inputs.nixpkgs) { inherit system; });
        # pg_ctl wrapper that makes it possible to start a postgresql server locally
        # see https://github.com/NixOS/nixpkgs/issues/83770 for why this is needed
        wrappedPgctl = pkgs.writeShellScriptBin "my_pg_ctl" ''
          export PGDATA="$(realpath .pgdata)"
          if [ "$1" = "initdb" ]; then
            ${pkgs.postgresql}/bin/pg_ctl "$@"
          else
            ${pkgs.postgresql}/bin/pg_ctl -o "-k /tmp" "$@"
          fi
        '';

        server = import ./server/server.nix { inherit pkgs; };
        frontend = import ./frontend/frontend.nix { inherit pkgs; };
      in
      {
        packages = {
          frontend = frontend.frontend;
          dockerImage = frontend.dockerImage;
          server = server.server;
          serverImage = server.dockerImage;
        };

        devShells.default = pkgs.mkShell {
          name = "haskell-react-fullstack-template";

          shellHook = ''
            export PGDATA="$(realpath .pgdata)"
            export PGPORT=5432
            export PGHOST=localhost
            export PGUSER=$USER
            export PGPASSWORD=postgres
            export PGDATABASE=postgres
            export DB_URL=postgres://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE

            echo "Welcome to the Haskell / React development environment!"
            echo "You can start the Postgresql server with 'my_pg_ctl start' and stop it with 'my_pg_ctl stop'."
          '';

          inputsFrom = [ (server.server.envFunc { withHoogle = true; }) ];

          packages = with pkgs; [
            # front-end stuff
            nodejs_24

            # back-end stuff
            haskellPackages.cabal-install
            haskell-language-server
            ghcid
            haskellPackages.fourmolu # Haskell code formatter

            # services
            postgresql
            wrappedPgctl

            # utils
            nixfmt-rfc-style # nix formatter
            nixd # nix language server
          ];
        };
      }
    );
}
