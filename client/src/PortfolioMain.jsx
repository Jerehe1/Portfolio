import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PortfolioShowcase() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects([
      {
        title: "Blog App",
        description: "Full-stack MERN blog with authentication and REST API.",
        technologies: ["React", "Node.js", "Express", "MongoDB"],
        github: "https://github.com/Jerehe1/blog",
        live: "https://yourapp.vercel.app",
        image: "https://via.placeholder.com/600x400?text=Blog+App"
      },
      {
        title: "Survey Platform",
        description: "Collaborative app for creating and answering surveys.",
        technologies: ["React", "Express", "MongoDB", "TailwindCSS"],
        github: "https://github.com/rmarjora/Willo",
        live: "https://willo-demo.vercel.app",
        image: "https://via.placeholder.com/600x400?text=Survey+Platform"
      },
      {
        title: "Portfolio Website",
        description: "Dynamic MERN portfolio with admin panel.",
        technologies: ["React", "Express", "MongoDB", "Framer Motion"],
        github: "https://github.com/Jerehe1/Portfolio",
        live: "https://jerehe1.github.io/Portfolio/",
        image: "https://via.placeholder.com/600x400?text=Portfolio"
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <header className="text-center mb-12">
        <motion.h1 
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Jere Helenius — Full Stack Developer
        </motion.h1>
        <p className="text-gray-400">Building dynamic and secure web applications</p>
      </header>

      <section className="text-center mb-12">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl inline-block border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Core Skills</h2>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {["React", "Node.js", "Express", "MongoDB", "JavaScript", "TailwindCSS", "REST API", "Git / GitHub"].map((skill, i) => (
              <span key={i} className="bg-gray-800 px-3 py-1 rounded-lg">{skill}</span>
            ))}
          </div>
          <p className="text-gray-400 mt-4 text-sm">Continuously learning and improving through real-world projects.</p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800"
            whileHover={{ scale: 1.03 }}
          >
            <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-gray-400 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech, i) => (
                  <span key={i} className="bg-gray-800 px-2 py-1 text-xs rounded-md">{tech}</span>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <a href={project.github} target="_blank" className="text-blue-400 hover:underline">GitHub</a>
                <a href={project.live} target="_blank" className="text-green-400 hover:underline">Live Demo</a>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="text-center mt-16">
        <h2 className="text-2xl font-semibold mb-4">Let's Connect</h2>
        <p className="text-gray-400 mb-6">Interested in collaborating or hiring? Reach out below.</p>
        <a 
          href="mailto:jerehelenius.dev@gmail.com" 
          className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-500 transition"
        >
          Contact Me
        </a>
      </section>

      <footer className="text-center mt-16 text-gray-600">
        <p>© 2025 Jere Helenius | Built with React, Tailwind & Framer Motion</p>
      </footer>
    </div>
  );
}
