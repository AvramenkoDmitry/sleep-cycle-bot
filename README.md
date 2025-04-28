# Sleep Cycle Bot (TypeScript)

Простой Telegram-бот для трекинга сна.

## Запуск

1. Установить зависимости:

```
npm install
```

2. Создать `.env` файл на основе `.env.example`:

```
cp .env.example .env
```

И вставить ваш токен бота.

3. Запуск бота в режиме разработки:

```
npm run dev
```

4. Компиляция и запуск:

```
npm run build
npm start
```

## Структура
- `src/bot.ts` — код бота
- `dist/` — компилированные файлы