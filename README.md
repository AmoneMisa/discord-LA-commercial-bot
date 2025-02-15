## 📌 1. Установка и настройка (Русский 🇷🇺)

#### 🔹 1.1 Установите Node.js и PostgreSQL

Скачайте и установите Node.js (рекомендуется LTS версия) с официального сайта.

Установите PostgreSQL (рекомендуется LTS версия) с официального сайта.

Создайте базу данных в PostgreSQL:

CREATE DATABASE discord_bot;
<br><br>

#### 🔹 1.2 Склонируйте репозиторий
<br>
В терминале выполните:

*git clone https://github.com/your-repository/discord-bot.git*

cd discord-bot

<br>

#### 🔹 1.3 Установите зависимости

*npm install*

<br>

#### 🔹 1.4 Настройте переменные окружения

Создайте файл .env в корне проекта и заполните его:

BOT_TOKEN=your-bot-token

CLIENT_ID=your-client-id

GUILD_ID=your-guild-id

DATABASE_URL=postgres://username:password@localhost:5432/discord_bot

BOT_TOKEN – токен вашего бота (получить можно в Discord Developer Portal).

CLIENT_ID – ID приложения бота.

GUILD_ID – ID сервера, где бот будет работать.

DATABASE_URL – подключение к вашей базе данных PostgreSQL.
<br>
<br>

#### 🔹 1.5 Запустите бота

*npm start*

Если вы хотите автоматически перезапускать бота при изменениях, используйте:

*npm run dev*

<br>

#### 🔹 1.6 Регистрация команд

Если бот не отображает команды, выполните:

*node registerCommands.js*
<br>
_________________________

Что умеет бот:
📌 1. Установка и настройка (Русский 🇷🇺) <br><br>

🔹 1.1 Установите Node.js и PostgreSQL

Скачайте и установите **Node.js** (рекомендуется LTS версия) с официального сайта.

Установите **PostgreSQL** (рекомендуется LTS версия) с официального сайта.

Создайте базу данных в PostgreSQL:

*CREATE DATABASE discord_bot;*

<br>

🔹 1.2 Склонируйте репозиторий

В терминале выполните:

git clone https://github.com/your-repository/discord-bot.git

cd discord-bot
<br>

🔹 1.3 Установите зависимости

*npm install*

<br>

🔹 1.4 Настройте переменные окружения

Создайте файл .env в корне проекта и заполните его:

**BOT_TOKEN**=your-bot-token

**CLIENT_ID**=your-client-id

**GUILD_ID**=your-guild-id

**DATABASE_URL**=postgres://username:password@localhost:5432/discord_bot

BOT_TOKEN – токен вашего бота (получить можно в Discord Developer Portal).

CLIENT_ID – ID приложения бота.

GUILD_ID – ID сервера, где бот будет работать.

DATABASE_URL – подключение к вашей базе данных PostgreSQL.

<br>

🔹 1.5 Запустите бота

*npm start*

Если вы хотите автоматически перезапускать бота при изменениях, используйте:

*npm run dev*

<br>

🔹 1.6 Регистрация команд

Если бот не отображает команды, выполните:

*node registerCommands.js*

_________________________

### Что умеет бот:

#### 🎯 Основные команды
**/info @user**	- Показывает рейтинг, количество отзывов и кнопки для того, чтобы оставить отзыв

**/last_positive_reviews @user** - Показывает 5 последних положительных отзывов игрока, есть пагинация

**/last_negative_reviews @user** - Показывает 5 последних отрицательных отзывов игрока, есть пагинация

**/last_reviews @user** - Показывает 5 последних отзывов игрока, есть пагинация

**/top_sellers** - Топ-5 лучших продавцов за 14 дней

**/worst_sellers** - Топ-5 худших продавцов за 14 дней

<br>

#### 🔧 Административные команды
⚠️ Доступны только администраторам сервера!

**/admin_settings set_cooldown <минуты>** – Устанавливает кулдаун на повторное голосование за одного и того же игрока.<br>

**/admin_settings toggle_cooldown <enable/disable>** – Включает или отключает куллдаун на голосование.<br>

**/admin_settings toggle_self_voting <enable/disable>** – Разрешает/запрещает оставлять отзывы самому себе.<br>

**/admin_settings block_reviewer @user** – Запрещает пользователю оставлять отзывы другим.<br>

**/admin_settings temp_block_reviewer @user <часы>** – Запрещает пользователю временно оставлять отзывы другим.<br>

**/admin_settings unblock_reviewer @user** – Разрешает пользователю снова оставлять отзывы другим.<br>

**/admin_settings block_receiver @user** – Запрещает пользователю получать отзывы.<br>

**/admin_settings temp_block_receiver @user <часы>** – Запрещает пользователю временно получать отзывы.<br>

**/admin_settings unblock_receiver @user** – Разрешает пользователю снова получать отзывы.<br>

**/admin_settings reset_user_stats @user** – Сбрасывает статистику пользователя.<br>

**/admin_settings reset_stats** – Полностью сбрасывает ВСЮ статистику на сервере.<br>

**/admin_settings set_leaderboard_channel <id>** - Устанавливает отслеживаемый канал для списка топ 30 продавцов. Обновляется раз в сутки.<br>

**/admin_settings set_rank_criteria <роль> <рейтинг> <мин.отзывов> <мин.положит.отзывов> <мин.отриц.отзывов>** – Настраивает критерии выдачи ролей.<br>

**/admin_settings set_rank_update_frequency <1d|3d|1w|2w|1m|3m>** – Определяет частоту обновления ролей.<br>

**/admin_settings set_role_name <старое> <новое>** – Переименовывает роль.<br>

**/admin_settings create_role <название> <рейтинг> <мин.отзывов> <мин.положит.отзывов> <мин.отриц.отзывов>** – Создаёт новую роль.
<br>

**/admin_settings delete_role <название>** – Удаляет роль<br>

**/admin_settings view_reviews @user** – Просмотр отзывов пользователя с возможностью их удаления<br>

**/admin_settings remove_user @user** – Удаляет пользователя из статистики
