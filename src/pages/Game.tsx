import { useState, useEffect, useCallback, useRef } from "react";
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
    tip: "Примета: папа заходит ровно через 10 минут после отбоя.",
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

const STEVE_ACTIONS = [
  { icon: "📺", text: "Стив смотрит телевизор в гостиной" },
  { icon: "🍺", text: "Стив пьёт чай на кухне" },
  { icon: "🗞️", text: "Стив читает газету в кресле" },
  { icon: "🔧", text: "Стив чинит кран в ванной" },
  { icon: "😴", text: "Стив дремлет на диване" },
  { icon: "🧹", text: "Стив метёт пол в коридоре" },
];

const WIFE_ACTIONS = [
  { icon: "🍳", text: "Жена готовит на кухне" },
  { icon: "🧺", text: "Жена раскладывает бельё" },
  { icon: "📞", text: "Жена говорит по телефону" },
  { icon: "🌿", text: "Жена поливает цветы" },
  { icon: "🧹", text: "Жена пылесосит в спальне" },
  { icon: "📖", text: "Жена читает книгу у окна" },
];

const CHECK_INTERVAL = 600; // 10 минут = 600 секунд

type GameState = "playing" | "caught" | "won" | "check";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Game() {
  const [currentQuest, setCurrentQuest] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [checkTimer, setCheckTimer] = useState(CHECK_INTERVAL);
  const [showTip, setShowTip] = useState(false);
  const [parentName, setParentName] = useState("Стив");
  const [steveAction, setSteveAction] = useState(STEVE_ACTIONS[0]);
  const [wifeAction, setWifeAction] = useState(WIFE_ACTIONS[0]);
  const [activityTimer, setActivityTimer] = useState(0);
  const activityRef = useRef(0);

  // Смена занятий родителей каждые ~20 секунд
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      activityRef.current += 1;
      setActivityTimer(activityRef.current);
      if (activityRef.current % 20 === 0) {
        setSteveAction(STEVE_ACTIONS[Math.floor(Math.random() * STEVE_ACTIONS.length)]);
        setWifeAction(WIFE_ACTIONS[Math.floor(Math.random() * WIFE_ACTIONS.length)]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const triggerCheck = useCallback(() => {
    const names = ["Стив", "Жена Стива"];
    setParentName(names[Math.floor(Math.random() * names.length)]);
    setGameState("check");
  }, []);

  // Таймер проверки — 10 минут
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setCheckTimer((t) => {
        if (t <= 1) {
          triggerCheck();
          return CHECK_INTERVAL;
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
      }
    }, 2000);
  };

  const handleCheckResponse = (hide: boolean) => {
    if (hide) {
      setGameState("playing");
      setCheckTimer(CHECK_INTERVAL);
    } else {
      setGameState("caught");
    }
  };

  const restart = () => {
    setCurrentQuest(0);
    setGameState("playing");
    setCheckTimer(CHECK_INTERVAL);
    setShowTip(false);
    activityRef.current = 0;
    setActivityTimer(0);
    setSteveAction(STEVE_ACTIONS[0]);
    setWifeAction(WIFE_ACTIONS[0]);
  };

  const quest = QUESTS[currentQuest];
  const isUrgent = checkTimer <= 30;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-4 relative overflow-hidden">
      {/* Bg dots */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Back */}
      <a href="/" className="absolute top-4 left-4 text-gray-500 hover:text-gray-300 text-xs uppercase tracking-wide transition-colors z-20">
        ← На главную
      </a>

      <AnimatePresence mode="wait">

        {/* CAUGHT */}
        {gameState === "caught" && (
          <motion.div key="caught" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-6">😱</div>
            <h1 className="text-4xl font-bold text-red-400 mb-4">ПОЙМАЛИ!</h1>
            <p className="text-gray-300 text-lg mb-2">{parentName} застал тебя на месте преступления.</p>
            <p className="text-gray-500 mb-8">Ты под домашним арестом до конца недели.</p>
            <button onClick={restart} className="bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors duration-300">
              Попробовать снова
            </button>
          </motion.div>
        )}

        {/* WON */}
        {gameState === "won" && (
          <motion.div key="won" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">СВОБОДА!</h1>
            <p className="text-gray-300 text-lg mb-2">Ты перехитрил Стива и его жену!</p>
            <p className="text-gray-500 mb-8">Только вернись до темноты... или начнётся снова.</p>
            <button onClick={restart} className="bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors duration-300">
              Сыграть ещё раз
            </button>
          </motion.div>
        )}

        {/* CHECK */}
        {gameState === "check" && (
          <motion.div key="check" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-6 animate-bounce">👁️</div>
            <h1 className="text-3xl font-bold text-red-400 mb-4">ПРОВЕРКА!</h1>
            <p className="text-xl text-gray-200 mb-2">
              <span className="text-yellow-400 font-bold">{parentName}</span> идёт проверять комнату!
            </p>
            <p className="text-gray-400 mb-8">Успей спрятаться за 5 секунд!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => handleCheckResponse(true)}
                className="bg-green-500 text-white font-bold px-8 py-3 uppercase tracking-wide hover:bg-green-400 transition-colors duration-300">
                🙈 Спрятался!
              </button>
              <button onClick={() => handleCheckResponse(false)}
                className="bg-red-600 text-white font-bold px-8 py-3 uppercase tracking-wide hover:bg-red-500 transition-colors duration-300">
                😬 Не успел
              </button>
            </div>
          </motion.div>
        )}

        {/* PLAYING */}
        {gameState === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-12">

            {/* Таймер проверки */}
            <div className={`flex justify-between items-center mb-4 text-sm ${isUrgent ? "text-red-400" : "text-gray-400"}`}>
              <span>Квест {currentQuest + 1} / {QUESTS.length}</span>
              <span className={isUrgent ? "font-bold animate-pulse" : ""}>
                👁️ Проверка через {formatTime(checkTimer)}
              </span>
            </div>

            {/* Прогресс */}
            <div className="w-full bg-gray-800 h-1 mb-6 rounded-full">
              <motion.div className="bg-yellow-400 h-1 rounded-full"
                animate={{ width: `${(currentQuest / QUESTS.length) * 100}%` }}
                transition={{ duration: 0.5 }} />
            </div>

            {/* Что делают родители */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <AnimatePresence mode="wait">
                <motion.div key={steveAction.text}
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-xl">{steveAction.icon}</span>
                  <span>{steveAction.text}</span>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div key={wifeAction.text}
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-xl">{wifeAction.icon}</span>
                  <span>{wifeAction.text}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Квест */}
            <AnimatePresence mode="wait">
              <motion.div key={`quest-${currentQuest}`}
                initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
                className="flex-1 flex flex-col items-center text-center">
                <div className="text-7xl mb-5">{quest.icon}</div>
                <h2 className="text-3xl font-bold mb-3">{quest.title}</h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed max-w-sm">{quest.desc}</p>

                <AnimatePresence>
                  {showTip && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm px-4 py-3 mb-5 rounded max-w-sm">
                      💡 {quest.tip}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={handleAction} disabled={showTip}
                  className="bg-yellow-400 text-black font-bold px-10 py-4 uppercase tracking-wide hover:bg-yellow-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                  {quest.action}
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Иконки квестов */}
            <div className="grid grid-cols-6 gap-2 mt-10 mb-4">
              {QUESTS.map((q, i) => (
                <div key={q.id} className={`text-2xl text-center py-2 rounded transition-all duration-300 ${
                  i < currentQuest ? "opacity-100" : i === currentQuest ? "opacity-100 scale-110" : "opacity-20"
                }`}>
                  {i < currentQuest ? "✅" : q.icon}
                </div>
              ))}
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
