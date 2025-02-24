import {SlashCommandBuilder} from "discord.js";

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
        .setName("review_notifications_toggle")
        .setDescription("Включить или отключить уведомления о новых отзывах")
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Включить (true) или отключить (false) уведомления")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('auction_house')
        .setDescription('Аукционный дом'),
    new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Инвентарь')
        .addSubcommand(subcommand =>
            subcommand.setName('create')
                .setDescription('Создать лот')
                .addStringOption(option => option
                    .setName('item')
                    .setDescription('Предмет')
                    .setRequired(true)
                    .setAutocomplete(true)
                ).addStringOption(option => option
                .setName('type')
                .setDescription('Тип сделки')
                .setRequired(true)
                .addChoices(
                    {name: 'Обмен', value: 'WTT'},
                    {name: 'Продажа', value: 'WTS'},
                    {name: 'Покупка', value: 'WTB'}
                )
            )
        ).addSubcommand(subcommand =>
        subcommand.setName('list')
            .setDescription('Список лотов'))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Список лотов')),
    new SlashCommandBuilder()
        .setName("get_codex")
        .setDescription("🔍 Получить информацию из кодекса")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Выберите категорию")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Выберите название")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    new SlashCommandBuilder()
        .setName("flip_coin")
        .setDescription("🪙 Подбросить монетку (Орел или Решка)"),
    new SlashCommandBuilder()
        .setName("roll_dice")
        .setDescription("🎲 Бросить кубик")
        .addIntegerOption(option =>
            option.setName("sides")
                .setDescription("Количество граней (по умолчанию 6)")
                .setRequired(false)
                .setMinValue(2)
        ),
    new SlashCommandBuilder()
        .setName("random_number")
        .setDescription("🔢 Сгенерировать случайное число")
        .addIntegerOption(option =>
            option.setName("min")
                .setDescription("Минимальное значение")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("max")
                .setDescription("Максимальное значение")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("pick_random")
        .setDescription("🎯 Выбрать случайного игрока")
        .addStringOption(option =>
            option.setName("participants")
                .setDescription("Список участников через запятую")
                .setRequired(true)
        )
]