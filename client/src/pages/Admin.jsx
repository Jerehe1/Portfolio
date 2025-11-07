import { useState, useEffect } from "react";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({
    repoName: "", 
    customDescription: "", 
    customImage: "", 
    liveUrl: "", 
    featured: false, 
    hidden: false, 
    order: 0
  });
  const [editingProject, setEditingProject] = useState(null);

  const [githubRepos, setGithubRepos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchProjects();
      fetchGithubRepos();
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? "register" : "login";
      const body = isRegister 
        ? { username, email, password }
        : { email, password };

      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        fetchProjects();
        fetchGithubRepos();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  });

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/projects", {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      console.log("Fetched admin projects:", data);
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchGithubRepos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/projects/github-repos", {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setGithubRepos(data);
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject && !editingProject._id) {
        alert("Error: Invalid project ID");
        return;
      }

      const url = editingProject
        ? `http://localhost:5000/api/admin/projects/${editingProject._id}`
        : "http://localhost:5000/api/admin/projects";
      
      const method = editingProject ? "PUT" : "POST";
      
      const projectData = {
        repoName: projectForm.repoName,
        customDescription: projectForm.customDescription,
        customImage: projectForm.customImage,
        liveUrl: projectForm.liveUrl,
        featured: projectForm.featured,
        hidden: projectForm.hidden,
        order: projectForm.order
      };

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        fetchProjects();
        setProjectForm({ repoName: "", customDescription: "", customImage: "", liveUrl: "", featured: false, hidden: false, order: 0 });
        setEditingProject(null);
        alert(editingProject ? "Project updated successfully!" : "Project settings added successfully!");
      } else {
        const data = await response.json();
        console.error("Server error:", data);
        alert("Error: " + (data.error || "Failed to save project"));
      }
    } catch (error) {
      console.error("Request error:", error);
      alert("Error: " + error.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Delete this project setting?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/projects/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleEditProject = (project) => {
    console.log("Editing project:", project);
    console.log("Project ID:", project._id);
    setEditingProject(project);
    setProjectForm({
      repoName: project.repoName,
      customDescription: project.customDescription,
      customImage: project.customImage || "",
      liveUrl: project.liveUrl || "",
      featured: project.featured || false,
      hidden: project.hidden || false,
      order: project.order || 0
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-100 mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition"
            >
              {isRegister ? "Register" : "Login"}
            </button>
          </form>
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full mt-4 text-blue-400 hover:text-blue-300 transition"
          >
            {isRegister ? "Already have an account? Login" : "Need an account? Register"}
          </button>
          <a href="/" className="block text-center mt-4 text-gray-400 hover:text-gray-300">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Project Admin</h1>
          <div className="flex gap-4">
            <a href="/" className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="space-y-8">
          
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Available GitHub Repos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {githubRepos.map((repo) => (
                <div key={repo.name} className="bg-gray-800 p-3 rounded-lg text-sm">
                  <div className="font-semibold">{repo.name}</div>
                  <div className="text-gray-400 text-xs">{repo.language}</div>
                  <div className="text-gray-500 text-xs mt-1">{repo.description}</div>
                </div>
              ))}
            </div>
          </div>

          
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">
              {editingProject ? "Edit Project Settings" : "Add Project Settings"}
            </h2>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Repository Name</label>
                <select
                  value={projectForm.repoName}
                  onChange={(e) => setProjectForm({ ...projectForm, repoName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a GitHub repository...</option>
                  {githubRepos.map((repo) => (
                    <option key={repo.name} value={repo.name}>
                      {repo.name} ({repo.language})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Custom Description (optional)</label>
                <textarea
                  placeholder="Override the GitHub description..."
                  value={projectForm.customDescription}
                  onChange={(e) => setProjectForm({ ...projectForm, customDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Live URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://yourproject.com"
                  value={projectForm.liveUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="flex items-center gap-1">
                    ⭐ Featured Project
                  </span>
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={projectForm.hidden}
                    onChange={(e) => setProjectForm({ ...projectForm, hidden: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>🙈 Hide from portfolio</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                >
                  {editingProject ? "Update Settings" : "Add Settings"}
                </button>
                {editingProject && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(null);
                      setProjectForm({ repoName: "", customDescription: "", customImage: "", liveUrl: "", featured: false, hidden: false, order: 0 });
                    }}
                    className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Project Settings ({projects.length})</h2>
            {projects.length === 0 ? (
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center text-gray-400">
                No project settings yet. Add settings above to feature projects or add custom descriptions.
              </div>
            ) : (
              projects.map((project) => (
                <div key={project._id} className={`bg-gray-900 p-6 rounded-2xl border ${project.featured ? 'border-yellow-500/50' : 'border-gray-800'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{project.repoName}</h3>
                        {project.featured && <span className="text-yellow-400 text-sm">⭐ Featured</span>}
                        {project.hidden && <span className="text-red-400 text-sm">🙈 Hidden</span>}
                      </div>
                      {project.customDescription && (
                        <p className="text-gray-400 mb-2">📝 {project.customDescription}</p>
                      )}
                      {project.liveUrl && (
                        <p className="text-green-400 mb-2">🔗 {project.liveUrl}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Added: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
