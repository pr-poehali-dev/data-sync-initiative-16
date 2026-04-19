import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHARACTERS = {
  steve: { name: "Стив", emoji: "👨", role: "Папа" },
  wife:  { name: "Жена Стива", emoji: "👩", role: "Мама" },
  son:   { name: "Сын", emoji: "👦", role: "Ты" },
};

const QUESTS = [
  { id: 1, item: "🧦", itemName: "Носки", title: "Надень носки", desc: "Половицы скрипят! Надень носки — двигайся бесшумно.", action: "Надеваю носки", tip: "💡 Скрипнул пол — мама уже встала с дивана.", punishment: { catcher: "steve", text: "Стив услышал скрип и вышел в коридор.", penalty: "❌ Убираешь квартиру всю субботу." } },
  { id: 2, item: "📺", itemName: "Пульт", title: "Включи сериал", desc: "Включи родителям любимый сериал — пусть отвлекутся.", action: "Включаю сериал", tip: "💡 Тихо в доме — значит идут проверять.", punishment: { catcher: "wife", text: "Жена заметила, что пульт лежит не на месте.", penalty: "❌ Неделю без телефона." } },
  { id: 3, item: "🛏️", itemName: "Подушки", title: "Сделай чучело", desc: "Подложи подушки под одеяло — пусть думают, что ты спишь.", action: "Делаю чучело", tip: "💡 Папа проверяет ровно через 10 минут после отбоя.", punishment: { catcher: "steve", text: "Стив зашёл и увидел торчащую подушку.", penalty: "❌ Домашний арест на всё лето." } },
  { id: 4, item: "🔑", itemName: "Ключи", title: "Найди ключи", desc: "Запасные ключи в прихожей. Найди их бесшумно!", action: "Беру ключи", tip: "💡 Брелок звякнул — сразу ставь на место.", punishment: { catcher: "wife", text: "Жена услышала звон ключей с кухни.", penalty: "❌ Неделю моешь посуду и выносишь мусор." } },
  { id: 5, item: "🧴", itemName: "Масло", title: "Смажь петли", desc: "Дверь скрипит! Найди масло и смажь петли заранее.", action: "Смазываю петли", tip: "💡 Один скрип прощают, второй — никогда.", punishment: { catcher: "steve", text: "Дверь скрипнула — Стив сидел прямо рядом.", penalty: "❌ Две недели без прогулок." } },
  { id: 6, item: "🚪", itemName: "Замок", title: "Открой дверь", desc: "Три оборота замка — медленно, без звука!", action: "Открываю замок", tip: "💡 Жди, пока телевизор заглушит щелчок.", punishment: { catcher: "wife", text: "Жена вышла за стаканом воды — прямо сейчас.", penalty: "❌ Весь месяц дома. Без исключений." } },
  { id: 7, item: "👟", itemName: "Кроссовки", title: "Обуйся за дверью", desc: "Возьми кроссовки в руки и обуйся уже на улице.", action: "Беру кроссовки", tip: "💡 Стук обуви об пол слышен на весь коридор.", punishment: { catcher: "steve", text: "Стив вышел покурить — прямо на площадку.", penalty: "❌ Сдаёшь дневник на проверку каждый день." } },
  { id: 8, item: "🏃", itemName: "Свобода", title: "Беги!", desc: "Дверь открыта — улица зовёт! Беги, пока никто не смотрит!", action: "Бегу на улицу!", tip: "💡 Не беги мимо окон — мама видит сквозь шторы.", punishment: { catcher: "wife", text: "Жена выглянула в окно полить цветы — и увидела тебя.", penalty: "❌ Расскажешь всё сам. Родительское собрание." } },
];

