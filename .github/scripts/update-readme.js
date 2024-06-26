import { promises as fs } from 'fs';
import { Octokit } from "@octokit/core";

// GitHub Token
const token = process.env.RED_GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

// README file path
const readmePath = './README.md';

// Function to fetch latest repositories
async function fetchLatestRepos() {
  try {
    const response = await octokit.request('GET /users/{username}/repos', {
      username: 'osamasabry9',
      sort: 'updated',
      per_page: 2 // Get the latest 2 repositories
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    return [];
  }
}

// Function to fetch recent GitHub activity
async function fetchGitHubActivity() {
  try {
    const response = await octokit.request('GET /users/{username}/events', {
      username: 'osamasabry9',
      per_page: 3 // Get the latest 3 events
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub activity:', error.message);
    return [];
  }
}

// Function to update the README file content
async function updateREADME() {
  try {
    let readmeContent = await fs.readFile(readmePath, 'utf8');
    
    // Fetch data
    const repos = await fetchLatestRepos();
    const activities = await fetchGitHubActivity();

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
    await fs.writeFile(readmePath, readmeContent);
    console.log('README updated successfully!');
  } catch (error) {
    console.error('Error updating README:', error);
  }
}

// Execute updateREADME function
updateREADME();
