const quests = [
  { icon: "🔑", title: "Укради ключи", desc: "Найди запасные ключи от входной двери, пока Стив смотрит телевизор" },
  { icon: "🧦", title: "Тихий выход", desc: "Надень носки, чтобы не скрипеть половицами. Одна ошибка — и мама услышит" },
  { icon: "📱", title: "Взломай телефон", desc: "Найди отвлекающее видео для родителей и включи его на полную громкость" },
  { icon: "🚪", title: "Открой замок", desc: "Три оборота — и ни звука. Справишься за 10 секунд?" },
  { icon: "👁️", title: "Пройди проверку", desc: "Стив заглядывает в комнату каждые 15 минут. Оставь чучело под одеялом" },
  { icon: "🏃", title: "Свобода!", desc: "Ты на улице! Но помни — нужно вернуться до темноты, иначе всё начнётся снова" },
];

export default function Featured() {
  return (
    <div id="quests" className="min-h-screen px-6 py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <h3 className="uppercase mb-4 text-sm tracking-wide text-neutral-500">Игровые квесты</h3>
        <p className="text-3xl lg:text-5xl mb-16 text-neutral-900 leading-tight font-bold">
          Каждый шаг — это испытание.<br />Родители не дремлют.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quests.map((q, i) => (
            <div key={i} className="border border-neutral-200 p-6 hover:border-yellow-400 transition-colors duration-300">
              <div className="text-4xl mb-4">{q.icon}</div>
              <h4 className="text-lg font-bold mb-2 uppercase tracking-wide">{q.title}</h4>
              <p className="text-neutral-600 text-sm leading-relaxed">{q.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}