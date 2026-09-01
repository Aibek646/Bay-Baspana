import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.ts';
import { SUBSCRIPTION_PRICE } from '../config.ts';
import { formatPrice } from '../format.ts';

const inputClass =
    'w-full rounded-xl border border-line bg-surface p-3 text-ink outline-none focus:border-blue-400';

type Mode = 'login' | 'register';

const LoginPage = () => {
    const navigate = useNavigate();

    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const isRegister = mode === 'register';

    const handleSubmit = async () => {
        if (!email.trim()) {
            setError('Введите email');
            return;
        }
        if (isRegister && password.length < 8) {
            setError('Пароль должен быть не короче 8 символов');
            return;
        }

        setLoading(true);
        setError('');

        const { error: authError } = isRegister
            ? await supabase.auth.signUp({ email: email.trim(), password })
            : await supabase.auth.signInWithPassword({
                  email: email.trim(),
                  password,
              });

        setLoading(false);

        if (authError) {
            setError(
                isRegister
                    ? 'Не удалось зарегистрироваться. Возможно, такая почта уже есть'
                    : 'Неверный email или пароль'
            );
            return;
        }

        // куда идти, решит проверка доступа: нет подписки — экран оплаты
        navigate('/');
    };

    // письмо со ссылкой на /password, там же откроется форма смены пароля
    const handleReset = async () => {
        if (!email) {
            setError('Введите email — на него отправим письмо');
            return;
        }

        setLoading(true);
        setError('');

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email,
            { redirectTo: `${window.location.origin}/password` }
        );

        setLoading(false);

        if (resetError) {
            setError('Не удалось отправить письмо. Попробуйте позже');
            return;
        }

        setSent(true);
    };

    return (
        <div className="bg-ground min-h-screen px-5 pt-24">
            <h1 className="text-ink text-3xl font-bold">
                {isRegister ? 'Регистрация' : 'Вход'}
            </h1>
            <p className="text-muted mt-1 mb-6">
                {isRegister
                    ? `Доступ к каталогу — ${formatPrice(SUBSCRIPTION_PRICE)} на год`
                    : 'Каталог квартир, домов и участков'}
            </p>

            <div className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    autoComplete="email"
                    className={inputClass}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="пароль"
                    autoComplete={
                        isRegister ? 'new-password' : 'current-password'
                    }
                    className={inputClass}
                />

                {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-accent w-full rounded-xl py-3 font-semibold disabled:opacity-50"
                >
                    {loading
                        ? 'Подождите…'
                        : isRegister
                          ? 'Зарегистрироваться'
                          : 'Войти'}
                </button>

                <button
                    onClick={() => {
                        setMode(isRegister ? 'login' : 'register');
                        setError('');
                    }}
                    className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400"
                >
                    {isRegister
                        ? 'У меня уже есть аккаунт'
                        : 'Первый раз? Зарегистрироваться'}
                </button>

                {!isRegister &&
                    (sent ? (
                        <p className="text-center text-sm text-green-700 dark:text-green-400">
                            Письмо отправлено. Откройте ссылку из него на этом
                            же телефоне.
                        </p>
                    ) : (
                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className="text-muted w-full py-2 text-sm disabled:opacity-50"
                        >
                            Забыли пароль?
                        </button>
                    ))}

                {/* ссылка на политику должна быть видна до регистрации */}
                <button
                    onClick={() => navigate('/privacy')}
                    className="text-muted w-full py-2 text-xs underline"
                >
                    Политика конфиденциальности
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
