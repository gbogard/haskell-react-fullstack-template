{ pkgs, ... }:

let
  haskellPackages = pkgs.haskellPackages.override {
    overrides = self: super: {
      server = super.callCabal2nix "server" ./. { };
    };
  };
  server = haskellPackages.server;
  dockerImage = pkgs.dockerTools.buildImage {
    name = "server";
    tag = "latest";
    config = {
      Cmd = [ "${server}/bin/server" ];
    };
  };
in
{
  inherit server dockerImage;
}
