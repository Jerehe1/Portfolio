import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import { authenticate, isAdmin } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️  Running without MongoDB - admin features disabled');
    });
} else {
  console.log('⚠️  No MongoDB URI provided - running without database');
}

// ApiFlash screenshot endpoint 
app.get('/api/screenshot/:encodedUrl', async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.encodedUrl);
    const apiKey = process.env.APIFLASH_ACCESS_KEY || 'dbd1e0c4aca4477184674678bd988aff';
    const apiflashUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(url)}&width=1200&height=800&format=png&wait_until=page_loaded&fresh=true&full_page=false`;
    
    console.log(`📸 Taking ApiFlash screenshot for: ${url}`);
    
    const response = await axios({
      method: 'GET',
      url: apiflashUrl,
      responseType: 'stream',
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/png,image/*,*/*;q=0.8'
      }
    });

    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=7200');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    response.data.pipe(res);
    console.log(`✅ ApiFlash screenshot successful for: ${url}`);
    
  } catch (error) {
    console.error(`❌ Screenshot failed for ${url}:`, error.message);
    
   
    res.redirect('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&crop=entropy');
  }
});

// Simplified function to get project image 
const getProjectImage = (repo, settings, liveUrl, req) => {
  if (settings.customImage) {
    return settings.customImage;
  }
  
  // ApiFlash for live URLs
  if (liveUrl && !liveUrl.includes('github.com')) {
    // Fix: Use the request host instead of hardcoded localhost
    const protocol = req.protocol || 'https';
    const host = req.get('host');
    return `${protocol}://${host}/api/screenshot/${encodeURIComponent(liveUrl)}`;
  }
  
  // Single fallback image for all projects 
  return 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&crop=entropy';
};

// Combined projects endpoint - GitHub data + admin settings
app.get('/api/projects', async (req, res) => {
  try {
    const username = 'Jerehe1';
    
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      params: {
        sort: 'updated',
        per_page: 20,
        type: 'owner'
      },
      headers: {
        Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    // Get admin settings from database 
    let adminSettings = [];
    let settingsMap = new Map();
    
    try {
      if (mongoose.connection.readyState === 1) {
        const Project = (await import('./models/Project.js')).default;
        adminSettings = await Project.find().lean();
        settingsMap = new Map(adminSettings.map(s => [s.repoName, s]));
        console.log(`📊 Found ${adminSettings.length} admin settings`);
      } else {
        console.log('📊 No database connection - using GitHub data only');
      }
    } catch (error) {
      console.log('📊 Database error - using GitHub data only:', error.message);
    }

    // Combine GitHub data with admin settings
    const projects = response.data
      .filter(repo => !repo.fork)
      .map(repo => {
        const settings = settingsMap.get(repo.name) || {};
        
        
        let liveUrl = null;
        if (repo.homepage && !repo.homepage.includes('github.com')) {
          liveUrl = repo.homepage;
        } else if (settings.liveUrl && !settings.liveUrl.includes('github.com')) {
          liveUrl = settings.liveUrl;
        } else {
          
          const githubPagesUrl = `https://${username.toLowerCase()}.github.io/${repo.name}/`;
          liveUrl = githubPagesUrl;
        }
        
        
        const projectImage = getProjectImage(repo, settings, liveUrl, req);
        
        console.log(`🔍 ${repo.name}: Live URL = ${liveUrl}, Image = ${projectImage.substring(0, 50)}...`);

        return {
          repoName: repo.name,
          title: repo.name,
          description: settings.customDescription || repo.description || 'No description available',
          technologies: [
            ...(repo.topics || []), 
            repo.language
          ].filter(Boolean).filter((tech, index, arr) => arr.indexOf(tech) === index), 
          github: repo.html_url,
          live: liveUrl,
          image: projectImage,
          featured: settings.featured || false,
          hidden: settings.hidden || false,
          order: settings.order || 0,
          stars: repo.stargazers_count,
          language: repo.language,
          updatedAt: repo.updated_at
        };
      })
      .filter(project => !project.hidden)
      .sort((a, b) => {
        if (a.featured !== b.featured) return b.featured - a.featured;
        if (a.order !== b.order) return b.order - a.order;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching combined projects:', error.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GitHub repos endpoint (admin only)
app.get('/api/github-repos', authenticate, isAdmin, async (req, res) => {
  try {
    const username = 'Jerehe1';
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
        language: repo.language
      }));

    res.json(repos);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error.message);
    res.status(500).json({ error: 'Failed to fetch GitHub repos' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/projects', projectRoutes); 

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});