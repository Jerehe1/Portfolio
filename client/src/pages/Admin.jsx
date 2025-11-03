import { useState, useEffect } from "react";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  
  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({
    title: "", description: "", technologies: "", github: "", live: "", image: "", featured: false
  });
  const [editingProject, setEditingProject] = useState(null);

  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [blogForm, setBlogForm] = useState({
    title: "", content: "", excerpt: "", tags: "", published: false, coverImage: ""
  });
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchProjects();
      fetchBlogs();
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
        fetchBlogs();
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

  // Projects Functions
  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/projects");
      const data = await response.json();
      console.log("Fetched projects:", data);
      // Ensure all projects have _id
      const projectsWithIds = data.map(p => ({
        ...p,
        _id: p._id || p.id
      }));
      console.log("Projects with IDs:", projectsWithIds);
      setProjects(projectsWithIds);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation for edit mode
      if (editingProject && !editingProject._id) {
        alert("Error: Invalid project ID");
        return;
      }

      const url = editingProject
        ? `http://localhost:5000/api/projects/${editingProject._id}`
        : "http://localhost:5000/api/projects";
      
      const method = editingProject ? "PUT" : "POST";
      
      const projectData = {
        ...projectForm,
        technologies: projectForm.technologies.split(",").map(t => t.trim())
      };

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        fetchProjects();
        setProjectForm({ title: "", description: "", technologies: "", github: "", live: "", image: "", featured: false });
        setEditingProject(null);
        alert(editingProject ? "Project updated successfully!" : "Project created successfully!");
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
    if (!confirm("Delete this project?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
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
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(", "),
      github: project.github,
      live: project.live || "",
      image: project.image || "",
      featured: project.featured || false
    });
  };

  // Blog Functions
  const fetchBlogs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/blogs/all", {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBlog
        ? `http://localhost:5000/api/blogs/${editingBlog._id}`
        : "http://localhost:5000/api/blogs";
      
      const method = editingBlog ? "PUT" : "POST";
      
      const blogData = {
        ...blogForm,
        tags: blogForm.tags.split(",").map(t => t.trim())
      };

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(blogData)
      });

      if (response.ok) {
        fetchBlogs();
        setBlogForm({ title: "", content: "", excerpt: "", tags: "", published: false, coverImage: "" });
        setEditingBlog(null);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!confirm("Delete this blog?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchBlogs();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || "",
      tags: blog.tags.join(", "),
      published: blog.published,
      coverImage: blog.coverImage || ""
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
            Admin {isRegister ? "Register" : "Login"}
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
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
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

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "projects"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "blogs"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Blogs ({blogs.length})
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-8">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h2>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 h-24"
                  required
                />
                <input
                  type="text"
                  placeholder="Technologies (comma separated)"
                  value={projectForm.technologies}
                  onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="url"
                  placeholder="GitHub URL"
                  value={projectForm.github}
                  onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="url"
                  placeholder="Live URL (optional)"
                  value={projectForm.live}
                  onChange={(e) => setProjectForm({ ...projectForm, live: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="flex items-center gap-1">
                    Featured Project <span className="text-yellow-400">★</span>
                  </span>
                </label>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                  >
                    {editingProject ? "Update Project" : "Add Project"}
                  </button>
                  {editingProject && (
                    <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setProjectForm({ title: "", description: "", technologies: "", github: "", live: "", image: "", featured: false });
                  }}
                  className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>            <div className="space-y-4">
              <h2 className="text-2xl font-bold">All Projects</h2>
              {projects.map((project) => (
                <div key={project._id} className={`bg-gray-900 p-6 rounded-2xl border ${project.featured ? 'border-yellow-500/50' : 'border-gray-800'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        {project.featured && <span className="text-yellow-400 text-sm">★ Featured</span>}
                      </div>
                      <p className="text-gray-400 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="bg-gray-800 px-2 py-1 text-xs rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <a href={project.github} target="_blank" className="text-blue-400">
                          GitHub
                        </a>
                        {project.live && (
                          <a href={project.live} target="_blank" className="text-green-400">
                            Live
                          </a>
                        )}
                      </div>
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
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="space-y-8">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">
                {editingBlog ? "Edit Blog" : "Add New Blog"}
              </h2>
              <form onSubmit={handleBlogSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  required
                />
                <textarea
                  placeholder="Excerpt (optional)"
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 h-20"
                />
                <textarea
                  placeholder="Content"
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 h-48"
                  required
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={blogForm.tags}
                  onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="url"
                  placeholder="Cover Image URL (optional)"
                  value={blogForm.coverImage}
                  onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={blogForm.published}
                    onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Published
                </label>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                  >
                    {editingBlog ? "Update Blog" : "Add Blog"}
                  </button>
                  {editingBlog && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBlog(null);
                        setBlogForm({ title: "", content: "", excerpt: "", tags: "", published: false, coverImage: "" });
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
              <h2 className="text-2xl font-bold">All Blogs</h2>
              {blogs.map((blog) => (
                <div key={blog._id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{blog.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${blog.published ? "bg-green-600" : "bg-gray-600"}`}>
                          {blog.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      {blog.excerpt && <p className="text-gray-400 mb-2">{blog.excerpt}</p>}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.map((tag, i) => (
                          <span key={i} className="bg-gray-800 px-2 py-1 text-xs rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBlog(blog)}
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog._id)}
                        className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
