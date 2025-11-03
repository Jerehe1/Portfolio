import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import blogRoutes from './routes/blogs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.get('/api/projects', async (req, res) => {
  try {
    const username = 'Jerehe1'; // 
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      params: {
        sort: 'updated',
        per_page: 10,
        type: 'owner'
      },
      headers: {
        Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    
    const projects = response.data
      .filter(repo => !repo.fork) // Exclude forked repos
      .map(repo => ({
        title: repo.name,
        description: repo.description || 'No description available',
        technologies: repo.topics || ['JavaScript'], // Use topics as technologies
        github: repo.html_url,
        live: repo.homepage || repo.html_url,
        image: `https://opengraph.githubassets.com/1/${username}/${repo.name}`,
        stars: repo.stargazers_count,
        language: repo.language
      }));

    res.json(projects);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error.message);
    res.status(500).json({ error: 'Failed to fetch projects from GitHub' });
  }
});


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blogs', blogRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
