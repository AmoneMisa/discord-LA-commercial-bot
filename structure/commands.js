import {SlashCommandBuilder, PermissionFlagsBits} from "discord.js";

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
        .setName('top_sellers')
        .setDescription('Пять лучших продавцов'),
    new SlashCommandBuilder()
        .setName('worst_sellers')
        .setDescription('Пять худших продавцов'),
    new SlashCommandBuilder()
        .setName('admin_settings')
        .setDescription('Настройки администратора')
        .addSubcommand(subcommand =>
            subcommand.setName('set_cooldown')
                .setDescription('Установить кулдаун на голосование (в минутах)')
                .addIntegerOption(option => option.setName('minutes').setDescription('Время в минутах').setRequired(true))
        )
        .addSubcommand(subcommand =>
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
                .setDescription('Полностью обнулить статистику (с подтверждением)')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('reset_user_stats')
                .setDescription('Обнулить статистику конкретного пользователя')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('add_rating')
                .setDescription('Добавить рейтинг пользователю')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
                .addIntegerOption(option => option.setName('points').setDescription('Количество баллов').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('decrease_rating')
                .setDescription('Снизить рейтинг пользователю')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
                .addIntegerOption(option => option.setName('points').setDescription('Количество баллов').setRequired(true))
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
                .addIntegerOption(option => option.setName('hours').setDescription('Количество часов').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('temp_block_reviewer')
                .setDescription('Временно заблокировать возможность оставлять отзывы')
                .addUserOption(option => option.setName('user').setDescription('Выберите пользователя').setRequired(true))
                .addIntegerOption(option => option.setName('hours').setDescription('Количество часов').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('set_rank_criteria')
                .setDescription('Установить критерии для ролей')
                .addIntegerOption(option => option.setName('top_seller').setDescription('Рейтинг для "Топ-продавец"').setRequired(true))
                .addIntegerOption(option => option.setName('great_seller').setDescription('Рейтинг для "Отличный продавец"').setRequired(true))
                .addIntegerOption(option => option.setName('good_seller').setDescription('Рейтинг для "Хороший продавец"').setRequired(true))
                .addIntegerOption(option => option.setName('seller').setDescription('Рейтинг для "Продавец"').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('set_rank_update_frequency')
                .setDescription('Настроить частоту обновления ролей')
                .addStringOption(option =>
                    option.setName('frequency')
                        .setDescription('Частота обновления')
                        .setRequired(true)
                        .addChoices(
                            { name: '1 день', value: '1d' },
                            { name: '3 дня', value: '3d' },
                            { name: 'неделя', value: '1w' },
                            { name: '2 недели', value: '2w' },
                            { name: 'месяц', value: '1m' },
                            { name: 'квартал', value: '3m' }
                        )
                )
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
                .addIntegerOption(option => option.setName('required_rating').setDescription('Минимальный рейтинг').setRequired(true))
                .addIntegerOption(option => option.setName('min_reviews').setDescription('Минимум отзывов').setRequired(true))
                .addIntegerOption(option => option.setName('min_positive_reviews').setDescription('Минимум положительных отзывов').setRequired(true))
                .addIntegerOption(option => option.setName('min_negative_reviews').setDescription('Максимум негативных отзывов').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('delete_role')
                .setDescription('Удалить роль продавца')
                .addStringOption(option => option.setName('name').setDescription('Название роли').setRequired(true))
        )
];
