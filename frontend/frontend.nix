{ pkgs, ... }:

with pkgs;

let
  frontend = buildNpmPackage {
    name = "frontend";

    src = ./.;

    # Change this anytime you change the package-lock.json file
    npmDepsHash = "sha256-LU11fMI78JygtcUBYXOr+0TzPql9raCaWD1sP3ijxEI=";

    buildPhase = ''
      npm run lint
      npm run build
      mkdir -p $out/lib/node_modules/frontend/dist
      cp -r dist/* $out/lib/node_modules/frontend/dist
    '';

    postInstall = ''
      wrapProgram $out/bin/frontend \
        --set NODE_PATH $out/lib/node_modules/frontend/node_modules \
        --set NODE_ENV production \
        --set DIST_DIR $out/lib/node_modules/frontend/dist
    '';
  };

  dockerImage = dockerTools.buildImage {
    name = "frontend";
    tag = "latest";
    config = {
      Cmd = [ "${frontend}/bin/frontend" ];
    };
  };
in
{
  inherit dockerImage frontend;
}
