import { useEffect, useState } from "react";
import Header from "../components/Header";
import SkillsCard from "../components/SkillsCard";
import ProjectCard from "../components/ProjectCard";
import Footer from "../components/Footer";

function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const featuredProjects = projects.filter(p => p.featured);
  const regularProjects = projects.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <Header />

      <section className="relative flex justify-center mb-12">
        <a href="https://github.com/Jerehe1" target="_blank" rel="noopener noreferrer" className="absolute left-[110px] top-0 hidden md:block group">
          <img
            src="https://github.com/Jerehe1.png"
            alt="Jere Helenius"
            className="w-40 h-40 rounded-full border-4 border-gray-700 object-cover shadow-xl transition-transform group-hover:scale-105"
            onError={(e) => { e.target.src = '/fallback-profile.png'; }}
          />
        </a>

        <SkillsCard />
      </section>

      <div className="max-w-7xl mx-auto space-y-12">
        {!loading && !error && featuredProjects.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold">Featured Projects</h2>
              <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">★</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredProjects.map((p, i) => (
                <div key={i} className="bg-gray-900 rounded-2xl border-2 border-blue-600/50 overflow-hidden shadow-xl">
                  {(p.screenshotUrl || p.image) && (
                    <img 
                      src={p.screenshotUrl || p.image} 
                      alt={p.title} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        
                        if (p.screenshotUrl && e.target.src === p.screenshotUrl) {
                          e.target.src = p.image;
                        }
                      }}
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold">{p.title}</h3>
                      <span className="text-yellow-400 text-xl">★</span>
                    </div>
                    <p className="text-gray-300 mb-4">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.technologies.map((tech, j) => (
                        <span key={j} className="bg-gray-800 px-3 py-1 text-sm rounded-lg">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <a 
                        href={p.github} 
                        target="_blank" 
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition font-medium"
                      >
                        View Code →
                      </a>
                      {p.live && (
                        <a 
                          href={p.live} 
                          target="_blank" 
                          className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition font-medium"
                        >
                          Live Demo →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-3xl font-bold mb-6">
            {featuredProjects.length > 0 ? 'More Projects' : 'Projects'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading && (
              <div className="col-span-full text-center text-gray-400 py-8">
                Loading projects...
              </div>
            )}
            {error && (
              <div className="col-span-full text-center text-red-400 py-8">
                Error: {error}
              </div>
            )}
            {!loading && !error && regularProjects.map((p, i) => <ProjectCard key={i} project={p} />)}
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
export default Home;