import { motion } from "framer-motion";

export default function Header() {
  return (
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
  );
}