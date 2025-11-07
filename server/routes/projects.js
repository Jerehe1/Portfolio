import express from 'express';
import Project from '../models/Project.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get GitHub repos for admin selection
router.get('/github-repos', authenticate, isAdmin, async (req, res) => {
  try {
    const username = 'Jerehe1';
    const axios = (await import('axios')).default;
    
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      params: { sort: 'updated', per_page: 50, type: 'owner' },
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
        language: repo.language,
        stars: repo.stargazers_count
      }));

    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GitHub repos' });
  }
});

// Get all project settings (featured + custom descriptions)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const settings = await Project.find().sort({ createdAt: -1 });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/update project settings
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { repoName } = req.body;
    
    // Check if settings already exist for this repo
    let project = await Project.findOne({ repoName });
    
    if (project) {
      // Update existing settings
      Object.assign(project, req.body);
      await project.save();
    } else {
      // Create new settings
      project = new Project(req.body);
      await project.save();
    }
    
    res.json(project);
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
      { new: true }
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
    
    res.json({ message: 'Settings removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
