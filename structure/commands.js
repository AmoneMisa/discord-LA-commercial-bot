import {SlashCommandBuilder, PermissionFlagsBits} from "discord.js";
import pkg from "pg";

const {Pool} = pkg;
const pool = new Pool({connectionString: process.env.DATABASE_URL});

export default [
    new SlashCommandBuilder()
        .setName('info')
        .setDescription('Получить информацию о пользователе')
        .addUserOption(option => option.setName('member').setDescription('Выберите участника').setRequired(true)),
    new SlashCommandBuilder()
        .setName('last_positive_reviews')
        .setDescription('Пять последних положительных отзывов')
        .addUserOption(option => option.setName('member').setDescription('Выберите участника').setRequired(true)),
    new SlashCommandBuilder()
        .setName('last_negative_reviews')
        .setDescription('Пять последних отрицательных отзывов')
        .addUserOption(option => option.setName('member').setDescription('Выберите участника').setRequired(true)),
    new SlashCommandBuilder()
        .setName('last_reviews')
        .setDescription('Пять последних отзывов')
        .addUserOption(option => option.setName('member').setDescription('Выберите участника').setRequired(true)),
    new SlashCommandBuilder()
        .setName('worst_sellers')
        .setDescription('Пять худших продавцов'),
    new SlashCommandBuilder()
        .setName('adm_ranks')
        .setDescription('Административные настройки рейтинга')
        .addSubcommand(subcommand =>
            subcommand.setName('set_cooldown')
                .setDescription('Установить кулдаун на голосование (в минутах)')
                .addIntegerOption(option => option.setName('minutes').setMinValue(1).setDescription('Время в минутах').setRequired(true))
        ).addSubcommand(subcommand =>
        subcommand.setName('toggle_self_voting')
            .setDescription('Разрешить или запретить голосование за себя')
            .addBooleanOption(option => option.setName('enabled').setDescription('true - разрешить, false - запретить').setRequired(true))
    )
        .addSubcommand(subcommand =>
            subcommand.setName('toggle_cooldown')
                .setDescription('Включить или выключить кулдаун')
                .addBooleanOption(option => option.setName('enabled').setDescription('true - включить, false - выключить').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('block_reviewer')
                .setDescription('Запретить пользователю оставлять отзывы')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('block_receiver')
                .setDescription('Запретить пользователю получать отзывы')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove_user')
                .setDescription('Удалить пользователя из статистики')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('reset_stats')
                .setDescription('Полностью обнулить статистику')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('reset_user_stats')
                .setDescription('Обнулить статистику конкретного пользователя')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('view_reviews')
                .setDescription('Просмотреть отзывы пользователя')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('unblock_receiver')
                .setDescription('Разблокировать возможность получать отзывы')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('unblock_reviewer')
                .setDescription('Разблокировать возможность оставлять отзывы')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('temp_block_receiver')
                .setDescription('Временно заблокировать получение отзывов')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
                .addIntegerOption(option => option.setName('hours').setMinValue(1).setDescription('Количество часов').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('temp_block_reviewer')
                .setDescription('Временно заблокировать возможность оставлять отзывы')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
                .addIntegerOption(option => option.setName('hours').setMinValue(1).setDescription('Количество часов').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('set_rank_criteria')
                .setDescription('Настроить критерии для ролей')
                .addStringOption(option => option.setName('role_name').setDescription('Название роли').setRequired(true))
                .addIntegerOption(option => option.setName('required_rating').setMaxValue(100).setMinValue(0).setDescription('Необходимый рейтинг').setRequired(true))
                .addIntegerOption(option => option.setName('min_reviews').setMinValue(0).setDescription('Минимум отзывов').setRequired(true))
                .addIntegerOption(option => option.setName('min_positive_reviews').setMinValue(0).setDescription('Минимум положительных').setRequired(true))
                .addIntegerOption(option => option.setName('min_negative_reviews').setMinValue(0).setDescription('Максимум отрицательных').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('set_rank_update_frequency')
                .setDescription('Настроить частоту обновления ролей')
                .addStringOption(option => option.setName('frequency').setDescription('Частота').setRequired(true)
                    .addChoices(
                        {name: 'Каждый день', value: '1d'},
                        {name: 'Раз в 3 дня', value: '3d'},
                        {name: 'Раз в неделю', value: '1w'},
                        {name: 'Раз в 2 недели', value: '2w'},
                        {name: 'Раз в месяц', value: '1m'},
                        {name: 'Раз в квартал', value: '3m'}
                    ))
        ).addSubcommand(subcommand =>
        subcommand.setName('set_role_name')
            .setDescription('Изменить название существующей роли')
            .addStringOption(option =>
                option.setName('old_name')
                    .setDescription('Текущее название роли')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('new_name')
                    .setDescription('Новое название роли')
                    .setRequired(true))
    )
        .addSubcommand(subcommand =>
            subcommand.setName('create_role')
                .setDescription('Создать новую роль для продавцов')
                .addStringOption(option => option.setName('name').setDescription('Название роли').setRequired(true))
                .addIntegerOption(option => option.setName('required_rating').setMaxValue(100).setMinValue(0).setDescription('Минимальный рейтинг').setRequired(true))
                .addIntegerOption(option => option.setName('min_reviews').setMinValue(0).setDescription('Минимум отзывов').setRequired(true))
                .addIntegerOption(option => option.setName('min_positive_reviews').setMinValue(0).setDescription('Минимум положительных отзывов').setRequired(true))
                .addIntegerOption(option => option.setName('min_negative_reviews').setMinValue(0).setDescription('Максимум негативных отзывов').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('delete_role')
                .setDescription('Удалить роль продавца')
                .addStringOption(option => option.setName('name').setDescription('Название роли').setRequired(true))
        ),
    new SlashCommandBuilder()
        .setName('adm_settings')
        .setDescription('Настройки администратора')
        .addSubcommand(subcommand =>
            subcommand.setName('remove_bots')
                .setDescription('Удаляет всех ботов из базы данных')
        ).addSubcommand(subcommand =>
        subcommand.setName('set_leaderboard_channel')
            .setDescription('Устанавливает канал для таблицы лидеров')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Выберите текстовый канал')
                    .setRequired(true)
            )
    ),
    new SlashCommandBuilder()
        .setName('adm_subscription')
        .setDescription('Управление правилами подписок')
        .addSubcommand(subcommand =>
            subcommand.setName('block_subscription')
                .setDescription('Запрещает пользователю подписываться на других')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Выберите пользователя')
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
        subcommand.setName('temp_block_subscription')
            .setDescription('Временно запрещает пользователю подписываться (в часах)')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('Выберите пользователя')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName('hours')
                    .setDescription('Количество часов')
                    .setRequired(true)
            )
    ).addSubcommand(subcommand =>
        subcommand.setName('unblock_subscription')
            .setDescription('Разрешает пользователю снова подписываться')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('Выберите пользователя')
                    .setRequired(true)
            )
    ).addSubcommand(subcommand =>
        subcommand.setName('edit_raids')
            .setDescription('Редактирование списка доступных рейдов')
    ).addSubcommand(subcommand =>
        subcommand.setName('set_raid_role')
            .setDescription('Настроить соответствие между рейдом и ролью')
            .addStringOption(option =>
                option.setName('raid')
                    .setDescription('Название рейда')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('Роль, соответствующая рейду')
                    .setRequired(true)
            )
    ).addSubcommand(subcommand =>
        subcommand.setName('set_bus_category')
            .setDescription('Установить категорию для отслеживания рейдов')
            .addChannelOption(option =>
                option.setName('category')
                    .setDescription('Категория, в которой продают рейды')
                    .setRequired(true)
            )
    ),
    new SlashCommandBuilder()
        .setName('auction_house')
        .setDescription('Аукционный дом'),
    new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Управление подписками')
        .addSubcommand(subcommand =>
            subcommand
                .setName('to_buy')
                .setDescription('Подписка на уведомления о рейдах от конкретного продавца')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Выберите продавца')
                        .setRequired(true)
                ).addStringOption(option =>
                option.setName('raids')
                    .setDescription('Выберите рейды')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Камен 1.0', value: 'Камен 1.0'},
                        {name: 'Бехемос', value: 'Бехемос'},
                        {name: 'Ехидна', value: 'Ехидна'},
                        {name: 'Эгир', value: 'Эгир'},
                        {name: 'Аврельсуд', value: 'Аврельсуд'}
                    )
            )
        ).addSubcommand(subcommand =>
        subcommand.setName('list')
            .setDescription('Просмотр списка ваших фаворитов'))
        .addSubcommand(subcommand =>
            subcommand.setName('unsubscribe')
                .setDescription('Отписка от фаворита')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Выберите продавца')
                        .setRequired(true)
                )
        ),
    new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Инвентарь')
        .addSubcommand(subcommand =>
            subcommand.setName('wtt')
                .setDescription('Добавить предмет на обмен')
                .addStringOption(option => option
                    .setName('offer_item')
                    .setDescription('Предлагаемый предмет')
                    .setRequired(true)
                    .setAutocomplete(true)
                ).addStringOption(option =>
                option.setName('request_item')
                    .setDescription('Желаемый предмет')
                    .setRequired(true)
                    .setAutocomplete(true))
                .addIntegerOption(option =>
                    option.setName('offer_amount').setMinValue(1).setDescription('Количество').setMaxValue(9999).setRequired(true))
                .addIntegerOption(option =>
                    option.setName('request_amount').setMinValue(1).setMaxValue(9999).setDescription('Количество желаемого').setRequired(true))
                .addStringOption(option =>
                    option.setName('server').setDescription('Сервер').setRequired(true)
                        .addChoices(
                            {name: 'Кратос', value: 'Кратос'},
                            {name: 'Альдеран', value: 'Альдеран'},
                            {name: 'Альдеран, Кратос', value: 'Альдеран, Кратос'}
                        ))
                .addIntegerOption(option =>
                    option.setName('offer_level').setDescription('Уровень предмета').setRequired(false))
                .addIntegerOption(option =>
                    option.setName('request_level').setDescription('Уровень предмета').setRequired(false))
        ).addSubcommand(subcommand =>
        subcommand.setName('wtb')
            .setDescription('Запрос на покупку предмета')
            .addStringOption(option => option
                .setName('request_item')
                .setDescription('Желаемый предмет')
                .setRequired(true)
                .setAutocomplete(true))
            .addIntegerOption(option =>
                option.setName('request_amount').setMinValue(1).setDescription('Количество')
                    .setMaxValue(9999).setRequired(true))
            .addIntegerOption(option =>
                option.setName('request_price').setMinValue(1)
                    .setDescription('Предлагаемая стоимость (в тысячах)').setRequired(true))
            .addBooleanOption(option =>
                option.setName('negotiable').setDescription('Торг').setRequired(true))
            .addStringOption(option =>
                option.setName('server').setDescription('Сервер').setRequired(true)
                    .addChoices(
                        {name: 'Кратос', value: 'Кратос'},
                        {name: 'Альдеран', value: 'Альдеран'},
                        {name: 'Альдеран, Кратос', value: 'Альдеран, Кратос'}
                    )).addIntegerOption(option =>
            option.setName('request_level').setDescription('Уровень предмета').setRequired(false))
    ).addSubcommand(subcommand =>
        subcommand.setName('wts')
            .setDescription('Добавить предмет на продажу')
            .addStringOption(option =>
                option.setName('offer_item')
                    .setDescription('Продаваемый предмет')
                    .setRequired(true)
                    .setAutocomplete(true))
            .addIntegerOption(option =>
                option.setName('offer_amount').setMinValue(1).setDescription('Количество').setMaxValue(9999).setRequired(true))
            .addIntegerOption(option =>
                option.setName('offer_price').setMinValue(1).setDescription('Стоимость (в тысячах)').setRequired(true))
            .addBooleanOption(option =>
                option.setName('negotiable').setDescription('Торг').setRequired(true))
            .addStringOption(option =>
                option.setName('server').setDescription('Сервер').setRequired(true)
                    .addChoices(
                        {name: 'Кратос', value: 'Кратос'},
                        {name: 'Альдеран', value: 'Альдеран'},
                        {name: 'Альдеран, Кратос', value: 'Альдеран, Кратос'}
                    )).addIntegerOption(option =>
            option.setName('offer_level').setDescription('Уровень предмета').setRequired(false))
    ).addSubcommand(subcommand =>
        subcommand.setName('list')
            .setDescription('Список лотов')
    )
];