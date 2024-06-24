const fs = require('fs');
const { Octokit } = require("@octokit/rest");

// GitHub Token
const token = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

// README file path
const readmePath = './README.md';

// Function to fetch latest repositories
async function fetchLatestRepos() {
  try {
    const repos = await octokit.repos.listForUser({
      username: 'osamasabry9',
      sort: 'updated'
    });
    return repos.data.slice(0, 2); // Get the latest 2 repositories
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
}

// Function to fetch recent GitHub activity
async function fetchGitHubActivity() {
  try {
    const events = await octokit.activity.listPublicEventsForUser({
      username: 'osamasabry9'
    });
    return events.data.slice(0, 3); // Get the latest 3 activities
  } catch (error) {
    console.error('Error fetching GitHub activity:', error);
    return [];
  }
}

// Function to update the README file content
function updateREADME(repos, activities) {
  try {
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Update Latest Repositories section
    const repoList = repos.map(repo => `- [${repo.name}](${repo.html_url}): ${repo.description}`).join('\n');
    readmeContent = readmeContent.replace(
      /<!--START_SECTION:repos-->[\s\S]*<!--END_SECTION:repos-->/,
      `<!--START_SECTION:repos-->\n${repoList}\n<!--END_SECTION:repos-->`
    );

    // Update GitHub Activity section
    const activityList = activities.map(activity => {
      const action = activity.payload.action || activity.payload.ref_type || activity.type;
      const repoName = activity.repo.name;
      const repoLink = `https://github.com/${repoName}`;
      return `- ${action} [${repoName}](${repoLink})`;
    }).join('\n');
    readmeContent = readmeContent.replace(
      /<!--START_SECTION:activity-->[\s\S]*<!--END_SECTION:activity-->/,
      `<!--START_SECTION:activity-->\n${activityList}\n<!--END_SECTION:activity-->`
    );

    // Write updated content to README
    fs.writeFileSync(readmePath, readmeContent);
    console.log('README updated successfully!');
  } catch (error) {
    console.error('Error updating README:', error);
  }
}

// Main function to fetch data and update README
async function main() {
  try {
    const repos = await fetchLatestRepos();
    const activities = await fetchGitHubActivity();
    updateREADME(repos, activities);
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Execute main function
main();
