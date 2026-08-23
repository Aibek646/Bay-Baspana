import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ApartmentForm, { type SubmitPayload } from '../components/ApartmentForm';
import { supabase } from '../supabase.ts';
import { deletePhotos, uploadPhotos } from '../storage.ts';
import { apartmentKeys } from '../queryKey.ts';
import { humanError } from '../errors.ts';

const AddApartmentPage = () => {
    const { cityId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const saveMutation = useMutation({
        mutationFn: async ({ form, dealType, files }: SubmitPayload) => {
            const photos = await uploadPhotos(files);
            const isInstallment = dealType === 'installment';

            const { error } = await supabase.from('apartments').insert({
                cityId,
                address: String(form.address),
                ownerName: String(form.ownerName),
                whatsapp: String(form.whatsapp),
                mapUrl: String(form.mapUrl) || null,
                price: Number(form.price),
                isSold: Boolean(form.isSold),
                comment: String(form.comment),
                dealType,
                downPayment: isInstallment ? Number(form.downPayment) : null,
                installmentMonths: isInstallment
                    ? Number(form.installmentMonths)
                    : null,
                monthlyPayment: isInstallment
                    ? Number(form.monthlyPayment)
                    : null,
                photos,
            });

            if (error) {
                // квартира не создалась — фото никому не нужны
                await deletePhotos(photos).catch((err) =>
                    console.warn('Не удалось убрать загруженные фото:', err)
                );
                throw error;
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: apartmentKeys.all,
            });
            navigate(`/city/${cityId}`, { replace: true });
        },
    });

    return (
        <div className="min-h-screen bg-gray-100 pb-28">
            <header className="px-5 pt-safe pb-4">
                <button
                    onClick={() => navigate(`/city/${cityId}`)}
                    className="mb-2 text-lg text-blue-500 active:opacity-60"
                >
                    ‹ Назад
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    Новая квартира
                </h1>
            </header>

            <ApartmentForm
                saving={saveMutation.isPending}
                submitLabel="Сохранить"
                saveError={humanError(saveMutation.error)}
                onSubmit={saveMutation.mutate}
            />
        </div>
    );
};

export default AddApartmentPage;
