export default function SkillsCard() {
  return (
    <div className="bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800">
      <h2 className="text-2xl font-semibold mb-4">Core Skills</h2>
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        {["React", "Node.js", "Express", "MongoDB", "JavaScript", "TailwindCSS", "REST API", "Git / GitHub"].map((skill, i) => (
          <span key={i} className="bg-gray-800 px-3 py-1 rounded-lg">{skill}</span>
        ))}
      </div>
      <p className="text-gray-400 mt-4 text-sm">Continuously learning and improving through real-world projects.</p>
    </div>
  );
}