const STEVE_ACTIONS = [
  { icon: "📺", text: "Стив смотрит ТВ" }, { icon: "☕", text: "Стив пьёт чай" },
  { icon: "🗞️", text: "Стив читает газету" }, { icon: "🔧", text: "Стив чинит кран" },
  { icon: "😴", text: "Стив дремлет" }, { icon: "🪟", text: "Стив смотрит в окно" },
];
const WIFE_ACTIONS = [
  { icon: "🍳", text: "Жена готовит" }, { icon: "🧺", text: "Жена раскладывает бельё" },
  { icon: "📞", text: "Жена по телефону" }, { icon: "🌿", text: "Жена поливает цветы" },
  { icon: "🧶", text: "Жена вяжет" }, { icon: "📖", text: "Жена читает у окна" },
];
const NIGHT_STEVE = [
  { icon: "😴", text: "Стив храпит" }, { icon: "🌙", text: "Стив ворочается" }, { icon: "💤", text: "Стив задремал у ТВ" },
];
const NIGHT_WIFE = [
  { icon: "😴", text: "Жена крепко спит" }, { icon: "🌙", text: "Жена пошла попить воды" }, { icon: "💤", text: "Жена слушает аудиокнигу" },
];

const RULES = [
  { icon: "🚫", text: "Нельзя читить", penalty: "Дисквалификация — игра заново" },
  { icon: "🚫", text: "Нельзя прыгать", penalty: "Стив услышит — мгновенная проверка" },
  { icon: "🚫", text: "Нельзя бегать", penalty: "Жена услышит — мгновенная проверка" },
  { icon: "✅", text: "Двигайся медленно и тихо", penalty: null },
  { icon: "✅", text: "Выполняй квесты по порядку", penalty: null },
  { icon: "✅", text: "Прячься при каждой проверке", penalty: null },
];

const ENDINGS = [
  { id: 1, condition: "perfect",   title: "НЕВИДИМКА",    emoji: "🥷", color: "text-yellow-400", text: "Ты прошёл всё так, что никто не почувствовал твоего присутствия.", secret: "✨ Ни одной проверки!" },
  { id: 2, condition: "speed",     title: "МОЛНИЯ",       emoji: "⚡", color: "text-blue-400",   text: "Ты вылетел из дома быстрее, чем Стив отпил чай.", secret: "✨ Скоростной побег!" },
  { id: 3, condition: "easy",      title: "СВОБОДА",      emoji: "🎉", color: "text-green-400",  text: "Ты перехитрил Стива и его жену. Только вернись до темноты...", secret: null },
  { id: 4, condition: "normal",    title: "БЕГЛЕЦ",       emoji: "🏃", color: "text-cyan-400",   text: "Несмотря на проверки, ты прорвался. Стив обнаружит чучело только вечером.", secret: null },
  { id: 5, condition: "hard",      title: "ЛЕГЕНДА",      emoji: "🏆", color: "text-orange-400", text: "На сложном режиме, под носом у нервных родителей — ты сделал это.", secret: null },
  { id: 6, condition: "night",     title: "НОЧНОЙ ПРИЗРАК", emoji: "🌙", color: "text-purple-400", text: "Пока все спали, ты растворился в темноте. Идеальный ночной побег.", secret: "✨ Побег в ночном режиме!" },
  { id: 7, condition: "challenge", title: "НЕВОЗМОЖНОЕ",  emoji: "💀", color: "text-red-400",    text: "Челлендж пройден. Стив до сих пор не понимает, как это возможно.", secret: "✨ Режим Челлендж!" },
  { id: 8, condition: "punished",  title: "ЗАКАЛЁННЫЙ",   emoji: "💪", color: "text-pink-400",   text: "Тебя ловили, наказывали — но ты всё равно вышел. Ты непобедим.", secret: "✨ Попался, но всё равно победил!" },
];

