let
  pkgs = import <nixpkgs> {};

in {
  commit = { commit }: pkgs.stdenv.mkDerivation {
    name = "computation";
    src = ./.;

    buildInputs = [
      pkgs.nodejs
      pkgs.biome
      pkgs.jq
      pkgs.cacert
    ];

    buildPhase = ''
      HOME=$PWD npm ci
      ./node_modules/.bin/tsc
      cat package.json | jq 'del(.devDependencies) | .version = "0.0.0-g${commit}"' > dist/package.json
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

  canary = { n, commit }: pkgs.stdenv.mkDerivation {
    name = "computation";
    src = ./.;

    buildInputs = [
      pkgs.nodejs
      pkgs.biome
      pkgs.jq
      pkgs.cacert
    ];

    buildPhase = ''
      HOME=$PWD npm ci
      ./node_modules/.bin/tsc
      npm --no-git-tag-version version patch
      cat package.json | jq 'del(.devDependencies) | .version = .version + "-alpha.${n}+${commit}"' > dist/package.json
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

  head = pkgs.stdenv.mkDerivation {
    name = "computation";
    src = ./.;

    buildInputs = [
      pkgs.nodejs
      pkgs.biome
      pkgs.jq
      pkgs.cacert
    ];

    buildPhase = ''
      HOME=$PWD npm ci
      ./node_modules/.bin/tsc
      cat package.json | jq 'del(.devDependencies)' > dist/package.json
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
}
