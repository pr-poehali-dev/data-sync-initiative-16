import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "50vh"]);

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center h-screen overflow-hidden"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="/images/mountain-landscape.jpg"
          alt="Mountain landscape"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="relative z-10 text-center text-white px-4">
        <p className="text-yellow-400 uppercase tracking-widest text-sm mb-4 opacity-90">⚠️ Мама и папа не спят</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 drop-shadow-2xl">
          СБЕГИ!
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto px-6 opacity-90">
          Помоги сыну Стива выбраться на улицу — пройди квесты, обмани родителей и не попадись на проверке
        </p>
        <a
          href="/game"
          className="mt-8 inline-block bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors duration-300"
        >
          Начать побег
        </a>
      </div>
    </div>
  );
}