type Difficulty = "easy" | "normal" | "angry" | "nervous" | "challenge" | "night";
const DIFFICULTIES: Record<Difficulty, { label: string; emoji: string; desc: string; color: string; checkInterval: number; activityInterval: number; urgentThreshold: number; extraRule?: string }> = {
  easy:      { label: "Лёгкий",     emoji: "😌", color: "text-green-400",  desc: "Проверка раз в 15 мин",     checkInterval: 900, activityInterval: 30, urgentThreshold: 60 },
  normal:    { label: "Нормальный", emoji: "😐", color: "text-blue-400",   desc: "Проверка каждые 10 мин",    checkInterval: 600, activityInterval: 20, urgentThreshold: 30 },
  angry:     { label: "Злой",       emoji: "😠", color: "text-orange-400", desc: "Проверка каждые 5 мин",     checkInterval: 300, activityInterval: 12, urgentThreshold: 20, extraRule: "⚠️ Стив сегодня злой!" },
  nervous:   { label: "Нервный",    emoji: "😤", color: "text-yellow-400", desc: "Проверка каждые 3 мин",     checkInterval: 180, activityInterval: 8,  urgentThreshold: 15, extraRule: "⚠️ Они что-то чувствуют!" },
  challenge: { label: "Челлендж",   emoji: "💀", color: "text-red-400",    desc: "Проверка каждую минуту",    checkInterval: 60,  activityInterval: 5,  urgentThreshold: 10, extraRule: "☠️ Один промах — конец." },
  night:     { label: "Ночь",       emoji: "🌙", color: "text-purple-400", desc: "Все спят... или притворяются", checkInterval: 120, activityInterval: 40, urgentThreshold: 20, extraRule: "🌙 Ночью каждый звук громче." },
};

type Screen = "menu" | "rules" | "playing" | "punishment" | "won" | "check" | "cheat" | "jump" | "run";

