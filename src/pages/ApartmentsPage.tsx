import { useNavigate, useParams } from 'react-router-dom';
import { apartments, cities } from '../data/mock.ts';

const formatPrice = (n: number) => n.toLocaleString('ru-RU') + ' ₸';

const ApartmentsPage = () => {
    const { cityId } = useParams();
    const navigate = useNavigate();

    const city = cities.find((c) => c.id === cityId);

    const list = apartments.filter((a) => a.cityId === cityId);

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="px-5 pt-14 pb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-2 text-lg text-blue-500 transition-opacity active:opacity-60"
                >
                    ‹ Назад
                </button>

                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                    {city?.name}
                </h1>
                <p className="mt-1 text-gray-500">{list.length} обьектов</p>
            </header>
            <div className="space-y-3 px-5">
                {list.map((apt) => (
                    <div
                        key={apt.id}
                        onClick={() => navigate(`/apartment/${apt.id}`)}
                        className="flex cursor-pointer gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.10)] transition-all duration-200 active:opacity-70 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                            {apt.photos.length > 0 ? (
                                <img
                                    src={apt.photos[0]}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-3xl">
                                    🏠
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-gray-900">
                                    {apt.address}
                                </div>

                                {apt.isSold ? (
                                    <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                                        Продано
                                    </span>
                                ) : (
                                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                        В продаже
                                    </span>
                                )}
                            </div>

                            <div className="mt-1 text-lg font-bold text-gray-900">
                                {formatPrice(apt.price)}
                            </div>
                            <div className="mt-0.5 text-sm text-gray-500">
                                Хозяин: {apt.ownerName}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ApartmentsPage;
