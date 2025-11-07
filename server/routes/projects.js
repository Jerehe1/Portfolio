import express from 'express';
import Project from '../models/Project.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get GitHub repos for selection - MOVE THIS TO THE TOP
router.get('/github-repos', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('🔍 Fetching GitHub repos for admin...');
    const username = 'Jerehe1';
    const axios = (await import('axios')).default;
    
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      params: {
        sort: 'updated',
        per_page: 50,
        type: 'owner'
      },
      headers: {
        Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    const repos = response.data
      .filter(repo => !repo.fork)
      .map(repo => ({
        name: repo.name,
        description: repo.description || 'No description available',
        url: repo.html_url,
        homepage: repo.homepage,
        topics: repo.topics || [],
        language: repo.language,
        stars: repo.stargazers_count,
        updatedAt: repo.updated_at
      }));

    console.log(`✅ Found ${repos.length} GitHub repos`);
    res.json(repos);
  } catch (error) {
    console.error('❌ GitHub API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch GitHub repos', details: error.message });
  }
});

// Get all project settings 
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const projectSettings = await Project.find().sort({ order: -1, createdAt: -1 }).lean();
    res.json(projectSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/update project settings
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { repoName } = req.body;
    
    let project = await Project.findOne({ repoName });
    
    if (project) {
      Object.assign(project, req.body);
      await project.save();
    } else {
      project = new Project(req.body);
      await project.save();
    }
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project settings
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project settings not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project settings
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project settings not found' });
    }
    res.json({ message: 'Project settings deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
