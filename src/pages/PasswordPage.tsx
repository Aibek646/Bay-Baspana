import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton.tsx';
import { supabase } from '../supabase.ts';
import { useAuth } from '../useAuth.ts';
import { humanError } from '../errors.ts';

const inputClass =
    'w-full rounded-xl border border-line bg-surface p-3 text-ink outline-none focus:border-blue-400';

const PasswordPage = () => {
    const navigate = useNavigate();
    const { session, isStaff, loading } = useAuth();

    const [password, setPassword] = useState('');
    const [repeat, setRepeat] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (loading) {
        return (
            <div className="pt-safe bg-ground text-muted min-h-screen p-5">
                Загрузка…
            </div>
        );
    }

    // Сюда же ведёт ссылка из письма «Забыли пароль»: Supabase разбирает её
    // и создаёт сессию. Нет сессии — значит ссылка устарела или вход не сделан
    if (!session) {
        return (
            <div className="pt-safe bg-ground min-h-screen p-5">
                <BackButton to="/" />
                <p className="text-ink mt-4">
                    Ссылка устарела или вы не вошли в аккаунт.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-4 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80"
                >
                    Войти
                </button>
            </div>
        );
    }

    const handleSave = async () => {
        if (password.length < 8) {
            setError('Пароль должен быть не короче 8 символов');
            return;
        }
        if (password !== repeat) {
            setError('Пароли не совпадают');
            return;
        }

        setSaving(true);
        setError('');

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        });

        setSaving(false);

        if (updateError) {
            setError(humanError(updateError) ?? 'Не удалось сменить пароль');
            return;
        }

        setDone(true);
    };

    // Удаление аккаунта — требование Google Play и App Store: если аккаунт
    // можно создать в приложении, его должно быть можно и удалить там же.
    // Данные уносит сама база каскадом, здесь только вызов и выход
    const handleDelete = async () => {
        setDeleting(true);
        setError('');

        const { error: rpcError } = await supabase.rpc('delete_my_account');

        if (rpcError) {
            setDeleting(false);
            setError(humanError(rpcError) ?? 'Не удалось удалить аккаунт');
            return;
        }

        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    return (
        <div className="pt-safe bg-ground min-h-screen px-5">
            <BackButton to="/" />

            <h1 className="text-ink mt-4 text-3xl font-bold">Аккаунт</h1>
            <p className="text-muted mt-1 mb-6">{session.user.email}</p>

            {done ? (
                <div className="bg-surface rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                    <p className="text-ink font-semibold">Пароль изменён</p>
                    <p className="text-muted mt-1">
                        В следующий раз входите с новым паролем.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80"
                    >
                        К объектам
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="новый пароль"
                        autoComplete="new-password"
                        className={inputClass}
                    />
                    <input
                        type="password"
                        value={repeat}
                        onChange={(e) => setRepeat(e.target.value)}
                        placeholder="ещё раз"
                        autoComplete="new-password"
                        className={inputClass}
                    />

                    {error && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white active:opacity-80 disabled:opacity-50"
                    >
                        {saving ? 'Сохраняем…' : 'Сохранить пароль'}
                    </button>
                </div>
            )}

            <div className="border-line-soft mt-10 border-t pt-6 pb-10">
                {isStaff ? (
                    <p className="text-muted text-sm">
                        Аккаунт сотрудника удаляется из панели Supabase — здесь
                        нельзя, чтобы не остаться без доступа к базе.
                    </p>
                ) : confirmOpen ? (
                    <div className="rounded-2xl border border-red-500/40 p-5">
                        <p className="text-ink font-semibold">
                            Удалить аккаунт?
                        </p>
                        <p className="text-muted mt-1 text-sm">
                            Вместе с аккаунтом удалится подписка. Восстановить
                            не получится — доступ придётся покупать заново.
                        </p>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="bg-surface text-ink flex-1 rounded-xl py-3 font-semibold"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {deleting ? 'Удаляем…' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="text-sm font-medium text-red-500 dark:text-red-400"
                    >
                        Удалить аккаунт
                    </button>
                )}
            </div>
        </div>
    );
};

export default PasswordPage;
