import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTS = [
  { id: 1, icon: "🧦", title: "Надень носки", desc: "Половицы скрипят! Надень носки, чтобы передвигаться бесшумно.", action: "Надеваю носки", tip: "Примета: скрипнул пол — мама уже идёт проверять!" },
  { id: 2, icon: "📱", title: "Отвлеки родителей", desc: "Включи им сериал погромче — пусть смотрят и не мешают.", action: "Включаю сериал", tip: "Примета: тихо в доме — значит родители идут проверять." },
  { id: 3, icon: "🛏️", title: "Сделай чучело", desc: "Подложи подушки под одеяло — пусть думают, что ты спишь.", action: "Делаю чучело", tip: "Примета: папа заходит ровно через 10 минут после отбоя." },
  { id: 4, icon: "🔑", title: "Найди ключи", desc: "Запасные ключи лежат где-то в прихожей. Найди их тихо!", action: "Беру ключи", tip: "Примета: если ключи звякнули — прячься немедленно!" },
  { id: 5, icon: "🚪", title: "Открой дверь", desc: "Три оборота замка — медленно, без звука. Ты справишься!", action: "Открываю дверь", tip: "Примета: дверь скрипит — смажь петли заранее." },
  { id: 6, icon: "🏃", title: "Беги!", desc: "Ты у выхода — улица зовёт! Беги, пока никто не видит!", action: "Бегу на улицу!", tip: "Примета: вернись до темноты — иначе всё начнётся снова." },
];

const STEVE_ACTIONS = [
  { icon: "📺", text: "Стив смотрит телевизор" },
  { icon: "🍺", text: "Стив пьёт чай на кухне" },
  { icon: "🗞️", text: "Стив читает газету" },
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

type Difficulty = "easy" | "normal" | "angry" | "nervous" | "challenge" | "night";

interface DifficultyConfig {
  label: string;
  emoji: string;
  desc: string;
  color: string;
  checkInterval: number;   // секунды между проверками
  activityInterval: number; // секунды между сменой занятий
  urgentThreshold: number;  // за сколько секунд предупреждать
  bg: string;
  extraRule?: string;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Лёгкий",
    emoji: "😌",
    desc: "Родители заняты и расслаблены. Проверка раз в 15 минут.",
    color: "text-green-400",
    checkInterval: 900,
    activityInterval: 30,
    urgentThreshold: 60,
    bg: "bg-gray-950",
  },
  normal: {
    label: "Нормальный",
    emoji: "😐",
    desc: "Стандартная бдительность. Проверка каждые 10 минут.",
    color: "text-blue-400",
    checkInterval: 600,
    activityInterval: 20,
    urgentThreshold: 30,
    bg: "bg-gray-950",
  },
  angry: {
    label: "Злой",
    emoji: "😠",
    desc: "Стив не в духе. Проверяет каждые 5 минут, занятия меняются резко.",
    color: "text-orange-400",
    checkInterval: 300,
    activityInterval: 12,
    urgentThreshold: 20,
    bg: "bg-gray-950",
    extraRule: "⚠️ Стив сегодня злой — малейший звук и он придёт!",
  },
  nervous: {
    label: "Нервный",
    emoji: "😤",
    desc: "Родители что-то подозревают. Проверка каждые 3 минуты.",
    color: "text-yellow-400",
    checkInterval: 180,
    activityInterval: 8,
    urgentThreshold: 15,
    bg: "bg-gray-950",
    extraRule: "⚠️ Они что-то чувствуют. Не расслабляйся!",
  },
  challenge: {
    label: "Челлендж",
    emoji: "💀",
    desc: "Проверка каждую минуту. Один шанс спрятаться.",
    color: "text-red-400",
    checkInterval: 60,
    activityInterval: 5,
    urgentThreshold: 10,
    bg: "bg-gray-950",
    extraRule: "☠️ Один промах — и ты пойман. Удачи.",
  },
  night: {
    label: "Ночь",
    emoji: "🌙",
    desc: "Все спят... или делают вид. Темно, тихо и очень страшно.",
    color: "text-purple-400",
    checkInterval: 120,
    activityInterval: 40,
    urgentThreshold: 20,
    bg: "bg-gray-950",
    extraRule: "🌙 Ночью каждый звук слышен вдвойне. Действуй осторожно.",
  },
};

