import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ApartmentForm, { type SubmitPayload } from '../components/ApartmentForm';
import { deletePhotos, uploadPhotos } from '../storage.ts';
import { apartmentKeys } from '../queryKey.ts';
import { humanError } from '../errors.ts';
import BackButton from '../components/BackButton.tsx';
import { formToApartment } from '../form.ts';
import { supabase } from '../supabase.ts';

const AddApartmentPage = () => {
    const { cityId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const saveMutation = useMutation({
        mutationFn: async ({ form, dealType, files }: SubmitPayload) => {
            const photos = await uploadPhotos(files);
            const isInstallment = dealType === 'installment';

            const { error } = await supabase.from('apartments').insert({
                ...formToApartment(form, dealType),
                cityId,
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
            <header className="pt-safe px-5 pb-4">
                <div className="mb-3">
                    <BackButton to={`/city/${cityId}`} />
                </div>
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
