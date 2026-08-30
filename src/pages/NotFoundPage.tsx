import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className="pt-safe bg-ground min-h-screen p-5">
        <h1 className="text-ink text-2xl font-bold">Страница не найдена</h1>
        <Link to="/" className="mt-4 inline-block text-lg text-blue-500">
            ‹ К объектам
        </Link>
    </div>
);

export default NotFoundPage;
