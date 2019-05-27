workflow "Publish" {
  on = "push"
  resolves = "publish"
}

action "publish" {
  needs = "build"
  uses = "actions/npm@master"
  args = "publish --access public --tag commit result"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "build" {
  uses = "docker://nixos/nix"
  runs = "./script/build"
}
