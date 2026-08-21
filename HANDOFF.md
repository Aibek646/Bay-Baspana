# BAY BASPANA — handoff для нового чата

> Скопируй весь этот файл в новый чат Claude Code первым сообщением.

---

## Как со мной работать (важно!)

**Формат обучения:** я фронтенд-разработчик, изучаю бэкенд. Приложение пишу **сам** — ты
объясняешь пошагово и даёшь код с разбором, я копирую и вникаю. **Не редактируй файлы сам**,
если я не попросил напрямую. Общение — **на русском**. Идём не спеша, по одному шагу,
с объяснением каждой новой конструкции.

---

## Что за проект

Приложение для друга, который продаёт квартиры в Казахстане (Алматы, Астана). Он путался,
где какая квартира, чей номер, продано или нет. Приложение хранит объекты и показывает их
двум аудиториям:

- **Админ** (друг + коллеги) — видит всё, создаёт/редактирует/удаляет.
- **Клиенты** — получают ссылку, видят только публичную часть каталога.

**Формат: PWA** (не Expo). Причина — клиентам нужно раздавать ссылкой, без App Store.
На Expo можно будет перейти позже, ядро на React переносится.

## Стек

- React 19 + TypeScript + Vite
- Tailwind v4 (плагин `@tailwindcss/vite`, подключение через `@import "tailwindcss"` в `index.css`)
- React Router (`react-router-dom`)
- Supabase (Postgres + Auth + Storage)
- Prettier + `prettier-plugin-tailwindcss`

Путь проекта: `~/Desktop/Paid Projects/bay-baspana`
IDE: **WebStorm** (не VS Code). Node v24. macOS.

---

## Структура

```
src/
├── main.tsx                    # BrowserRouter оборачивает App
├── App.tsx                     # маршруты
├── supabase.ts                 # клиент Supabase
├── useAuth.ts                  # свой хук: session, loading, isAdmin
├── types.ts                    # City, Apartment, DealType
├── index.css                   # @import tailwindcss + .no-scrollbar
├── components/
│   └── FormControl.tsx         # переиспользуемое поле формы
└── pages/
    ├── CitiesPage.tsx          # /
    ├── ApartmentsPage.tsx      # /city/:cityId
    ├── AddApartmentPage.tsx    # /city/:cityId/add
    ├── ApartmentDetailPage.tsx # /apartment/:id
    └── LoginPage.tsx           # /login
```

### `.env` (не в git)

```
VITE_SUPABASE_URL=https://necstofwqzthrttkfwca.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

---

## База данных (Supabase)

Колонки в **camelCase** и в кавычках — чтобы совпадать с TS-кодом.

### `cities`
`id text pk` · `name text not null`

### `apartments`
`id uuid pk default gen_random_uuid()` · `"cityId" text fk → cities(id)` · `address text`
· `"ownerName" text` · `whatsapp text` · `price bigint` · `"isSold" boolean` · `comment text`
· `photos text[]` · `"dealType" text check in ('cash','installment')` · `"downPayment" bigint`
· `"installmentMonths" int` · `"monthlyPayment" bigint` · `"mapUrl" text`
· `"createdAt" timestamptz default now()`

### Разделение данных — ключевая архитектура

Клиент **не должен** видеть точный адрес и контакты хозяина (иначе поедет сам / позвонит
напрямую в обход друга).

| 🔒 Только админ | 🌍 Публично |
|---|---|
| `ownerName`, `whatsapp` | `address` (сюда пишем **только район**, напр. «мкр. Самал-2») |
| `mapUrl` (тут точный адрес — ссылка 2ГИС/Яндекс) | `price`, `isSold`, `dealType` + поля рассрочки |
| `comment` (внутренние заметки) | `photos`, `cityId` |

Реализовано так:

```sql
create view apartments_public as
select id, "cityId", address, price, "isSold", "dealType",
       "downPayment", "installmentMonths", "monthlyPayment", photos, "createdAt"
from apartments;

grant select on apartments_public to anon, authenticated;

