const { getCommitInfo } = require("@changesets/get-github-info");

const REPO = "wereHamster/computation";

module.exports = {
  getDependencyReleaseLine: async () => {
    return "";
  },
  getReleaseLine: async (changeset, _type) => {
    const [firstLine, ...futureLines] = changeset.summary
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const { pull, commit } = await (async () => {
      const info = await getCommitInfo({
        repo: REPO,
        commit: changeset.commit,
      });

      return {
        pull: info?.pull?.markdownLink,
        commit: info?.commit?.markdownLink,
      };
    })();

    const pr = pull || commit ? ` (${pull ?? commit})` : "";

    return `- **${firstLine}**${pr} - ${futureLines.join(" ")}`;
  },
};
