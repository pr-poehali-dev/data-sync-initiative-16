import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── ПЕРСОНАЖИ ────────────────────────────────────────────────────────────────
const CHARACTERS = {
  steve: { name: "Стив", emoji: "👨", role: "Папа", desc: "Строгий, любит порядок. Всегда замечает беспорядок." },
  wife:  { name: "Жена Стива", emoji: "👩", role: "Мама", desc: "Чуткая, слышит каждый шорох. Не даст спуску." },
  son:   { name: "Сын", emoji: "👦", role: "Ты", desc: "Хитрый и ловкий. Мечтает вырваться на улицу." },
};

// ─── ПРЕДМЕТЫ ─────────────────────────────────────────────────────────────────
// ─── КВЕСТЫ С НАКАЗАНИЯМИ ────────────────────────────────────────────────────
const QUESTS = [
  {
    id: 1,
    item: "🧦",
    itemName: "Носки",
    title: "Надень носки",
    desc: "Половицы скрипят! Используй носки, чтобы двигаться бесшумно.",
    action: "Надеваю носки",
    tip: "💡 Примета: скрипнул пол — мама уже встала с дивана.",
    punishment: {
      catcher: "steve",
      text: "Стив услышал скрип и вышел в коридор.",
      penalty: "❌ Наказание: убираешь квартиру всю субботу.",
    },
  },
  {
    id: 2,
    item: "📺",
    itemName: "Пульт",
    title: "Включи сериал родителям",
    desc: "Возьми пульт и включи их любимый сериал — пусть отвлекутся.",
    action: "Включаю сериал",
    tip: "💡 Примета: тихо в доме — значит идут проверять.",
    punishment: {
      catcher: "wife",
      text: "Жена Стива заметила, что пульт лежит не на месте.",
      penalty: "❌ Наказание: неделю без телефона.",
    },
  },
  {
    id: 3,
    item: "🛏️",
    itemName: "Подушки",
    title: "Сделай чучело в кровати",
    desc: "Подложи подушки под одеяло — пусть думают, что ты спишь.",
    action: "Делаю чучело",
    tip: "💡 Примета: папа проверяет ровно через 10 минут после «спокойной ночи».",
    punishment: {
      catcher: "steve",
      text: "Стив зашёл проверить и увидел торчащую подушку.",
      penalty: "❌ Наказание: домашний арест на всё лето.",
    },
  },
  {
    id: 4,
    item: "🔑",
    itemName: "Ключи",
    title: "Найди запасные ключи",
    desc: "Запасные ключи спрятаны где-то в прихожей. Найди их бесшумно!",
    action: "Беру ключи",
    tip: "💡 Примета: брелок звякнул — сразу ставь на место и жди.",
    punishment: {
      catcher: "wife",
      text: "Жена Стива услышала звон ключей из кухни.",
      penalty: "❌ Наказание: неделю моешь посуду и выносишь мусор.",
    },
  },
  {
    id: 5,
    item: "🧴",
    itemName: "Масло",
    title: "Смажь петли двери",
    desc: "Дверь скрипит! Найди масло и смажь петли заранее.",
    action: "Смазываю петли",
    tip: "💡 Примета: один скрип прощают, второй — никогда.",
    punishment: {
      catcher: "steve",
      text: "Дверь скрипнула — Стив сидел прямо у телевизора в коридоре.",
      penalty: "❌ Наказание: две недели без прогулок.",
    },
  },
  {
    id: 6,
    item: "🚪",
    itemName: "Замок",
    title: "Открой дверь",
    desc: "Три оборота замка — медленно, без звука. Последний шаг к свободе!",
    action: "Открываю замок",
    tip: "💡 Примета: жди, пока телевизор заглушит щелчок замка.",
    punishment: {
      catcher: "wife",
      text: "Жена Стива вышла за стаканом воды — прямо в этот момент.",
      penalty: "❌ Наказание: весь месяц дома. Без исключений.",
    },
  },
  {
    id: 7,
    item: "👟",
    itemName: "Кроссовки",
    title: "Обуйся за дверью",
    desc: "Не надевай обувь дома — возьми кроссовки в руки и обуйся уже на улице.",
    action: "Беру кроссовки",
    tip: "💡 Примета: стук обуви об пол слышен на весь коридор.",
    punishment: {
      catcher: "steve",
      text: "Стив вышел покурить — прямо на лестничную площадку.",
      penalty: "❌ Наказание: сдаёшь дневник на проверку каждый день.",
    },
  },
  {
    id: 8,
    item: "🏃",
    itemName: "Свобода",
    title: "Беги!",
    desc: "Дверь открыта — улица зовёт! Беги, пока никто не смотрит в окно!",
    action: "Бегу на улицу!",
    tip: "💡 Примета: не беги мимо окон — мама видит сквозь шторы.",
    punishment: {
      catcher: "wife",
      text: "Жена Стива выглянула в окно полить цветы — и увидела тебя.",
      penalty: "❌ Наказание: расскажешь всё сам. Родительское собрание.",
    },
  },
];

