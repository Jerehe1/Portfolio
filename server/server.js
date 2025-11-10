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

// Screenshot endpoint using ScreenshotOne with simple in-memory caching
app.get('/api/screenshot/:encodedUrl', async (req, res) => {
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(req.params.encodedUrl);
    const width = Number(req.query.width) || 1200;
    const height = Number(req.query.height) || 800;
    const fullPage = req.query.fullPage === 'true';

    // Init cache
    if (!global._screenshotCache) global._screenshotCache = new Map();
    const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    const cacheKey = `${decodedUrl}|${width}|${height}|${fullPage}`;

    // Serve from cache if fresh
    const cached = global._screenshotCache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=7200');
      return res.end(cached.buffer);
    }

    const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY || process.env.SCREENSHOT_API_KEY;
    if (!accessKey) {
      console.log(`🖼️ No ScreenshotOne key set; using placeholder for ${decodedUrl}`);
      return res.redirect('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&crop=entropy');
    }

    const requestUrl = `https://api.screenshotone.com/take?access_key=${accessKey}`
      + `&url=${encodeURIComponent(decodedUrl)}`
      + `&viewport_width=${width}&viewport_height=${height}`
      + `&full_page=${fullPage}`
      + `&format=png`;
    console.log(`📸 [ScreenshotOne] ${decodedUrl}`);

    const response = await axios.get(requestUrl, {
      responseType: 'arraybuffer',
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/png,image/*,*/*;q=0.8'
      }
    });

    const buffer = Buffer.from(response.data);
    global._screenshotCache.set(cacheKey, { buffer, ts: Date.now() });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=7200');
    res.end(buffer);
  } catch (error) {
    const safeUrl = decodedUrl || req.params.encodedUrl;
    console.error(`❌ Screenshot failed for ${safeUrl}:`, error.message);
    res.redirect('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&crop=entropy');
  }
});

// Simplified function to get project image
// Prefer custom image; if live URL is non-GitHub, use internal screenshot endpoint; else fallback.
const getProjectImage = (repo, settings, liveUrl, req) => {
  if (settings.customImage) return settings.customImage;
  if (liveUrl && !liveUrl.includes('github.com')) {
    const protocol = req.protocol || 'http';
    const host = req.get('host');
    return `${protocol}://${host}/api/screenshot/${encodeURIComponent(liveUrl)}`;
  }
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