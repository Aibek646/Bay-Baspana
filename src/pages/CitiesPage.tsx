import { useNavigate } from 'react-router-dom';
import { apartments, cities } from '../data/mock.ts';

const CitiesPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="px-5 pt-14 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    BAY BASPANA
                </h1>
                <p className="mt-1 text-gray-500">Объекты недвижимости</p>
            </header>
            <div className="space-y-3 px-5">
                {cities.map((city) => {
                    const count = apartments.filter(
                        (a) => a.cityId === city.id
                    ).length;
                    return (
                        <button
                            onClick={() => navigate(`/city/${city.id}`)}
                            key={city.id}
                            className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-all duration-200 active:opacity-70 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        >
                            <div className="text-left">
                                <div className="text-lg font-semibold text-gray-900">
                                    {city.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {count} объектов
                                </div>
                            </div>

                            <span className="text-2xl text-gray-400">›</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
export default CitiesPage;
