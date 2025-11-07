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

// Screenshot proxy endpoint using ApiFlash
app.get('/api/screenshot/:encodedUrl', async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.encodedUrl);
    
    // ApiFlash screenshot service with your API key from environment
    const apiKey = process.env.APIFLASH_ACCESS_KEY || 'dbd1e0c4aca4477184674678bd988aff';
    const apiflashUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(url)}&width=1200&height=800&format=png&wait_until=page_loaded&fresh=true&full_page=false`;
    
    console.log(`📸 Taking ApiFlash screenshot for: ${url}`);
    
    try {
      const response = await axios({
        method: 'GET',
        url: apiflashUrl,
        responseType: 'stream',
        timeout: 25000, // Increased timeout for ApiFlash
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/png,image/*,*/*;q=0.8'
        }
      });

      // Set CORS-friendly headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=7200'); // Cache for 2 hours
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      
      // Pipe the image
      response.data.pipe(res);
      console.log(`✅ ApiFlash screenshot successful for: ${url}`);
      return;
      
    } catch (apiflashError) {
      console.log(`❌ ApiFlash failed:`, apiflashError.message);
      
      // Fallback to other services if ApiFlash fails
      const fallbackServices = [
        `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(url)}`,
        `https://api.screenshotmachine.com?key=demo&url=${encodeURIComponent(url)}&dimension=1200x800&format=png`
      ];

      for (let i = 0; i < fallbackServices.length; i++) {
        try {
          console.log(`📸 Trying fallback service ${i + 1} for: ${url}`);
          
          const response = await axios({
            method: 'GET',
            url: fallbackServices[i],
            responseType: 'stream',
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'image/png,image/*,*/*;q=0.8'
            }
          });

          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=7200');
          res.setHeader('Access-Control-Allow-Origin', '*');
          
          response.data.pipe(res);
          console.log(`✅ Fallback screenshot successful for: ${url}`);
          return;
          
        } catch (serviceError) {
          console.log(`❌ Fallback service ${i + 1} failed:`, serviceError.message);
          continue;
        }
      }
    }
    
    // All services failed
    throw new Error('All screenshot services failed');
    
  } catch (error) {
    console.error('Screenshot proxy error:', error.message);
    
    // Redirect to language-based fallback image
    res.redirect('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&crop=entropy');
  }
});

// Test ApiFlash screenshot service endpoint
app.get('/api/test-apiflash', async (req, res) => {
  const testUrl = req.query.url || 'https://jerehe1.github.io/CountryApp/';
  const apiKey = 'dbd1e0c4aca4477184674678bd988aff';
  
  const apiflashUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(testUrl)}&width=1200&height=800&format=png&wait_until=page_loaded&fresh=true&full_page=false`;
  
  try {
    const response = await axios.head(apiflashUrl, { timeout: 15000 });
    res.json({
      success: true,
      testUrl,
      apiflashUrl,
      status: response.status,
      proxyUrl: `http://localhost:${PORT}/api/screenshot/${encodeURIComponent(testUrl)}`,
      message: 'ApiFlash is working! Screenshots should load properly now.',
      apiKey: 'dbd1e0c4aca4477184674678bd988aff (your key)'
    });
  } catch (error) {
    res.json({
      success: false,
      testUrl,
      apiflashUrl,
      error: error.message,
      status: error.response?.status || 'timeout',
      message: 'ApiFlash test failed. Check your API key or the URL.'
    });
  }
});

// Function to get project image with screenshot priority
const getProjectImage = (repo, settings, liveUrl) => {
  if (settings.customImage) {
    return settings.customImage;
  }
  
  // Try screenshot proxy for live URLs
  if (liveUrl && !liveUrl.includes('github.com')) {
    return `http://localhost:${PORT}/api/screenshot/${encodeURIComponent(liveUrl)}`;
  }
  
  // Fallback to language-based images
  const languageImages = {
    'JavaScript': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop&crop=entropy',
    'TypeScript': 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop&crop=entropy',
    'Python': 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=600&h=400&fit=crop&crop=entropy',
    'HTML': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=entropy',
    'CSS': 'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=600&h=400&fit=crop&crop=entropy',
    'React': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop&crop=entropy',
    'Vue': 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=600&h=400&fit=crop&crop=entropy',
    'Java': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop&crop=entropy',
    'C++': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&h=400&fit=crop&crop=entropy',
    'PHP': 'https://images.unsplash.com/photo-1599507593362-fb8886264851?w=600&h=400&fit=crop&crop=entropy'
  };
  
  return languageImages[repo.language] || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&crop=entropy';
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
        
        // Enhanced live URL detection
        let liveUrl = null;
        if (repo.homepage && !repo.homepage.includes('github.com')) {
          liveUrl = repo.homepage;
        } else if (settings.liveUrl && !settings.liveUrl.includes('github.com')) {
          liveUrl = settings.liveUrl;
        } else {
          // Auto-detect GitHub Pages
          const githubPagesUrl = `https://${username.toLowerCase()}.github.io/${repo.name}/`;
          liveUrl = githubPagesUrl;
        }
        
        // Get project image with screenshot priority
        const projectImage = getProjectImage(repo, settings, liveUrl);
        
        console.log(`🔍 ${repo.name}: Live URL = ${liveUrl}, Image = ${projectImage.substring(0, 50)}...`);

        return {
          repoName: repo.name,
          title: repo.name,
          description: settings.customDescription || repo.description || 'No description available',
          technologies: repo.topics || [repo.language || 'Code'].filter(Boolean),
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