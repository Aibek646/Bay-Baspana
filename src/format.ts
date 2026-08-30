// 1 комната, 2 комнаты, 5 комнат — русские окончания по числу
const plural = (n: number, one: string, few: string, many: string) => {
    const mod100 = n % 100;
    const mod10 = n % 10;

    if (mod100 >= 11 && mod100 <= 14) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
};

export const formatPrice = (n: number) => n.toLocaleString('ru-RU') + ' ₸';

export const formatArea = (area: number) =>
    `${area.toLocaleString('ru-RU')} м²`;

// для страницы квартиры: «2 комнаты»
export const formatRooms = (rooms: number) =>
    rooms === 0
        ? 'Студия'
        : `${rooms} ${plural(rooms, 'комната', 'комнаты', 'комнат')}`;

// для списка: «2 комн.»
export const formatRoomsShort = (rooms: number) =>
    rooms === 0 ? 'Студия' : `${rooms} комн.`;
