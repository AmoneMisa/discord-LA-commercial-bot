## 📌 1. Установка и настройка (Русский 🇷🇺)

#### 🔹 1.1 Установите Node.js и PostgreSQL

Скачайте и установите Node.js (рекомендуется LTS версия) с официального сайта.

Установите PostgreSQL (рекомендуется LTS версия) с официального сайта.
<br>

#### 🔹 1.2 Склонируйте репозиторий

В терминале выполните:

*git clone https://github.com/AmoneMisa/discord-LA-commercial-bot.git*

cd discord-bot
<br>

#### 🔹 1.3 Установите зависимости

*npm install*
<br>

#### 🔹 1.4 Настройте переменные окружения

Создайте файл .env в корне проекта и заполните его:

BOT_TOKEN – токен вашего бота (получить можно в Discord Developer Portal).

CLIENT_ID – ID приложения бота.

GUILD_ID – ID сервера, где бот будет работать.

DATABASE_URL – postgres://username:password@localhost:5432/discord_bot
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
### Что умеет бот:

#### 🎯 Основные команды
| **Команда**                                                         | **Описание** |
|---------------------------------------------------------------------|-------------|
| <span style="color: #4bf2e2;">/info</span> <span style="color: #d4d013;">@user</span>     | Показывает рейтинг, количество отзывов и кнопки для того, чтобы оставить отзыв|
| <span style="color: #4bf2e2;">/last_positive_reviews</span> <span style="color: #d4d013;">@user</span> | Показывает 5 последних положительных отзывов игрока, есть пагинация|
| <span style="color: #4bf2e2;">/last_negative_reviews</span> <span style="color: #d4d013;">@user</span> | Показывает 5 последних отрицательных отзывов игрока, есть пагинация|
| <span style="color: #4bf2e2;">/last_reviews</span> <span style="color: #d4d013;">@user</span>        | Показывает 5 последних отзывов игрока, есть пагинация|
| <span style="color: #4bf2e2;">/worst_sellers</span>                 | Топ-5 худших продавцов за 30 дней|
<br>

## 🔧 Административные команды
⚠️ Доступны только администраторам сервера!

| **Команда** | **Описание** |
|------------|-------------|
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">set_cooldown</span> <span style="color: #d4d013;"><минуты></span> | Устанавливает кулдаун на повторное голосование за одного и того же игрока. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">toggle_cooldown</span> <span style="color: #d4d013;"><enable/disable></span> | Включает или отключает кулдаун на голосование. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">toggle_self_voting</span> <span style="color: #d4d013;"><enable/disable></span> | Разрешает/запрещает оставлять отзывы самому себе. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">block_reviewer</span> <span style="color: #d4d013;">@user</span> | Запрещает пользователю оставлять отзывы другим. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">temp_block_reviewer</span> <span style="color: #d4d013;">@user <часы></span> | Запрещает пользователю временно оставлять отзывы другим. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">unblock_reviewer</span> <span style="color: #d4d013;">@user</span> | Разрешает пользователю снова оставлять отзывы другим. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">block_receiver</span> <span style="color: #d4d013;">@user</span> | Запрещает пользователю получать отзывы. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">temp_block_receiver</span> <span style="color: #d4d013;">@user <часы></span> | Запрещает пользователю временно получать отзывы. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">unblock_receiver</span> <span style="color: #d4d013;">@user</span> | Разрешает пользователю снова получать отзывы. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">reset_user_stats</span> <span style="color: #d4d013;">@user</span> | Сбрасывает статистику пользователя. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">reset_stats`</span> | Полностью сбрасывает ВСЮ статистику на сервере. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">set_leaderboard_channel</span> <span style="color: #d4d013;"><id></span> | Устанавливает отслеживаемый канал для списка топ-30 продавцов. Обновляется раз в сутки. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">set_rank_criteria</span> <span style="color: #d4d013;"><роль> <рейтинг> <мин.отзывов> <мин.положит.отзывов> <мин.отриц.отзывов></span> | Настраивает критерии выдачи ролей. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">set_rank_update_frequency</span> <span style="color: #d4d013;"><1d\|3d\|1w\|2w\|1m\|3m></span> | Определяет частоту обновления ролей. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">set_role_name</span> <span style="color: #d4d013;"><старое> <новое></span> | Переименовывает роль. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">create_role</span> <span style="color: #d4d013;"><название> <рейтинг> <мин.отзывов> <мин.положит.отзывов> <мин.отриц.отзывов></span> | Создаёт новую роль. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">delete_role</span> <span style="color: #d4d013;"><название></span> | Удаляет роль. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">view_reviews</span> <span style="color: #d4d013;">@user</span> | Просмотр отзывов пользователя с возможностью их удаления. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">remove_user</span> <span style="color: #d4d013;">@user</span> | Удаляет пользователя из статистики. |
| <span style="color: #4bf2e2;">/admin_settings</span> <span style="color: #4bd1f2;">remove_bots</span></span> | Удаляет всех ботов из базы данных. |