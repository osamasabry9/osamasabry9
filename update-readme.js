const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const path = require('path');

// GitHub Token
const token = process.env.RED_GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

// Read the current README file
const readmePath = path.join(__dirname, 'README.md');
const readmeContent = fs.readFileSync(readmePath, 'utf8');

// Fetch data from GitHub API
async function fetchGitHubData() {
  const repos = await octokit.repos.listForUser({ username: 'osamasabry9', sort: 'updated' });
  return repos.data.slice(0, 5); // Get latest 5 repos
}

// Update the README content
function updateReadme(repos) {
  const repoList = repos.map(repo => `- [${repo.name}](${repo.html_url}): ${repo.description}`).join('\n');
  
  const newContent = readmeContent.replace(
    /<!-- START_SECTION:repos -->([\s\S]*?)<!-- END_SECTION:repos -->/,
    `<!-- START_SECTION:repos -->\n${repoList}\n<!-- END_SECTION:repos -->`
  );

  fs.writeFileSync(readmePath, newContent);
}

// Main function
(async () => {
  const repos = await fetchGitHubData();
  updateReadme(repos);
})();
