import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ApartmentForm, { type SubmitPayload } from '../components/ApartmentForm';
import type { Apartment } from '../types';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';
import { deletePhotos, uploadPhotos } from '../storage.ts';
import { apartmentKeys } from '../queryKey.ts';
import { humanError } from '../errors.ts';
import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import BackButton from '../components/BackButton.tsx';

const EditApartmentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { isStaff, isAdmin, loading: authLoading } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const aptQuery = useQuery({
        queryKey: apartmentKeys.detail('apartments', id),
        enabled: !authLoading && isStaff,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('apartments')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error) throw error;
            return data as Apartment | null;
        },
    });

    const saveMutation = useMutation({
        mutationFn: async ({
            form,
            dealType,
            files,
            removedPhotos,
        }: SubmitPayload) => {
            const current = aptQuery.data!;

            const newUrls = await uploadPhotos(files);
            const isInstallment = dealType === 'installment';

            const photos = [
                ...current.photos.filter((url) => !removedPhotos.includes(url)),
                ...newUrls,
            ];

            const { error } = await supabase
                .from('apartments')
                .update({
                    address: String(form.address),
                    ownerName: String(form.ownerName),
                    whatsapp: String(form.whatsapp),
                    mapUrl: String(form.mapUrl) || null,
                    price: Number(form.price),
                    isSold: Boolean(form.isSold),
                    comment: String(form.comment),
                    dealType,
                    downPayment: isInstallment
                        ? Number(form.downPayment)
                        : null,
                    installmentMonths: isInstallment
                        ? Number(form.installmentMonths)
                        : null,
                    monthlyPayment: isInstallment
                        ? Number(form.monthlyPayment)
                        : null,
                    photos,
                })
                .eq('id', id);

            if (error) {
                // строка не изменилась — новые фото не нужны
                await deletePhotos(newUrls).catch((err) =>
                    console.warn('Не удалось убрать загруженные фото:', err)
                );
                throw error;
            }

            if (removedPhotos.length > 0) {
                try {
                    await deletePhotos(removedPhotos);
                } catch (err) {
                    console.warn('Старые фото не удалились из Storage:', err);
                }
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: apartmentKeys.all,
            });
            navigate(`/apartment/${id}`, { replace: true });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const current = aptQuery.data!;

            // Сначала строка в базе, потом файлы — почему именно так, см. ниже
            const { error } = await supabase
                .from('apartments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            try {
                await deletePhotos(current.photos);
            } catch (err) {
                console.warn('Фото не удалились из Storage:', err);
            }

            return current.cityId;
        },
        onSuccess: async (cityId) => {
            await queryClient.invalidateQueries({
                queryKey: apartmentKeys.all,
            });
            navigate(`/city/${cityId}`, { replace: true });
        },
    });

    if (authLoading || aptQuery.isLoading) {
        return (
            <div className="pt-safe min-h-screen bg-gray-100 p-5 text-gray-400">
                Загрузка…
            </div>
        );
    }

    if (!isStaff) {
        return (
            <div className="pt-safe min-h-screen bg-gray-100 p-5 text-gray-500">
                Нет доступа
            </div>
        );
    }

    const apt = aptQuery.data;

    if (aptQuery.isError || !apt) {
        return (
            <div className="pt-safe min-h-screen bg-gray-100 p-5 text-gray-500">
                {aptQuery.isError
                    ? 'Не удалось загрузить квартиру'
                    : 'Квартира не найдена'}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-28">
            <header className="pt-safe px-5 pb-4">
                <div className="mb-3">
                    <BackButton to={`/apartment/${id}`} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Изменить квартиру
                </h1>
            </header>

            <ApartmentForm
                initial={apt}
                saving={saveMutation.isPending}
                submitLabel="Сохранить изменения"
                saveError={humanError(saveMutation.error)}
                onSubmit={saveMutation.mutate}
            />
            {isAdmin && (
                <div className="mt-8 px-5">
                    <button
                        onClick={() => setConfirmOpen(true)}
                        disabled={deleteMutation.isPending}
                        className="w-full rounded-xl border border-red-200 bg-white py-3 font-semibold text-red-600 transition-all duration-200 active:opacity-70 disabled:opacity-50"
                    >
                        {deleteMutation.isPending
                            ? 'Удаляем…'
                            : 'Удалить квартиру'}
                    </button>
                    {deleteMutation.isError && (
                        <p className="mt-2 text-sm text-red-600">
                            {humanError(deleteMutation.error)}
                        </p>
                    )}
                    {confirmOpen && (
                        <ConfirmDialog
                            title="Удалить квартиру?"
                            message={`«${apt.address}» и её фотографии будут удалены. Отменить будет нельзя.`}
                            confirmLabel="Удалить"
                            busyLabel="Удаляем…"
                            busy={deleteMutation.isPending}
                            onConfirm={() => deleteMutation.mutate()}
                            onCancel={() => setConfirmOpen(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default EditApartmentPage;