// ─── ЗАНЯТИЯ РОДИТЕЛЕЙ ────────────────────────────────────────────────────────
const STEVE_ACTIONS = [
  { icon: "📺", text: "Стив смотрит телевизор" },
  { icon: "☕", text: "Стив пьёт чай на кухне" },
  { icon: "🗞️", text: "Стив читает газету" },
  { icon: "🔧", text: "Стив чинит кран в ванной" },
  { icon: "😴", text: "Стив дремлет на диване" },
  { icon: "🧹", text: "Стив метёт пол в коридоре" },
  { icon: "📻", text: "Стив слушает радио" },
  { icon: "🪟", text: "Стив смотрит в окно" },
];
const WIFE_ACTIONS = [
  { icon: "🍳", text: "Жена готовит на кухне" },
  { icon: "🧺", text: "Жена раскладывает бельё" },
  { icon: "📞", text: "Жена говорит по телефону" },
  { icon: "🌿", text: "Жена поливает цветы" },
  { icon: "🧹", text: "Жена пылесосит в спальне" },
  { icon: "📖", text: "Жена читает книгу у окна" },
  { icon: "🧶", text: "Жена вяжет в кресле" },
  { icon: "🪟", text: "Жена смотрит в окно на улицу" },
];
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

// ─── 8 КОНЦОВОК ───────────────────────────────────────────────────────────────
const ENDINGS = [
  {
    id: 1,
    condition: "perfect", // прошёл без единой проверки
    title: "НЕВИДИМКА",
    emoji: "🥷",
    color: "text-yellow-400",
    text: "Ты прошёл все квесты так, что никто даже не почувствовал твоего присутствия. Стив до сих пор уверен, что ты спишь.",
    secret: "✨ Секретная концовка: ни одной проверки!",
  },
  {
    id: 2,
    condition: "speed", // прошёл за малое время
    title: "МОЛНИЯ",
    emoji: "⚡",
    color: "text-blue-400",
    text: "Ты вылетел из дома быстрее, чем Стив успел отпить чай. Рекорд побег!",
    secret: "✨ Секретная концовка: скоростной побег!",
  },
  {
    id: 3,
    condition: "won_easy",
    title: "СВОБОДА",
    emoji: "🎉",
    color: "text-green-400",
    text: "Ты перехитрил Стива и его жену. Улица встретила тебя тёплым ветром. Только вернись до темноты...",
    secret: null,
  },
  {
    id: 4,
    condition: "won_normal",
    title: "БЕГЛЕЦ",
    emoji: "🏃",
    color: "text-cyan-400",
    text: "Несмотря на проверки, ты прорвался. Стив обнаружит чучело только вечером. У тебя есть пара часов.",
    secret: null,
  },
  {
    id: 5,
    condition: "won_hard",
    title: "ЛЕГЕНДА",
    emoji: "🏆",
    color: "text-orange-400",
    text: "На сложном режиме, под носом у нервных родителей — ты сделал это. Об этом побеге будут говорить во дворе.",
    secret: null,
  },
  {
    id: 6,
    condition: "won_night",
    title: "НОЧНОЙ ПРИЗРАК",
    emoji: "🌙",
    color: "text-purple-400",
    text: "Пока все спали, ты растворился в темноте. Даже соседский пёс не залаял. Это был идеальный ночной побег.",
    secret: "✨ Секретная концовка: побег в ночном режиме!",
  },
  {
    id: 7,
    condition: "won_challenge",
    title: "НЕВОЗМОЖНОЕ",
    emoji: "💀",
    color: "text-red-400",
    text: "Челлендж пройден. Стив и жена до сих пор не понимают, как это возможно. Ты — миф.",
    secret: "✨ Секретная концовка: пройден режим Челлендж!",
  },
  {
    id: 8,
    condition: "survived_punishments",
    title: "ЗАКАЛЁННЫЙ",
    emoji: "💪",
    color: "text-pink-400",
    text: "Тебя ловили, наказывали, но ты всё равно вышел. Никакие наказания не сломили твой дух. Ты непобедим.",
    secret: "✨ Секретная концовка: попался на проверке, но всё равно победил!",
  },
];

