import express from 'express';
import Project from '../models/Project.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all project settings 
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const projectSettings = await Project.find().sort({ order: -1, createdAt: -1 }).lean();
    res.json(projectSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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
