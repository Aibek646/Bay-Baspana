// Иконки рисуем сами: эмодзи выглядит по-разному в каждой системе
// и не наследует цвет интерфейса

type IconProps = { className?: string };

export const PinIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);
