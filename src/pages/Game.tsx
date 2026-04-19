import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTS = [
  {
    id: 1,
    icon: "🧦",
    title: "Надень носки",
    desc: "Половицы скрипят! Надень носки, чтобы передвигаться бесшумно.",
    action: "Надеваю носки",
    tip: "Примета: скрипнул пол — мама уже идёт проверять!",
  },
  {
    id: 2,
    icon: "📱",
    title: "Отвлеки родителей",
    desc: "Включи им сериал погромче — пусть смотрят и не мешают.",
    action: "Включаю сериал",
    tip: "Примета: тихо в доме — значит родители идут проверять.",
  },
  {
    id: 3,
    icon: "🛏️",
    title: "Сделай чучело",
    desc: "Подложи подушки под одеяло — пусть думают, что ты спишь.",
    action: "Делаю чучело",
    tip: "Примета: папа заходит ровно через 15 минут после отбоя.",
  },
  {
    id: 4,
    icon: "🔑",
    title: "Найди ключи",
    desc: "Запасные ключи лежат где-то в прихожей. Найди их тихо!",
    action: "Беру ключи",
    tip: "Примета: если ключи звякнули — прячься немедленно!",
  },
  {
    id: 5,
    icon: "🚪",
    title: "Открой дверь",
    desc: "Три оборота замка — медленно, без звука. Ты справишься!",
    action: "Открываю дверь",
    tip: "Примета: дверь скрипит — смажь петли заранее.",
  },
  {
    id: 6,
    icon: "🏃",
    title: "Беги!",
    desc: "Ты у выхода — улица зовёт! Беги, пока никто не видит!",
    action: "Бегу на улицу!",
    tip: "Примета: вернись до темноты — иначе всё начнётся снова.",
  },
];

type GameState = "playing" | "caught" | "won" | "check";

export default function Game() {
  const [currentQuest, setCurrentQuest] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [checkTimer, setCheckTimer] = useState(15);
  const [showTip, setShowTip] = useState(false);
  const [parentName, setParentName] = useState("Стив");

  const triggerCheck = useCallback(() => {
    if (gameState === "playing") {
      const names = ["Стив", "Жена Стива"];
      setParentName(names[Math.floor(Math.random() * names.length)]);
      setGameState("check");
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setCheckTimer((t) => {
        if (t <= 1) {
          triggerCheck();
          return 15;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, triggerCheck]);

  const handleAction = () => {
    setShowTip(true);
    setTimeout(() => {
      setShowTip(false);
      if (currentQuest + 1 >= QUESTS.length) {
        setGameState("won");
      } else {
        setCurrentQuest((q) => q + 1);
        setCheckTimer(15);
      }
    }, 2000);
  };

  const handleCheckResponse = (hide: boolean) => {
    if (hide) {
      setGameState("playing");
      setCheckTimer(15);
    } else {
      setGameState("caught");
    }
  };

  const restart = () => {
    setCurrentQuest(0);
    setGameState("playing");
    setCheckTimer(15);
    setShowTip(false);
  };

  const quest = QUESTS[currentQuest];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Bg stars */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      <AnimatePresence mode="wait">

        {/* CAUGHT */}
        {gameState === "caught" && (
          <motion.div
            key="caught"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center z-10 max-w-md"
          >
            <div className="text-8xl mb-6">😱</div>
            <h1 className="text-4xl font-bold text-red-400 mb-4">ПОЙМАЛИ!</h1>
            <p className="text-gray-300 text-lg mb-2">{parentName} застал тебя на месте преступления.</p>
            <p className="text-gray-500 mb-8">Ты под домашним арестом до конца недели.</p>
            <button
              onClick={restart}
              className="bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors duration-300"
            >
              Попробовать снова
            </button>
          </motion.div>
        )}

        {/* WON */}
        {gameState === "won" && (
          <motion.div
            key="won"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center z-10 max-w-md"
          >
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">СВОБОДА!</h1>
            <p className="text-gray-300 text-lg mb-2">Ты перехитрил Стива и его жену!</p>
            <p className="text-gray-500 mb-8">Только вернись до темноты... или начнётся снова.</p>
            <button
              onClick={restart}
              className="bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors duration-300"
            >
              Сыграть ещё раз
            </button>
          </motion.div>
        )}

        {/* CHECK */}
        {gameState === "check" && (
          <motion.div
            key="check"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center z-10 max-w-md"
          >
            <div className="text-8xl mb-6 animate-bounce">👁️</div>
            <h1 className="text-3xl font-bold text-red-400 mb-4">ПРОВЕРКА!</h1>
            <p className="text-xl text-gray-200 mb-8">
              <span className="text-yellow-400 font-bold">{parentName}</span> идёт проверять комнату!<br />
              Успей спрятаться!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleCheckResponse(true)}
                className="bg-green-500 text-white font-bold px-8 py-3 uppercase tracking-wide hover:bg-green-400 transition-colors duration-300"
              >
                🙈 Спрятался!
              </button>
              <button
                onClick={() => handleCheckResponse(false)}
                className="bg-red-600 text-white font-bold px-8 py-3 uppercase tracking-wide hover:bg-red-500 transition-colors duration-300"
              >
                😬 Не успел
              </button>
            </div>
          </motion.div>
        )}

        {/* PLAYING */}
        {gameState === "playing" && (
          <motion.div
            key={`quest-${currentQuest}`}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            className="text-center z-10 max-w-lg w-full"
          >
            {/* Header bar */}
            <div className="flex justify-between items-center mb-8 text-sm text-gray-400">
              <span>Квест {currentQuest + 1} из {QUESTS.length}</span>
              <div className="flex items-center gap-2">
                <span className={checkTimer <= 5 ? "text-red-400 font-bold animate-pulse" : "text-gray-400"}>
                  👁️ Проверка через {checkTimer}с
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 h-1 mb-10 rounded-full">
              <motion.div
                className="bg-yellow-400 h-1 rounded-full"
                animate={{ width: `${((currentQuest) / QUESTS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="text-7xl mb-6">{quest.icon}</div>
            <h2 className="text-3xl font-bold mb-4">{quest.title}</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">{quest.desc}</p>

            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm px-4 py-3 mb-6 rounded"
                >
                  💡 {quest.tip}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleAction}
              disabled={showTip}
              className="bg-yellow-400 text-black font-bold px-10 py-4 uppercase tracking-wide hover:bg-yellow-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {quest.action}
            </button>

            {/* Всех пойманных */}
            <div className="mt-12 grid grid-cols-6 gap-2">
              {QUESTS.map((q, i) => (
                <div
                  key={q.id}
                  className={`text-2xl text-center py-2 rounded transition-all duration-300 ${
                    i < currentQuest
                      ? "opacity-100"
                      : i === currentQuest
                      ? "opacity-100 scale-110"
                      : "opacity-20"
                  }`}
                >
                  {i < currentQuest ? "✅" : q.icon}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Back to landing */}
      <a
        href="/"
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-300 text-sm uppercase tracking-wide transition-colors z-20"
      >
        ← На главную
      </a>
    </div>
  );
}
