import { useState } from 'react';
import { PROPERTY_TYPES } from '../property';
import { activeCount, emptyFilters, type Filters } from '../filters';

type ApartmentFiltersProps = {
    value: Filters;
    onChange: (next: Filters) => void;
};

const ROOM_OPTIONS = [1, 2, 3, 4];

const chipClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 active:opacity-70 ${
        active ? 'btn-accent-sm' : 'bg-ground text-ink'
    }`;

const inputClass =
    'w-full rounded-xl border border-line bg-surface p-3 text-ink outline-none focus:border-blue-400';

const ApartmentFilters = ({ value, onChange }: ApartmentFiltersProps) => {
    const [open, setOpen] = useState(false);
    const count = activeCount(value);

    // одна функция на все поля: ключ + новое значение
    const set = <K extends keyof Filters>(key: K, next: Filters[K]) =>
        onChange({ ...value, [key]: next });

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="search"
                    value={value.query}
                    onChange={(e) => set('query', e.target.value)}
                    placeholder="Поиск по району"
                    className={inputClass}
                />

                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 font-medium transition-all duration-200 active:opacity-70 ${
                        open || count > 0
                            ? 'btn-accent-sm'
                            : 'bg-surface text-ink'
                    }`}
                >
                    Фильтры
                    {count > 0 && (
                        <span className="bg-surface flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-blue-600">
                            {count}
                        </span>
                    )}
                </button>
            </div>

            {open && (
                <div className="bg-surface space-y-4 rounded-2xl p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                    <div>
                        <div className="text-muted mb-2 text-sm">
                            Тип объекта
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => set('propertyType', 'all')}
                                className={chipClass(
                                    value.propertyType === 'all'
                                )}
                            >
                                Все
                            </button>
                            {PROPERTY_TYPES.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() =>
                                        set('propertyType', item.value)
                                    }
                                    className={chipClass(
                                        value.propertyType === item.value
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-muted mb-2 text-sm">Комнат</div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => set('rooms', null)}
                                className={chipClass(value.rooms === null)}
                            >
                                Любое
                            </button>
                            {ROOM_OPTIONS.map((rooms) => (
                                <button
                                    key={rooms}
                                    type="button"
                                    onClick={() => set('rooms', rooms)}
                                    className={chipClass(value.rooms === rooms)}
                                >
                                    {rooms === 4 ? '4+' : rooms}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-muted mb-2 text-sm">Цена, ₸</div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={value.priceFrom}
                                onChange={(e) =>
                                    set('priceFrom', e.target.value)
                                }
                                placeholder="от"
                                className={inputClass}
                            />
                            <input
                                type="number"
                                value={value.priceTo}
                                onChange={(e) => set('priceTo', e.target.value)}
                                placeholder="до"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <label className="bg-ground flex items-center justify-between rounded-xl p-3">
                        <span className="text-ink">Скрыть проданные</span>
                        <input
                            type="checkbox"
                            checked={value.hideSold}
                            onChange={(e) => set('hideSold', e.target.checked)}
                            className="h-5 w-5"
                        />
                    </label>

                    <label className="bg-ground flex items-center justify-between rounded-xl p-3">
                        <span className="text-ink">Показать архив</span>
                        <input
                            type="checkbox"
                            checked={value.showArchive}
                            onChange={(e) =>
                                set('showArchive', e.target.checked)
                            }
                            className="h-5 w-5"
                        />
                    </label>

                    {count > 0 && (
                        <button
                            type="button"
                            onClick={() => onChange(emptyFilters)}
                            className="bg-ground w-full rounded-xl py-2.5 text-sm font-medium text-blue-600 transition-opacity active:opacity-70 dark:text-blue-400"
                        >
                            Сбросить фильтры
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ApartmentFilters;