const NIGHT_STEVE = [
  { icon: "😴", text: "Стив храпит в спальне" },
  { icon: "🌙", text: "Стив ворочается во сне" },
  { icon: "💤", text: "Стив задремал у телевизора" },
];
const NIGHT_WIFE = [
  { icon: "😴", text: "Жена крепко спит" },
  { icon: "🌙", text: "Жена пошла попить воды" },
  { icon: "💤", text: "Жена слушает аудиокнигу" },
];

type GameState = "menu" | "playing" | "caught" | "won" | "check";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Game() {
  const [screen, setScreen] = useState<GameState>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [currentQuest, setCurrentQuest] = useState(0);
  const [checkTimer, setCheckTimer] = useState(600);
  const [showTip, setShowTip] = useState(false);
  const [parentName, setParentName] = useState("Стив");
  const [steveAction, setSteveAction] = useState(STEVE_ACTIONS[0]);
  const [wifeAction, setWifeAction] = useState(WIFE_ACTIONS[0]);
  const activityRef = useRef(0);

  const cfg = DIFFICULTIES[difficulty];
  const isNight = difficulty === "night";
  const stevePool = isNight ? NIGHT_STEVE : STEVE_ACTIONS;
  const wifePool = isNight ? NIGHT_WIFE : WIFE_ACTIONS;

  useEffect(() => {
    if (screen !== "playing") return;
    activityRef.current = 0;
    const interval = setInterval(() => {
      activityRef.current += 1;
      if (activityRef.current % cfg.activityInterval === 0) {
        setSteveAction(stevePool[Math.floor(Math.random() * stevePool.length)]);
        setWifeAction(wifePool[Math.floor(Math.random() * wifePool.length)]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, difficulty]);

  const triggerCheck = useCallback(() => {
    const names = ["Стив", "Жена Стива"];
    setParentName(names[Math.floor(Math.random() * names.length)]);
    setScreen("check");
  }, []);

  useEffect(() => {
    if (screen !== "playing") return;
    const interval = setInterval(() => {
      setCheckTimer((t) => {
        if (t <= 1) { triggerCheck(); return cfg.checkInterval; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, triggerCheck, cfg.checkInterval]);

  const startGame = (d: Difficulty) => {
    setDifficulty(d);
    setCurrentQuest(0);
    setCheckTimer(DIFFICULTIES[d].checkInterval);
    setShowTip(false);
    setSteveAction((DIFFICULTIES[d].label === "Ночь" ? NIGHT_STEVE : STEVE_ACTIONS)[0]);
    setWifeAction((DIFFICULTIES[d].label === "Ночь" ? NIGHT_WIFE : WIFE_ACTIONS)[0]);
    setScreen("playing");
  };

  const handleAction = () => {
    setShowTip(true);
    setTimeout(() => {
      setShowTip(false);
      if (currentQuest + 1 >= QUESTS.length) setScreen("won");
      else setCurrentQuest((q) => q + 1);
    }, 2000);
  };

  const handleCheck = (hide: boolean) => {
    if (hide) { setScreen("playing"); setCheckTimer(cfg.checkInterval); }
    else setScreen("caught");
  };

  const quest = QUESTS[currentQuest];
  const isUrgent = checkTimer <= cfg.urgentThreshold;

  return (
    <div className={`min-h-screen ${isNight ? "bg-gray-950" : "bg-gray-950"} text-white flex flex-col p-4 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {isNight && <div className="absolute inset-0 bg-indigo-950/40 pointer-events-none" />}

      <a href="/" className="absolute top-4 left-4 text-gray-500 hover:text-gray-300 text-xs uppercase tracking-wide transition-colors z-20">← На главную</a>

      <AnimatePresence mode="wait">

        {/* MENU */}
        {screen === "menu" && (
          <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pt-12">
            <div className="text-5xl mb-3">🎮</div>
            <h1 className="text-3xl font-bold mb-1">Steve's Escape</h1>
            <p className="text-gray-400 mb-8 text-sm">Выбери уровень сложности</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => {
                const d = DIFFICULTIES[key];
                return (
                  <button key={key} onClick={() => startGame(key)}
                    className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg px-5 py-4 text-left transition-all duration-200 hover:bg-gray-800 group">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{d.emoji}</span>
                      <span className={`font-bold text-lg ${d.color}`}>{d.label}</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{d.desc}</p>
                    {d.extraRule && <p className="text-xs mt-2 opacity-60">{d.extraRule}</p>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* CAUGHT */}
        {screen === "caught" && (
          <motion.div key="caught" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-6">😱</div>
            <h1 className="text-4xl font-bold text-red-400 mb-4">ПОЙМАЛИ!</h1>
            <p className="text-gray-300 text-lg mb-2">{parentName} застал тебя на месте преступления.</p>
            <p className="text-gray-500 mb-8">Ты под домашним арестом до конца недели.</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => startGame(difficulty)}
                className="bg-yellow-400 text-black font-bold px-6 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors">
                Попробовать снова
              </button>
              <button onClick={() => setScreen("menu")}
                className="bg-gray-800 text-white font-bold px-6 py-3 uppercase tracking-wide hover:bg-gray-700 transition-colors">
                Сменить режим
              </button>
            </div>
          </motion.div>
        )}

        {/* WON */}
        {screen === "won" && (
          <motion.div key="won" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-3">СВОБОДА!</h1>
            <p className={`text-lg font-bold mb-1 ${cfg.color}`}>{cfg.emoji} Режим: {cfg.label}</p>
            <p className="text-gray-300 mb-2">Ты перехитрил Стива и его жену!</p>
            <p className="text-gray-500 mb-8">Только вернись до темноты...</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => startGame(difficulty)}
                className="bg-yellow-400 text-black font-bold px-6 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors">
                Ещё раз
              </button>
              <button onClick={() => setScreen("menu")}
                className="bg-gray-800 text-white font-bold px-6 py-3 uppercase tracking-wide hover:bg-gray-700 transition-colors">
                Другой режим
              </button>
            </div>
          </motion.div>
        )}

        {/* CHECK */}
        {screen === "check" && (
          <motion.div key="check" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-6 animate-bounce">{isNight ? "🔦" : "👁️"}</div>
            <h1 className="text-3xl font-bold text-red-400 mb-4">ПРОВЕРКА!</h1>
            <p className="text-xl text-gray-200 mb-2">
              <span className="text-yellow-400 font-bold">{parentName}</span> идёт проверять комнату!
            </p>
            <p className="text-gray-400 mb-8">{isNight ? "Включил фонарик... притворись что спишь!" : "Успей спрятаться за 5 секунд!"}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => handleCheck(true)} className="bg-green-500 text-white font-bold px-8 py-3 uppercase tracking-wide hover:bg-green-400 transition-colors">
                🙈 Спрятался!
              </button>
              <button onClick={() => handleCheck(false)} className="bg-red-600 text-white font-bold px-8 py-3 uppercase tracking-wide hover:bg-red-500 transition-colors">
                😬 Не успел
              </button>
            </div>
          </motion.div>
        )}

        {/* PLAYING */}
        {screen === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-12">

            <div className={`flex justify-between items-center mb-4 text-sm ${isUrgent ? "text-red-400" : "text-gray-400"}`}>
              <span className="flex items-center gap-2">
                <span className={cfg.color}>{cfg.emoji}</span>
                <span>{cfg.label}</span>
                <span className="text-gray-600">·</span>
                <span>Квест {currentQuest + 1}/{QUESTS.length}</span>
              </span>
              <span className={isUrgent ? "font-bold animate-pulse" : ""}>
                {isNight ? "🔦" : "👁️"} Проверка через {formatTime(checkTimer)}
              </span>
            </div>

            <div className="w-full bg-gray-800 h-1 mb-6 rounded-full">
              <motion.div className="bg-yellow-400 h-1 rounded-full"
                animate={{ width: `${(currentQuest / QUESTS.length) * 100}%` }}
                transition={{ duration: 0.5 }} />
            </div>

            {cfg.extraRule && (
              <div className={`text-xs px-3 py-2 rounded mb-4 border ${isNight ? "border-purple-800 bg-purple-950/40 text-purple-300" : "border-orange-900 bg-orange-950/30 text-orange-300"}`}>
                {cfg.extraRule}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-8">
              <AnimatePresence mode="wait">
                <motion.div key={steveAction.text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-xl">{steveAction.icon}</span>
                  <span>{steveAction.text}</span>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div key={wifeAction.text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-xl">{wifeAction.icon}</span>
                  <span>{wifeAction.text}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={`quest-${currentQuest}`} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
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
                  className="bg-yellow-400 text-black font-bold px-10 py-4 uppercase tracking-wide hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                  {quest.action}
                </button>
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-6 gap-2 mt-10 mb-4">
              {QUESTS.map((q, i) => (
                <div key={q.id} className={`text-2xl text-center py-2 rounded transition-all duration-300 ${
                  i < currentQuest ? "opacity-100" : i === currentQuest ? "opacity-100 scale-110" : "opacity-20"}`}>
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