// ─── СЛОЖНОСТИ ────────────────────────────────────────────────────────────────
type Difficulty = "easy" | "normal" | "angry" | "nervous" | "challenge" | "night";
interface DiffConfig {
  label: string; emoji: string; desc: string; color: string;
  checkInterval: number; activityInterval: number; urgentThreshold: number;
  extraRule?: string;
}
const DIFFICULTIES: Record<Difficulty, DiffConfig> = {
  easy:      { label: "Лёгкий",     emoji: "😌", desc: "Проверка раз в 15 минут. Родители расслаблены.", color: "text-green-400",  checkInterval: 900, activityInterval: 30, urgentThreshold: 60 },
  normal:    { label: "Нормальный", emoji: "😐", desc: "Проверка каждые 10 минут. Стандартная бдительность.", color: "text-blue-400",   checkInterval: 600, activityInterval: 20, urgentThreshold: 30 },
  angry:     { label: "Злой",       emoji: "😠", desc: "Стив не в духе. Проверка каждые 5 минут.", color: "text-orange-400", checkInterval: 300, activityInterval: 12, urgentThreshold: 20, extraRule: "⚠️ Стив сегодня злой — малейший звук и он придёт!" },
  nervous:   { label: "Нервный",    emoji: "😤", desc: "Что-то подозревают. Проверка каждые 3 минуты.", color: "text-yellow-400", checkInterval: 180, activityInterval: 8,  urgentThreshold: 15, extraRule: "⚠️ Они что-то чувствуют. Не расслабляйся!" },
  challenge: { label: "Челлендж",   emoji: "💀", desc: "Проверка каждую минуту. Один шанс.", color: "text-red-400",    checkInterval: 60,  activityInterval: 5,  urgentThreshold: 10, extraRule: "☠️ Один промах — и ты пойман." },
  night:     { label: "Ночь",       emoji: "🌙", desc: "Все спят... или делают вид. Фонарик не врёт.", color: "text-purple-400", checkInterval: 120, activityInterval: 40, urgentThreshold: 20, extraRule: "🌙 Ночью каждый звук слышен вдвойне." },
};

// ─── ПРАВИЛА ──────────────────────────────────────────────────────────────────
const RULES = [
  { icon: "🚫", text: "Нельзя использовать читы", penalty: "Дисквалификация — игра начинается заново" },
  { icon: "🚫", text: "Нельзя прыгать", penalty: "Стив услышит удар — мгновенная проверка" },
  { icon: "🚫", text: "Нельзя бегать", penalty: "Топот ног разбудит жену — мгновенная проверка" },
  { icon: "✅", text: "Двигайся только медленно и тихо", penalty: null },
  { icon: "✅", text: "Выполняй квесты по порядку", penalty: null },
  { icon: "✅", text: "Прячься при каждой проверке", penalty: null },
];

