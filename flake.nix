{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };

        in {
          devShells.default = pkgs.mkShell {
            buildInputs = [
              pkgs.nodejs
              pkgs.biome
              pkgs.jq
            ];
          };

          devShells.workflow = pkgs.mkShell {
            buildInputs = [
              pkgs.nodejs
              pkgs.biome
              pkgs.jq
            ];

            shellHook = ''
              npm install >/dev/null 2>&1
            '';
          };
        }
      );
}
