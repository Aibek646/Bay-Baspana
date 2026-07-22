import { useNavigate, useParams } from 'react-router-dom';
import { apartments } from '../data/mock.ts';

const formatPrice = (n: number) => n.toLocaleString('ru-RU') + ' ₸';

const ApartmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const apt = apartments.find((a) => a.id === id);

    if (!apt) {
        return (
            <div className="min-h-screen bg-gray-100 p-5 pt-14">
                <button
                    onClick={() => navigate(-1)}
                    className="text-lg text-blue-500"
                >
                    ‹ Назад
                </button>
                <p className="mt-4 text-gray-500">Квартира не найдена</p>
            </div>
        );
    }

    const waNumber = apt.whatsapp.replace(/\D/g, '');
    const waLink = `https://wa.me/${waNumber}`;

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            <div className="relative h-64 bg-gray-300">
                {apt.photos.length > 0 ? (
                    <img
                        src={apt.photos[0]}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                        Нет фото
                    </div>
                )}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-12 left-4 rounded-full bg-white/90 px-4 py-2 text-blue-500 shadow transition-opacity active:opacity-70"
                >
                    ‹ Назад
                </button>
            </div>
            <div className="px-5">
                <div className="mt-5">
                    {apt.isSold ? (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
                            Продано
                        </span>
                    ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            В продаже
                        </span>
                    )}
                </div>
                <h1 className="mt-3 text-2xl font-bold text-gray-900">
                    {apt.address}
                </h1>
                <div className="mt-1 text-xl font-bold text-gray-900">
                    {formatPrice(apt.price)}
                </div>

                <div className="shadow=[0_4px_14px_rgba(0,0,0,0.10)] mt-4 rounded-2xl bg-white p-5">
                    {apt.dealType === 'cash' ? (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Оплата</span>
                            <span className="font-semibold text-gray-900">
                                Наличными
                            </span>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-gray-500">Оплата</span>
                                <span className="font-semibold text-blue-600">
                                    Рассрочка
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 py-2">
                                <span className="text-gray-500">
                                    Первоначальный взнос
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatPrice(apt.downPayment ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 py-2">
                                <span className="text-gray-500">Срок</span>
                                <span className="font-medium text-gray-900">
                                    {apt.installmentMonths} мес.
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 py-2">
                                <span className="text-gray-500">
                                    Ежемесячный платёж
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatPrice(apt.monthlyPayment ?? 0)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                    <div className="text-sm text-gray-500">Хозяйн</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {apt.ownerName}
                    </div>
                    <div className="mt-1 text-gray-600">{apt.whatsapp}</div>
                    <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="active:opacity-80' mt-4 flex items-center justify-center rounded-xl bg-green-500 py-3 font-semibold text-white transition-opacity"
                    >
                        Написать в WhatsApp
                    </a>
                </div>
                <div className="mt-4 rounded-2xl bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                    <div className="text-sm text-gray-800">
                        {apt.comment || 'Нет комментария'}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ApartmentDetailPage;