alter table apartments enable row level security;
-- 4 политики: select/insert/update/delete → to authenticated using (true)

alter table cities enable row level security;
create policy "anyone can read cities" on cities for select using (true);
```

Приложение выбирает источник:
```ts
const table = isAdmin ? 'apartments' : 'apartments_public';
```

Витрина помечена **UNRESTRICTED** в дашборде — это ожидаемо и намеренно.

### Storage

Bucket **`apartment-photos`**, публичный. Политики на `storage.objects`: insert/delete
только `to authenticated`. Загрузка → `crypto.randomUUID()` как имя файла → `getPublicUrl()`
→ ссылки пишутся в колонку `photos`.

### Auth

Аккаунты создаются **вручную** через Supabase → Authentication → Users (с Auto Confirm).
Регистрации в приложении нет намеренно. Вход по прямому адресу `/login` — кнопки «Вход»
для клиентов нет, чтобы не провоцировать.

---

## Что уже сделано ✅

- Просмотр: города → список квартир города → страница квартиры, всё из Supabase
- Счётчики объектов по городам
- Условия сделки: наличные / рассрочка (первоначальный взнос, срок, ежемесячный платёж)
- Кликабельный WhatsApp (`https://wa.me/<только цифры>`)
- Кнопка «Посмотреть на карте» (`mapUrl`)
- Создание квартиры: форма на `FormControl`, поля рассрочки появляются условно
- Загрузка нескольких фото с телефона (`accept="image/*"` — камера/галерея), превью до
  загрузки, удаление из выбранных
- Галерея на странице квартиры: горизонтальный snap-скролл, счётчик, точки-индикаторы
- Полноэкранный просмотр фото по тапу (`object-contain`, открывается на текущем кадре
  через `useRef` + `scrollLeft`)
- Вход/выход, бейдж «Режим управления», приватные блоки и кнопка «+» только для админа
- RLS + публичная витрина

## Что осталось ⬜

1. **Редактирование квартиры** — форма как в Add, но с предзаполнением; `update` вместо
   `insert`. Логично вынести общую форму в переиспользуемый компонент.
2. **Удаление квартиры** — с подтверждением; заодно удалять фото из Storage.
3. **Управление фото при редактировании** — добавить/удалить у существующей квартиры.
4. **PWA** — манифест, иконки, `vite-plugin-pwa`, чтобы ставилось на домашний экран айфона.
5. **Публикация** — Vercel/Netlify, прописать переменные окружения.
6. **Опционально:** TanStack Query (договорились взять на этапе CRUD, чтобы убрать
   ручной `useState`/`useEffect` и авто-обновлять списки), валидация формы
   (возможно react-hook-form — я его знаю по другому проекту).

---

## Договорённости и грабли (чтобы не повторять)

- **Нажатия кнопок:** стиль как `TouchableOpacity` в RN — `active:opacity-70` +
  кастомная тень `shadow-[0_4px_14px_rgba(0,0,0,0.10)]`, при нажатии
  `active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]`, `transition-all duration-200`.
- **Prettier в WebStorm:** на ⌘S не срабатывает (Save All висит на ⌥⌘S). Рабочий путь —
  `npm run format`. Не залипать на этом.
- **Приватные поля клиенту не приходят вообще** — поэтому любой вызов метода на них
  требует `?.` (`apt.whatsapp?.replace(...)`). В `types.ts` они помечены `?`.
- **Схема-кэш Supabase:** после `alter table` бывает ошибка «Could not find the column in
  the schema cache» → `notify pgrst, 'reload schema';`
- **Форма:** состояние — один объект `Record<string, string | boolean>` + `setField`
  со спредом. Компромисс по типам осознанный.
- **Порядок в компоненте:** хуки роутера → useAuth → useState/useRef → useEffect →
  ранние return → вычисления → разметка.
- **Риск, о котором знаем:** защита точного адреса держится на дисциплине — в поле
  «Адрес» должен вписываться только район. В форме подписи с 🔒 напоминают об этом.
