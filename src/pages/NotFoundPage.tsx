import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className="pt-safe min-h-screen bg-gray-100 p-5">
        <h1 className="text-2xl font-bold text-gray-900">
            Страница не найдена
        </h1>
        <Link to="/" className="mt-4 inline-block text-lg text-blue-500">
            ‹ К объектам
        </Link>
    </div>
);

export default NotFoundPage;
