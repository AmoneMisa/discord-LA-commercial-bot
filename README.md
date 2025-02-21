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

! Запустите миграции командой !<br>

*npm run migrate:up*<br>

Если нужно откатить все миграции:

*npm run migrate:down*

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

## А что дальше? ##

Бот по личному усмотрению разрабатывается дальше, так как есть желание привнести ещё несколько фич в его арсенал.
На данный момент реализованы, но не в публичном доступе:
### 1. Система подписок ###
Игрок-покупатель теперь может через спец. команды подписаться на уведомления от конкретного игрока-продавца, когда тот собирает группу на интересующий покупателя рейд. При подписке, когда продавец отправляет сообщение в выбранную администратором категорию для продаж, покупатель получает уведомление в личные сообщения о том, что продавец начал сбор группы.
У покупателя под сообщением будет контрол-кнопка, которая активна в течении 5 минут, после сообщение изменяется на "Время для ответа истекло", это сделано с целью анти-спама. Так же, контрол будет недоступен после первого успешного взаимодействия.
При нажатии на контрол, покупатель увидит модальное окно с полем "введите ник". При отправке модального окна, продавец получает уведомление с дискорд-айди покупателя, его ответом и информацией, на какой рейд претендует покупатель. 
У продавца так же есть два контрола "Принять" и "Отклонить". При нажатии "отклонить", контролы пропадают и покупатель получает уведомление о том, что продавец отказал ему в покупке. 
При нажатии на "Принять", у продавца появляется модальное окно с просьбой ввести название лобби. Информация из модального окна отправляется покупателю.

### 2. Система профилей ###
Система создана для упрощения получения и предоставления информации об игроках без нужды перехода на внешние сайты. 
Игроки могут указать свои: имя, ник основного персонажа, выбрать в качестве кого они находятся на сервере (продавец, покупатель, нейтрал), выбрать опыт рейдов и опыт рейдов для продаж.
При указании ника основного персонажа, система подтягивает всех персонажей выше 1660 ГСа и отображает в профиле в виде: Класс - Ник - ГС.
Игроки так же имеют возможность редактировать поля в своём профиле и просматривать профили других игроков.

### 3. Система обмена предметами ###
(WIP)
Так как Lost Ark RU официально и неофициально не имеет API игры, была сделана система обмена предметами.
Эта система полу-мануальная (в большей степени мануальная, по причине отсутствия API).
Она позволяет игроку заполнить свой "инвентарь" определённым количеством предметов (на данный момент поддерживаются такие предметы: Ожерелье, Серьга, Кольцо, Самоцвет).
Если во время успешного заполнения в системе найдётся другой игрок, который выставил или запросил лот, который подходит под параметры, оба игрока получат уведомление о матче с возможностью отклонить сделку.
В случае, если игрок принял сделку и для неё не требуется совершать дополнительных действий с модальным окном, оба игрока автоматически обмениваются контактами друг друга.
Каждый лот имеет жизнь в трое полных суток. Игрок может продлить лот, нажав по кнопке продления в специальном уведомлении, которое приходит за 2 часа до окончания времени жизни лота.


Планы на будущее:

### 1. Система быстрого ответа ###
На базе профилей создать систему быстрого ответа.
Эта система должна смотреть определённую категорию и отправлять сообщение-ответ с кнопками "хочу в рейд" и "хочу купить".
Хочу купить будет работать аналогично системе подписок. На "хочу в рейд" пользователю, который собирает рейд, будет приходить уведомление в личные сообщения с профилем игрока.
Если профиль не заполнен и \ или отсутствует информация об основном персонаже, данный функционал для "хочу в рейд" будет недоступен, так как альтернативного способа получить информацию о персонажах, я не имею.

### 2. Система достижений ###
Периодически на сервере проходят разные ивенты. На данный момент, один из способов поощрить игрока - выдача роли. Проблема в том, что иногда игроки хотят поощрение, но, не хотят, к примеру, чтобы у них менялся цвет роли или иконка.
Планируется добавить возможность загружать иконки-изображения для достижений, давать им названия и срок действия.
Достижения будут отображаться в профиле игрока в виде маленьких иконок. 
Достижения можно будет как выдавать вручную какой-то конкретной роли (для старых достижений), так и автоматически, при упоминании конкретных игроков в выбранном сообщении о наградах.