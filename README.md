📌 1. Установка и настройка (Русский 🇷🇺)

🔹 1.1 Установите Node.js и PostgreSQL

Скачайте и установите Node.js (рекомендуется LTS версия) с официального сайта.

Установите PostgreSQL (рекомендуется LTS версия) с официального сайта.

Создайте базу данных в PostgreSQL:

CREATE DATABASE discord_bot;


🔹 1.2 Склонируйте репозиторий

В терминале выполните:

git clone https://github.com/your-repository/discord-bot.git

cd discord-bot


🔹 1.3 Установите зависимости

npm install


🔹 1.4 Настройте переменные окружения

Создайте файл .env в корне проекта и заполните его:

BOT_TOKEN=your-bot-token

CLIENT_ID=your-client-id

GUILD_ID=your-guild-id

DATABASE_URL=postgres://username:password@localhost:5432/discord_bot

BOT_TOKEN – токен вашего бота (получить можно в Discord Developer Portal).

CLIENT_ID – ID приложения бота.

GUILD_ID – ID сервера, где бот будет работать.

DATABASE_URL – подключение к вашей базе данных PostgreSQL.


🔹 1.5 Запустите бота

npm start

Если вы хотите автоматически перезапускать бота при изменениях, используйте:

npm run dev


🔹 1.6 Регистрация команд

Если бот не отображает команды, выполните:

node registerCommands.js


🔹 1.7 Готово! 🎉

Теперь ваш бот работает в Discord! 🚀
