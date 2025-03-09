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
          packages.default = pkgs.buildNpmPackage {
            pname = "computation";
            version = "0.0.0";

            src = ./.;

            npmDepsHash = "sha256-PXovZvflwPxrrPwC93mg1rTWf+VwCvEuYYa3ij+Ornc=";

            nativeBuildInputs = [
              pkgs.nodejs
              pkgs.biome
              pkgs.jq
            ];

            buildPhase = ''
              ./node_modules/.bin/tsc
              cat package.json | jq 'del(.devDependencies) | .version = "0.0.0"' > dist/package.json
            '';

            checkPhase = ''
              biome lint ./src
              node --test dist/index.test.js
            '';

            installPhase = ''
              mv dist $out
              rm $out/*.test.*
            '';
          };

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
            ];

            shellHook = ''
              npm install >/dev/null 2>&1
            '';
          };
        }
      );
}
