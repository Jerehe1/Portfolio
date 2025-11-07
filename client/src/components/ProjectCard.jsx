import { motion } from "framer-motion";

export default function ProjectCard({ project }) {
  return (
    <motion.div
      className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800"
      whileHover={{ scale: 1.02 }}
    >
      {(project.screenshotUrl || project.image) && (
        <img 
          src={project.screenshotUrl || project.image} 
          alt={project.title} 
          className="w-full h-32 object-cover"
          onError={(e) => {
            
            if (project.screenshotUrl && e.target.src === project.screenshotUrl) {
              e.target.src = project.image;
            }
          }}
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.technologies.slice(0, 4).map((tech, i) => (
            <span key={i} className="bg-gray-800 px-2 py-0.5 text-xs rounded">{tech}</span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-gray-500 text-xs px-2">+{project.technologies.length - 4}</span>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <a href={project.github} target="_blank" className="text-blue-400 hover:text-blue-300 transition">
            GitHub →
          </a>
          {project.live && (
            <a href={project.live} target="_blank" className="text-green-400 hover:text-green-300 transition">
              Live →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
