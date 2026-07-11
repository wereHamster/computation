{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";

    nix-develop.url = "github:nicknovitski/nix-develop";
    nix-develop.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      nixpkgs,
      systems,
      nix-develop,
      ...
    }:
    let
      forAllSystems =
        function: nixpkgs.lib.genAttrs (import systems) (system: function nixpkgs.legacyPackages.${system});
    in
    {
      packages = forAllSystems (pkgs: {
        nix-develop = nix-develop.packages.${pkgs.system}.default;
      });

      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          nativeBuildInputs = [
            pkgs.nodejs
            pkgs.pnpm
            pkgs.biome
          ];
        };

        workflow = pkgs.mkShell {
          nativeBuildInputs = [
            pkgs.nodejs
            pkgs.pnpm
            pkgs.biome
            pkgs.jq
          ];
        };
      });
    };
}
