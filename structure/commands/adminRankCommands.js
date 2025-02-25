import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName('adm_ranks')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Админ настройки рейтинга')
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
        )
        .addSubcommand(subcommand =>
        subcommand.setName('set_leaderboard_channel')
            .setDescription('Устанавливает канал для таблицы лидеров')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Выберите текстовый канал')
                    .setRequired(true)
            ))
]