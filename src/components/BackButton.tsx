import { useNavigate } from 'react-router-dom';

type BackButtonProps = {
    to: string;
    variant?: 'plain' | 'overlay';
};

const BackButton = ({ to, variant = 'plain' }: BackButtonProps) => {
    const navigate = useNavigate();

    const look =
        variant === 'overlay'
            ? 'bg-white/90 shadow-[0_4px_14px_rgba(0,0,0,0.15)] backdrop-blur'
            : 'bg-white shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]';

    return (
        <button
            type="button"
            onClick={() => navigate(to)}
            aria-label="Назад"
            className={`flex h-10 w-10 items-center justify-center rounded-full text-gray-800 transition-all duration-200 active:opacity-70 ${look}`}
        >
            <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M15 5 8 12l7 7" />
            </svg>
        </button>
    );
};

export default BackButton;
