// Заготовки вместо надписи «Загрузка…»: пользователь сразу видит форму
// будущего экрана, и ожидание ощущается короче

const Bar = ({ className = '' }: { className?: string }) => (
    <div className={`bg-line rounded ${className}`} />
);

export const CardsSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="animate-pulse space-y-3 px-5">
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-surface flex gap-4 rounded-2xl p-4">
                <div className="bg-line h-24 w-24 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2.5 py-1">
                    <Bar className="h-4 w-2/3" />
                    <Bar className="h-5 w-24 rounded-full" />
                    <Bar className="h-5 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

export const RowsSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="animate-pulse space-y-3 px-5">
        {Array.from({ length: count }).map((_, index) => (
            <div
                key={index}
                className="bg-surface flex items-center justify-between rounded-2xl p-5"
            >
                <div className="space-y-2">
                    <Bar className="h-5 w-32" />
                    <Bar className="h-3 w-20" />
                </div>
                <Bar className="h-5 w-3" />
            </div>
        ))}
    </div>
);

export const DetailSkeleton = () => (
    <div className="animate-pulse">
        <div className="bg-line aspect-[4/3] w-full" />
        <div className="space-y-3 px-5 pt-5">
            <Bar className="h-7 w-28 rounded-full" />
            <Bar className="h-7 w-2/3" />
            <Bar className="h-6 w-1/3" />
            <div className="bg-surface h-14 rounded-2xl" />
            <div className="bg-surface h-40 rounded-2xl" />
        </div>
    </div>
);
