# Portfolio MERN App

A full-stack portfolio website with admin panel built using MongoDB, Express, React, and Node.js.

## Features

- 🎨 Modern, responsive portfolio design
- 📝 Admin panel for managing projects and blogs
- 🔒 JWT authentication
- ⭐ Featured projects showcase
- 🗄️ MongoDB database
- 🔥 Hot reload with Vite

## Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS
- Framer Motion

**Backend:**
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio-mern
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Atlas Connection
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
   
   # JWT Secret (use a random secure string)
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   
   # Server Port
   PORT=5000
   
   # Optional: GitHub Personal Access Token for higher API rate limits
   GITHUB_TOKEN=
   ```

   **Important:** Replace the MongoDB connection string with your own from MongoDB Atlas.

4. **Create Admin User**
   
   Run the seed script to create a test admin account:
   ```bash
   node server/seed.js
   ```
   
   Default credentials:
   - Email: `admin@test.com`
   - Password: `admin123`

5. **Start the Application**
   ```bash
   npm run dev
   ```
   
   This will start both the backend (port 5000) and frontend (port 5173).

## Usage

### Main Portfolio
- Visit `http://localhost:5173/` to view your portfolio

### Admin Panel
- Visit `http://localhost:5173/admin` to access the admin panel
- Login with your credentials
- Add, edit, or delete projects and blogs
- Mark projects as "Featured" to showcase them prominently

## Scripts

- `npm run dev` - Run both frontend and backend concurrently
- `npm run server` - Run backend only
- `npm run client` - Run frontend only
- `node server/seed.js` - Create test admin user

## Project Structure

```
portfolio-mern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── data/          # Static data
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── server.js         # Server entry point
│   └── seed.js           # Database seeding
├── .env                  # Environment variables (not in git)
├── .gitignore
└── package.json          # Root package.json

```

## Customization

### Update Your Information
1. Change GitHub username in `client/src/pages/Home.jsx`
2. Update skills in `client/src/components/SkillsCard.jsx`
3. Modify header text in `client/src/components/Header.jsx`
4. Update footer in `client/src/components/Footer.jsx`

### Add Your Own Projects
1. Go to `/admin`
2. Login with your credentials
3. Click on the "Projects" tab
4. Click "Add New Project"
5. Fill in the details and submit

## Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `cd client && npm run build`
2. Deploy the `client/dist` folder

### Backend (Railway/Render/Heroku)
1. Set environment variables on your hosting platform
2. Deploy the root directory
3. Update frontend API URLs to your deployed backend URL

## Security Notes

- Change the `JWT_SECRET` in production
- Use strong passwords
- Never commit `.env` file to git
- Update MongoDB connection string for production

## License

MIT License - feel free to use this for your own portfolio!

## Support

For issues or questions, please open an issue on GitHub.
