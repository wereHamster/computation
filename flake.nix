{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    flake-utils.url = "github:numtide/flake-utils";

    nix-develop.url = "github:nicknovitski/nix-develop";
    nix-develop.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      nix-develop,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

      in
      {
        packages.nix-develop = nix-develop.packages.${system}.default;

        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs
            pkgs.pnpm
            pkgs.biome
          ];
        };

        devShells.workflow = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs
            pkgs.pnpm
            pkgs.biome
            pkgs.jq
          ];
        };
      }
    );
}