type GameState = "menu" | "rules" | "playing" | "punishment" | "won" | "check" | "cheat" | "jump" | "run";

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function pickEnding(diff: Difficulty, caughtCount: number, elapsed: number, checkCount: number): typeof ENDINGS[0] {
  if (diff === "challenge") return ENDINGS[6];
  if (diff === "night") return ENDINGS[5];
  if (checkCount === 0) return ENDINGS[0];
  if (elapsed < 120) return ENDINGS[1];
  if (caughtCount >= 2) return ENDINGS[7];
  if (diff === "angry" || diff === "nervous") return ENDINGS[4];
  if (diff === "normal") return ENDINGS[3];
  return ENDINGS[2];
}

export default function Game() {
  const [screen, setScreen] = useState<GameState>("menu");
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>("normal");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [currentQuest, setCurrentQuest] = useState(0);
  const [checkTimer, setCheckTimer] = useState(600);
  const [showTip, setShowTip] = useState(false);
  const [parentName, setParentName] = useState("Стив");
  const [steveAction, setSteveAction] = useState(STEVE_ACTIONS[0]);
  const [wifeAction, setWifeAction] = useState(WIFE_ACTIONS[0]);
  const [punishmentData, setPunishmentData] = useState<typeof QUESTS[0]["punishment"] | null>(null);
  const [ending, setEnding] = useState<typeof ENDINGS[0] | null>(null);
  const [caughtCount, setCaughtCount] = useState(0);
  const [checkCount, setCheckCount] = useState(0);
  const elapsedRef = useRef(0);
  const activityRef = useRef(0);

  const cfg = DIFFICULTIES[difficulty];
  const isNight = difficulty === "night";
  const stevePool = isNight ? NIGHT_STEVE : STEVE_ACTIONS;
  const wifePool = isNight ? NIGHT_WIFE : WIFE_ACTIONS;

  // Таймер занятий и общего времени
  useEffect(() => {
    if (screen !== "playing") return;
    const interval = setInterval(() => {
      activityRef.current += 1;
      elapsedRef.current += 1;
      if (activityRef.current % cfg.activityInterval === 0) {
        setSteveAction(stevePool[Math.floor(Math.random() * stevePool.length)]);
        setWifeAction(wifePool[Math.floor(Math.random() * wifePool.length)]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, difficulty]);

  const triggerCheck = useCallback(() => {
    setCheckCount(c => c + 1);
    setParentName(["Стив", "Жена Стива"][Math.floor(Math.random() * 2)]);
    setScreen("check");
  }, []);

  useEffect(() => {
    if (screen !== "playing") return;
    const interval = setInterval(() => {
      setCheckTimer(t => {
        if (t <= 1) { triggerCheck(); return cfg.checkInterval; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, triggerCheck, cfg.checkInterval]);

  const handleAction = () => {
    setShowTip(true);
    setTimeout(() => {
      setShowTip(false);
      if (currentQuest + 1 >= QUESTS.length) {
        const e = pickEnding(difficulty, caughtCount, elapsedRef.current, checkCount);
        setEnding(e);
        setScreen("won");
      } else {
        setCurrentQuest(q => q + 1);
      }
    }, 2000);
  };

  // Проверка: спрятался → продолжаем, не успел → показываем наказание за ТЕКУЩИЙ квест
  const handleCheck = (hide: boolean) => {
    if (hide) {
      setScreen("playing");
      setCheckTimer(cfg.checkInterval);
    } else {
      setCaughtCount(c => c + 1);
      setPunishmentData(QUESTS[currentQuest].punishment);
      setScreen("punishment");
    }
  };

  // После наказания — продолжаем игру со следующего квеста
  const afterPunishment = () => {
    const next = currentQuest + 1;
    if (next >= QUESTS.length) {
      const e = pickEnding(difficulty, caughtCount, elapsedRef.current, checkCount);
      setEnding(e);
      setScreen("won");
    } else {
      setCurrentQuest(next);
      setCheckTimer(cfg.checkInterval);
      setScreen("playing");
    }
  };

  const startGame = (d: Difficulty) => {
    setDifficulty(d);
    setCurrentQuest(0);
    setCheckTimer(DIFFICULTIES[d].checkInterval);
    setShowTip(false);
    setCaughtCount(0);
    setCheckCount(0);
    elapsedRef.current = 0;
    activityRef.current = 0;
    setSteveAction((d === "night" ? NIGHT_STEVE : STEVE_ACTIONS)[0]);
    setWifeAction((d === "night" ? NIGHT_WIFE : WIFE_ACTIONS)[0]);
    setScreen("playing");
  };

  const openRules = (d: Difficulty) => {
    setPendingDifficulty(d);
    setScreen("rules");
  };

  // Нарушение: прыжок / бег → мгновенная проверка-штраф
  const violateRule = (type: "jump" | "run") => {
    setScreen(type);
    setTimeout(() => {
      triggerCheck();
    }, 2500);
  };

  // Чит → немедленный рестарт
  const useCheat = () => {
    setScreen("cheat");
    setTimeout(() => {
      startGame(difficulty);
    }, 3000);
  };

  const quest = QUESTS[currentQuest];
  const isUrgent = checkTimer <= cfg.urgentThreshold;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {isNight && <div className="absolute inset-0 bg-indigo-950/40 pointer-events-none" />}
      <a href="/" className="absolute top-4 left-4 text-gray-500 hover:text-gray-300 text-xs uppercase tracking-wide transition-colors z-20">← На главную</a>

      <AnimatePresence mode="wait">

        {/* ── МЕНЮ ── */}
        {screen === "menu" && (
          <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pt-12">
            <div className="text-5xl mb-2">🎮</div>
            <h1 className="text-3xl font-bold mb-1">Steve's Escape</h1>

            {/* Персонажи */}
            <div className="flex gap-4 my-5">
              {Object.values(CHARACTERS).map(c => (
                <div key={c.name} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-center w-28">
                  <div className="text-3xl mb-1">{c.emoji}</div>
                  <div className="text-xs font-bold">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.role}</div>
                </div>
              ))}
            </div>

            <p className="text-gray-400 mb-5 text-sm text-center max-w-sm">Помоги сыну сбежать на улицу. 8 квестов, наказания от родителей и 8 концовок.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map(key => {
                const d = DIFFICULTIES[key];
                return (
                  <button key={key} onClick={() => openRules(key)}
                    className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg px-5 py-4 text-left transition-all hover:bg-gray-800">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{d.emoji}</span>
                      <span className={`font-bold text-lg ${d.color}`}>{d.label}</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{d.desc}</p>
                    {d.extraRule && <p className="text-xs mt-1 opacity-50">{d.extraRule}</p>}
                  </button>
                );
              })}
            </div>

            <p className="text-gray-700 text-xs mt-6">8 концовок · 3 персонажа · наказания</p>
          </motion.div>
        )}

        {/* ── ПРАВИЛА ── */}
        {screen === "rules" && (
          <motion.div key="rules" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full pt-12">
            <div className="text-5xl mb-3">📋</div>
            <h2 className="text-2xl font-bold mb-1">Правила игры</h2>
            <p className="text-gray-500 text-sm mb-6">Нарушение правил — немедленное наказание</p>
            <div className="w-full space-y-3 mb-8">
              {RULES.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${r.penalty ? "border-red-900/50 bg-red-950/20" : "border-green-900/50 bg-green-950/20"}`}>
                  <span className="text-xl mt-0.5">{r.icon}</span>
                  <div>
                    <p className={`font-bold text-sm ${r.penalty ? "text-red-300" : "text-green-300"}`}>{r.text}</p>
                    {r.penalty && <p className="text-xs text-gray-500 mt-0.5">Штраф: {r.penalty}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setScreen("menu")}
                className="bg-gray-800 text-white font-bold px-6 py-3 uppercase tracking-wide hover:bg-gray-700 transition-colors">
                Назад
              </button>
              <button onClick={() => startGame(pendingDifficulty)}
                className="bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors">
                Понял, начинаем!
              </button>
            </div>
          </motion.div>
        )}

        {/* ── НАРУШЕНИЕ: ПРЫЖОК ── */}
        {screen === "jump" && (
          <motion.div key="jump" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-5 animate-bounce">🦘</div>
            <h1 className="text-3xl font-bold text-orange-400 mb-3">ТЫ ПРЫГНУЛ!</h1>
            <p className="text-gray-300 mb-2">Стив услышал удар об пол.</p>
            <p className="text-red-400 font-bold text-sm mb-6">🚫 Правило нарушено: нельзя прыгать!</p>
            <p className="text-gray-500 text-sm">Идёт проверка...</p>
          </motion.div>
        )}

        {/* ── НАРУШЕНИЕ: БЕГ ── */}
        {screen === "run" && (
          <motion.div key="run" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-5">🏃💨</div>
            <h1 className="text-3xl font-bold text-orange-400 mb-3">ТЫ ПОБЕЖАЛ!</h1>
            <p className="text-gray-300 mb-2">Жена Стива услышала топот и встала.</p>
            <p className="text-red-400 font-bold text-sm mb-6">🚫 Правило нарушено: нельзя бегать!</p>
            <p className="text-gray-500 text-sm">Идёт проверка...</p>
          </motion.div>
        )}

        {/* ── НАРУШЕНИЕ: ЧИТ ── */}
        {screen === "cheat" && (
          <motion.div key="cheat" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-5">💻</div>
            <h1 className="text-3xl font-bold text-red-400 mb-3">ЧИТ ОБНАРУЖЕН!</h1>
            <p className="text-gray-300 mb-2">Стив и жена всё видели. Ты дисквалифицирован.</p>
            <p className="text-red-400 font-bold text-sm mb-6">🚫 Правило нарушено: читы запрещены!</p>
            <p className="text-gray-500 text-sm">Игра начинается заново...</p>
          </motion.div>
        )}

        {/* ── НАКАЗАНИЕ ── */}
        {screen === "punishment" && punishmentData && (
          <motion.div key="punishment" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-7xl mb-5">😰</div>
            <h1 className="text-3xl font-bold text-red-400 mb-3">ПОПАЛСЯ!</h1>
            <div className="bg-gray-900 border border-red-900 rounded-lg px-5 py-4 mb-4 text-left max-w-sm w-full">
              <p className="text-gray-200 text-sm mb-3 leading-relaxed">
                {punishmentData.catcher === "steve"
                  ? `👨 ${CHARACTERS.steve.name}: `
                  : `👩 ${CHARACTERS.wife.name}: `}
                <span className="text-gray-300">{punishmentData.text}</span>
              </p>
              <p className="text-red-400 font-bold text-sm">{punishmentData.penalty}</p>
            </div>
            <p className="text-gray-500 text-sm mb-6">Но ты не сдаёшься — продолжаешь план со следующего шага.</p>
            <button onClick={afterPunishment}
              className="bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-yellow-300 transition-colors">
              Продолжить побег 💪
            </button>
          </motion.div>
        )}

        {/* ── ПОБЕДА / КОНЦОВКА ── */}
        {screen === "won" && ending && (
          <motion.div key="won" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="text-8xl mb-4">{ending.emoji}</div>
            <h1 className={`text-4xl font-bold mb-2 ${ending.color}`}>{ending.title}</h1>
            {ending.secret && (
              <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs px-4 py-2 rounded mb-3">
                {ending.secret}
              </div>
            )}
            <p className="text-gray-300 text-base mb-4 leading-relaxed max-w-sm">{ending.text}</p>
            <div className="flex gap-2 text-xs text-gray-600 mb-6">
              <span>🎯 Квестов: {QUESTS.length}</span>
              <span>·</span>
              <span>😱 Поймали: {caughtCount}×</span>
              <span>·</span>
              <span>👁️ Проверок: {checkCount}</span>
            </div>
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

        {/* ── ПРОВЕРКА ── */}
        {screen === "check" && (
          <motion.div key="check" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-5 animate-bounce">{isNight ? "🔦" : "👁️"}</div>
            <h1 className="text-3xl font-bold text-red-400 mb-3">ПРОВЕРКА!</h1>
            <p className="text-xl text-gray-200 mb-1">
              <span className="text-yellow-400 font-bold">{parentName}</span> идёт в твою комнату!
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {isNight ? "Включил фонарик... притворись что спишь!" : "Успей спрятаться — у тебя 5 секунд!"}
            </p>
            <p className="text-xs text-gray-600 mb-6">Если попадёшься — получишь наказание за квест «{quest.title}»</p>
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

        {/* ── ИГРА ── */}
        {screen === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-12">

            <div className={`flex justify-between items-center mb-3 text-sm ${isUrgent ? "text-red-400" : "text-gray-400"}`}>
              <span className="flex items-center gap-2">
                <span className={cfg.color}>{cfg.emoji} {cfg.label}</span>
                <span className="text-gray-700">·</span>
                <span>Квест {currentQuest + 1}/{QUESTS.length}</span>
              </span>
              <span className={isUrgent ? "font-bold animate-pulse" : ""}>
                {isNight ? "🔦" : "👁️"} через {formatTime(checkTimer)}
              </span>
            </div>

            <div className="w-full bg-gray-800 h-1 mb-4 rounded-full">
              <motion.div className="bg-yellow-400 h-1 rounded-full"
                animate={{ width: `${(currentQuest / QUESTS.length) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>

            {cfg.extraRule && (
              <div className="text-xs px-3 py-2 rounded mb-4 border border-orange-900 bg-orange-950/30 text-orange-300">
                {cfg.extraRule}
              </div>
            )}

            {/* Что делают родители */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <AnimatePresence mode="wait">
                <motion.div key={steveAction.text} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-xl">{steveAction.icon}</span><span>{steveAction.text}</span>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div key={wifeAction.text} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-xl">{wifeAction.icon}</span><span>{wifeAction.text}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Текущий квест */}
            <AnimatePresence mode="wait">
              <motion.div key={`quest-${currentQuest}`} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
                className="flex-1 flex flex-col items-center text-center">

                {/* Предмет */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 mb-4 flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-2xl">{quest.item}</span>
                  <span>Предмет: <span className="text-white font-bold">{quest.itemName}</span></span>
                </div>

                <div className="text-6xl mb-4">{quest.item}</div>
                <h2 className="text-2xl font-bold mb-2">{quest.title}</h2>
                <p className="text-gray-300 text-base mb-5 leading-relaxed max-w-sm">{quest.desc}</p>

                {/* Наказание за провал */}
                <div className="bg-red-950/30 border border-red-900/50 rounded px-3 py-2 text-xs text-red-300 mb-5 max-w-sm w-full text-left">
                  ⚠️ Если попадёшься: {quest.punishment.penalty.replace("❌ Наказание: ", "")}
                </div>

                <AnimatePresence>
                  {showTip && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm px-4 py-3 mb-4 rounded max-w-sm">
                      {quest.tip}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={handleAction} disabled={showTip}
                  className="bg-yellow-400 text-black font-bold px-10 py-4 uppercase tracking-wide hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                  {quest.action}
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Прогресс квестов */}
            <div className="grid grid-cols-8 gap-1 mt-8 mb-4">
              {QUESTS.map((q, i) => (
                <div key={q.id} className={`text-xl text-center py-1 rounded transition-all duration-300 ${
                  i < currentQuest ? "opacity-100" : i === currentQuest ? "opacity-100 scale-110" : "opacity-20"}`}>
                  {i < currentQuest ? "✅" : q.item}
                </div>
              ))}
            </div>

            {/* Запрещённые действия */}
            <div className="border-t border-gray-800 pt-4 pb-2">
              <p className="text-xs text-gray-700 uppercase tracking-wider mb-3 text-center">Запрещённые действия</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => violateRule("jump")}
                  className="flex items-center gap-1 bg-gray-900 border border-red-900/40 text-red-400 text-xs px-3 py-2 rounded hover:bg-red-950/30 transition-colors">
                  🦘 Прыгнуть
                </button>
                <button onClick={() => violateRule("run")}
                  className="flex items-center gap-1 bg-gray-900 border border-red-900/40 text-red-400 text-xs px-3 py-2 rounded hover:bg-red-950/30 transition-colors">
                  🏃 Побежать
                </button>
                <button onClick={useCheat}
                  className="flex items-center gap-1 bg-gray-900 border border-red-900/40 text-red-400 text-xs px-3 py-2 rounded hover:bg-red-950/30 transition-colors">
                  💻 Читить
                </button>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}