function fmt(s: number) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`; }
function pickEnding(diff: Difficulty, caught: number, elapsed: number, checks: number) {
  if (diff === "challenge") return ENDINGS[6];
  if (diff === "night") return ENDINGS[5];
  if (checks === 0) return ENDINGS[0];
  if (elapsed < 120) return ENDINGS[1];
  if (caught >= 2) return ENDINGS[7];
  if (diff === "angry" || diff === "nervous") return ENDINGS[4];
  if (diff === "normal") return ENDINGS[3];
  return ENDINGS[2];
}

export default function Game() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [pendingDiff, setPendingDiff] = useState<Difficulty>("normal");
  const [diff, setDiff] = useState<Difficulty>("normal");
  const [quest, setQuest] = useState(0);
  const [timer, setTimer] = useState(600);
  const [showTip, setShowTip] = useState(false);
  const [checker, setChecker] = useState("Стив");
  const [steveA, setSteveA] = useState(STEVE_ACTIONS[0]);
  const [wifeA, setWifeA] = useState(WIFE_ACTIONS[0]);
  const [punishment, setPunishment] = useState<typeof QUESTS[0]["punishment"] | null>(null);
  const [ending, setEnding] = useState<typeof ENDINGS[0] | null>(null);
  const [caught, setCaught] = useState(0);
  const [checks, setChecks] = useState(0);
  const elapsed = useRef(0);
  const activity = useRef(0);

  const cfg = DIFFICULTIES[diff];
  const isNight = diff === "night";
  const sp = isNight ? NIGHT_STEVE : STEVE_ACTIONS;
  const wp = isNight ? NIGHT_WIFE : WIFE_ACTIONS;

  useEffect(() => {
    if (screen !== "playing") return;
    const t = setInterval(() => {
      activity.current += 1; elapsed.current += 1;
      if (activity.current % cfg.activityInterval === 0) {
        setSteveA(sp[Math.floor(Math.random() * sp.length)]);
        setWifeA(wp[Math.floor(Math.random() * wp.length)]);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [screen, diff]);

  const triggerCheck = useCallback(() => {
    setChecks(c => c + 1);
    setChecker(["Стив", "Жена Стива"][Math.floor(Math.random() * 2)]);
    setScreen("check");
  }, []);

  useEffect(() => {
    if (screen !== "playing") return;
    const t = setInterval(() => {
      setTimer(v => { if (v <= 1) { triggerCheck(); return cfg.checkInterval; } return v - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [screen, triggerCheck, cfg.checkInterval]);

  const doStart = (d: Difficulty) => {
    setDiff(d); setQuest(0); setTimer(DIFFICULTIES[d].checkInterval);
    setShowTip(false); setCaught(0); setChecks(0);
    elapsed.current = 0; activity.current = 0;
    setSteveA((d === "night" ? NIGHT_STEVE : STEVE_ACTIONS)[0]);
    setWifeA((d === "night" ? NIGHT_WIFE : WIFE_ACTIONS)[0]);
    setScreen("playing");
  };

  const openRules = (d: Difficulty) => { setPendingDiff(d); setScreen("rules"); };

  const doAction = () => {
    setShowTip(true);
    setTimeout(() => {
      setShowTip(false);
      if (quest + 1 >= QUESTS.length) { setEnding(pickEnding(diff, caught, elapsed.current, checks)); setScreen("won"); }
      else setQuest(q => q + 1);
    }, 1800);
  };

  const doCheck = (hide: boolean) => {
    if (hide) { setScreen("playing"); setTimer(cfg.checkInterval); }
    else { setCaught(c => c + 1); setPunishment(QUESTS[quest].punishment); setScreen("punishment"); }
  };

  const afterPunishment = () => {
    const next = quest + 1;
    if (next >= QUESTS.length) { setEnding(pickEnding(diff, caught, elapsed.current, checks)); setScreen("won"); }
    else { setQuest(next); setTimer(cfg.checkInterval); setScreen("playing"); }
  };

  const violate = (type: "jump" | "run") => {
    setScreen(type);
    setTimeout(() => triggerCheck(), 2500);
  };
  const useCheat = () => {
    setScreen("cheat");
    setTimeout(() => doStart(diff), 3000);
  };

  const q = QUESTS[quest];
  const urgent = timer <= cfg.urgentThreshold;

  // ── Общая обёртка — fullscreen на мобильном ──
  const Wrap = ({ children, center = true }: { children: React.ReactNode; center?: boolean }) => (
    <div className={`fixed inset-0 bg-gray-950 text-white overflow-y-auto flex flex-col ${center ? "items-center justify-center" : ""} px-4 pt-safe pb-safe`}
      style={{ paddingTop: "env(safe-area-inset-top, 16px)", paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {isNight && <div className="absolute inset-0 bg-indigo-950/40 pointer-events-none" />}
      <div className="relative z-10 w-full max-w-md mx-auto">{children}</div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">

      {/* ── МЕНЮ ── */}
      {screen === "menu" && (
        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="contents">
          <Wrap>
            <div className="flex flex-col items-center pt-10 pb-6">
              <a href="/" className="self-start text-gray-600 text-xs uppercase tracking-wide mb-6">← Назад</a>
              <div className="text-6xl mb-2">🎮</div>
              <h1 className="text-3xl font-bold mb-1 text-center">Steve's Escape</h1>
              <p className="text-gray-500 text-sm mb-5 text-center">8 квестов · 3 персонажа · 8 концовок</p>

              {/* Персонажи */}
              <div className="flex gap-3 mb-6 w-full justify-center">
                {Object.values(CHARACTERS).map(c => (
                  <div key={c.name} className="bg-gray-900 border border-gray-800 rounded-xl flex-1 py-3 text-center">
                    <div className="text-3xl mb-1">{c.emoji}</div>
                    <div className="text-xs font-bold leading-tight">{c.name}</div>
                    <div className="text-xs text-gray-600">{c.role}</div>
                  </div>
                ))}
              </div>

              {/* Сложности */}
              <div className="grid grid-cols-2 gap-2 w-full">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map(k => {
                  const d = DIFFICULTIES[k];
                  return (
                    <button key={k} onClick={() => openRules(k)}
                      className="bg-gray-900 active:bg-gray-800 border border-gray-800 rounded-xl px-4 py-3 text-left transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{d.emoji}</span>
                        <span className={`font-bold text-sm ${d.color}`}>{d.label}</span>
                      </div>
                      <p className="text-gray-500 text-xs">{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </Wrap>
        </motion.div>
      )}

      {/* ── ПРАВИЛА ── */}
      {screen === "rules" && (
        <motion.div key="rules" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} className="contents">
          <Wrap>
            <div className="flex flex-col pt-10 pb-6">
              <div className="text-4xl mb-2 text-center">📋</div>
              <h2 className="text-2xl font-bold mb-1 text-center">Правила</h2>
              <p className="text-gray-500 text-xs mb-5 text-center">Нарушение — немедленный штраф</p>
              <div className="space-y-2 mb-6">
                {RULES.map((r, i) => (
                  <div key={i} className={`flex items-start gap-3 px-3 py-3 rounded-xl border ${r.penalty ? "border-red-900/50 bg-red-950/20" : "border-green-900/50 bg-green-950/20"}`}>
                    <span className="text-lg mt-0.5 flex-shrink-0">{r.icon}</span>
                    <div>
                      <p className={`font-bold text-sm ${r.penalty ? "text-red-300" : "text-green-300"}`}>{r.text}</p>
                      {r.penalty && <p className="text-xs text-gray-600 mt-0.5">{r.penalty}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setScreen("menu")} className="flex-1 bg-gray-800 active:bg-gray-700 text-white font-bold py-4 rounded-xl uppercase text-sm tracking-wide">Назад</button>
                <button onClick={() => doStart(pendingDiff)} className="flex-1 bg-yellow-400 active:bg-yellow-300 text-black font-bold py-4 rounded-xl uppercase text-sm tracking-wide">Начать!</button>
              </div>
            </div>
          </Wrap>
        </motion.div>
      )}

      {/* ── НАРУШЕНИЕ: ПРЫЖОК ── */}
      {screen === "jump" && (
        <motion.div key="jump" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="contents">
          <Wrap>
            <div className="text-center py-10">
              <div className="text-8xl mb-5 animate-bounce">🦘</div>
              <h1 className="text-3xl font-bold text-orange-400 mb-2">ТЫ ПРЫГНУЛ!</h1>
              <p className="text-gray-300 mb-2">Стив услышал удар об пол.</p>
              <p className="text-red-400 font-bold text-sm mb-4">🚫 Нельзя прыгать!</p>
              <p className="text-gray-600 text-sm">Идёт проверка...</p>
            </div>
          </Wrap>
        </motion.div>
      )}

      {/* ── НАРУШЕНИЕ: БЕГ ── */}
      {screen === "run" && (
        <motion.div key="run" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} className="contents">
          <Wrap>
            <div className="text-center py-10">
              <div className="text-8xl mb-5">🏃💨</div>
              <h1 className="text-3xl font-bold text-orange-400 mb-2">ТЫ ПОБЕЖАЛ!</h1>
              <p className="text-gray-300 mb-2">Жена услышала топот и встала.</p>
              <p className="text-red-400 font-bold text-sm mb-4">🚫 Нельзя бегать!</p>
              <p className="text-gray-600 text-sm">Идёт проверка...</p>
            </div>
          </Wrap>
        </motion.div>
      )}

      {/* ── НАРУШЕНИЕ: ЧИТ ── */}
      {screen === "cheat" && (
        <motion.div key="cheat" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="contents">
          <Wrap>
            <div className="text-center py-10">
              <div className="text-8xl mb-5">💻</div>
              <h1 className="text-3xl font-bold text-red-400 mb-2">ЧИТ ОБНАРУЖЕН!</h1>
              <p className="text-gray-300 mb-2">Стив и жена всё видели.</p>
              <p className="text-red-400 font-bold text-sm mb-4">🚫 Читы запрещены!</p>
              <p className="text-gray-600 text-sm">Игра начинается заново...</p>
            </div>
          </Wrap>
        </motion.div>
      )}

      {/* ── ПРОВЕРКА ── */}
      {screen === "check" && (
        <motion.div key="check" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="contents">
          <Wrap>
            <div className="text-center py-8">
              <div className="text-8xl mb-4 animate-bounce">{isNight ? "🔦" : "👁️"}</div>
              <h1 className="text-3xl font-bold text-red-400 mb-2">ПРОВЕРКА!</h1>
              <p className="text-lg text-gray-200 mb-1">
                <span className="text-yellow-400 font-bold">{checker}</span> идёт в комнату!
              </p>
              <p className="text-gray-500 text-sm mb-1">{isNight ? "Притворись что спишь!" : "Спрячься за 5 секунд!"}</p>
              <p className="text-xs text-gray-700 mb-7">Провалишься — наказание за «{q.title}»</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => doCheck(true)}
                  className="w-full bg-green-500 active:bg-green-400 text-white font-bold py-5 rounded-2xl text-lg uppercase tracking-wide">
                  🙈 Спрятался!
                </button>
                <button onClick={() => doCheck(false)}
                  className="w-full bg-red-600 active:bg-red-500 text-white font-bold py-5 rounded-2xl text-lg uppercase tracking-wide">
                  😬 Не успел
                </button>
              </div>
            </div>
          </Wrap>
        </motion.div>
      )}

      {/* ── НАКАЗАНИЕ ── */}
      {screen === "punishment" && punishment && (
        <motion.div key="punishment" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="contents">
          <Wrap>
            <div className="text-center py-8">
              <div className="text-7xl mb-4">😰</div>
              <h1 className="text-3xl font-bold text-red-400 mb-4">ПОПАЛСЯ!</h1>
              <div className="bg-gray-900 border border-red-900/60 rounded-2xl px-4 py-4 mb-4 text-left">
                <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                  {punishment.catcher === "steve" ? "👨 Стив: " : "👩 Жена: "}
                  {punishment.text}
                </p>
                <p className="text-red-400 font-bold text-sm">{punishment.penalty}</p>
              </div>
              <p className="text-gray-600 text-xs mb-6">Но ты не сдаёшься — продолжаешь план!</p>
              <button onClick={afterPunishment}
                className="w-full bg-yellow-400 active:bg-yellow-300 text-black font-bold py-5 rounded-2xl text-lg uppercase tracking-wide">
                Продолжить 💪
              </button>
            </div>
          </Wrap>
        </motion.div>
      )}

      {/* ── ПОБЕДА ── */}
      {screen === "won" && ending && (
        <motion.div key="won" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="contents">
          <Wrap>
            <div className="text-center py-8">
              <div className="text-8xl mb-4">{ending.emoji}</div>
              <h1 className={`text-4xl font-bold mb-2 ${ending.color}`}>{ending.title}</h1>
              {ending.secret && (
                <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs px-4 py-2 rounded-xl mb-3 mx-auto max-w-xs">
                  {ending.secret}
                </div>
              )}
              <p className="text-gray-300 text-sm mb-4 leading-relaxed px-2">{ending.text}</p>
              <div className="flex gap-2 justify-center text-xs text-gray-700 mb-6">
                <span>😱 Поймали: {caught}×</span><span>·</span>
                <span>👁️ Проверок: {checks}</span>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => doStart(diff)}
                  className="w-full bg-yellow-400 active:bg-yellow-300 text-black font-bold py-5 rounded-2xl text-lg uppercase tracking-wide">
                  Ещё раз
                </button>
                <button onClick={() => setScreen("menu")}
                  className="w-full bg-gray-800 active:bg-gray-700 text-white font-bold py-4 rounded-2xl uppercase text-sm tracking-wide">
                  Другой режим
                </button>
              </div>
            </div>
          </Wrap>
        </motion.div>
      )}

      {/* ── ИГРА ── */}
      {screen === "playing" && (
        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="contents">
          <Wrap center={false}>
            <div className="flex flex-col min-h-screen pt-10 pb-4">

              {/* Шапка */}
              <div className={`flex justify-between items-center mb-2 text-xs ${urgent ? "text-red-400" : "text-gray-500"}`}>
                <span className={`font-bold ${cfg.color}`}>{cfg.emoji} {cfg.label} · {quest + 1}/{QUESTS.length}</span>
                <span className={urgent ? "font-bold animate-pulse" : ""}>{isNight ? "🔦" : "👁️"} {fmt(timer)}</span>
              </div>

              {/* Прогресс */}
              <div className="w-full bg-gray-800 h-1 rounded-full mb-3">
                <motion.div className="bg-yellow-400 h-1 rounded-full" animate={{ width: `${(quest / QUESTS.length) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>

              {/* Что делают родители */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <AnimatePresence mode="wait">
                  <motion.div key={steveA.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-xl">{steveA.icon}</span>
                    <span className="text-xs text-gray-400 leading-tight">{steveA.text}</span>
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.div key={wifeA.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-xl">{wifeA.icon}</span>
                    <span className="text-xs text-gray-400 leading-tight">{wifeA.text}</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {cfg.extraRule && (
                <div className="text-xs px-3 py-2 rounded-xl mb-3 border border-orange-900/40 bg-orange-950/20 text-orange-400">{cfg.extraRule}</div>
              )}

              {/* Квест */}
              <AnimatePresence mode="wait">
                <motion.div key={`q-${quest}`} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
                  className="flex-1 flex flex-col items-center text-center">

                  <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 mb-4 text-sm text-gray-300">
                    <span className="text-xl">{q.item}</span>
                    <span>Предмет: <span className="text-white font-bold">{q.itemName}</span></span>
                  </div>

                  <div className="text-7xl mb-3">{q.item}</div>
                  <h2 className="text-2xl font-bold mb-2">{q.title}</h2>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed px-2">{q.desc}</p>

                  <div className="bg-red-950/30 border border-red-900/40 rounded-xl px-3 py-2 text-xs text-red-400 mb-4 w-full text-left">
                    ⚠️ Если попадёшься: {q.punishment.penalty.replace("❌ ", "")}
                  </div>

                  <AnimatePresence>
                    {showTip && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs px-3 py-2 rounded-xl mb-4 w-full">
                        {q.tip}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={doAction} disabled={showTip}
                    className="w-full bg-yellow-400 active:bg-yellow-300 text-black font-bold py-5 rounded-2xl text-lg uppercase tracking-wide disabled:opacity-40 mb-4">
                    {q.action}
                  </button>

                  {/* Иконки прогресса */}
                  <div className="flex gap-1 justify-center flex-wrap mb-4">
                    {QUESTS.map((qp, i) => (
                      <span key={qp.id} className={`text-lg transition-all ${i < quest ? "opacity-100" : i === quest ? "opacity-100 scale-110" : "opacity-20"}`}>
                        {i < quest ? "✅" : qp.item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Запрещённые действия */}
              <div className="border-t border-gray-800 pt-3">
                <p className="text-xs text-gray-700 uppercase tracking-wider mb-2 text-center">Запрещено</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => violate("jump")} className="flex-1 bg-gray-900 active:bg-red-950/40 border border-red-900/30 text-red-500 text-xs py-2 rounded-xl">🦘 Прыгнуть</button>
                  <button onClick={() => violate("run")}  className="flex-1 bg-gray-900 active:bg-red-950/40 border border-red-900/30 text-red-500 text-xs py-2 rounded-xl">🏃 Побежать</button>
                  <button onClick={useCheat}              className="flex-1 bg-gray-900 active:bg-red-950/40 border border-red-900/30 text-red-500 text-xs py-2 rounded-xl">💻 Читить</button>
                </div>
              </div>

            </div>
          </Wrap>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
