interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`absolute top-0 left-0 right-0 z-10 p-6 ${className ?? ""}`}>
      <div className="flex justify-between items-center">
        <div className="text-white text-sm uppercase tracking-wide">🎮 Steve's Escape</div>
        <nav className="flex gap-8">
          <a
            href="#quests"
            className="text-white hover:text-yellow-400 transition-colors duration-300 uppercase text-sm"
          >
            Квесты
          </a>
          <a
            href="#rules"
            className="text-white hover:text-yellow-400 transition-colors duration-300 uppercase text-sm"
          >
            Правила
          </a>
        </nav>
      </div>
    </header>
  );
}