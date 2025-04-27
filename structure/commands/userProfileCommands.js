import {SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Анкета игрока')
        .addSubcommand(subcommand =>
            subcommand.setName('fill')
                .setDescription('Заполнить анкету')
                .addStringOption(option =>
                    option.setName('main_nickname')
                        .setDescription('Ник основы в оружейной, регистрозависимо')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('role')
                        .setDescription('Выберите роль')
                        .setRequired(true)
                        .addChoices(
                            {name: 'Покупатель', value: 'покупатель'},
                            {name: 'Продавец', value: 'продавец'},
                            {name: 'Нейтрал', value: 'нейтрал'}
                        ))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Имя')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('prime_start')
                        .setDescription('Прайм с (формат 00:00)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('prime_end')
                        .setDescription('Прайм до (формат 00:00)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('sales_experience')
                        .setDescription('Опыт в продажах')
                        .setRequired(false)
                )).addSubcommand(subcommand =>
        subcommand.setName('edit')
            .setDescription('Редактировать анкету')
            .addStringOption(option =>
                option.setName('field')
                    .setDescription('Выберите поле для редактирования')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Имя', value: 'name'},
                        {name: 'Ник в оружейной (регистрозависимо)', value: 'main_nickname'},
                        {name: 'Роль (нейтрал, продавец, покупатель)', value: 'role'},
                        {name: 'Прайм с (формат 00:00)', value: 'prime_start'},
                        {name: 'Прайм до (формат 00:00)', value: 'prime_end'},
                        {name: 'Опыт в продажах', value: 'sales_experience'}
                    ))
            .addStringOption(option =>
                option.setName('value')
                    .setDescription('Новое значение')
                    .setRequired(true))
    ).addSubcommand(subcommand =>
        subcommand.setName('view').setDescription('Анкета пользователя')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('Выберите пользователя')
                    .setRequired(true))),
    new SlashCommandBuilder()
        .setName('profile_set_style')
        .setDescription('Выбрать цвета для анкеты')
        .addStringOption(option =>
        option.setName("background")
            .setDescription("Цвет фона (строго hex-формат #413241 или 413241)")).addStringOption(option =>
        option.setName("main_text")
            .setDescription("Цвет основного текста (строго hex-формат #FFFFFF или FFFFFF)")).addStringOption(option =>
        option.setName("secondary_text")
            .setDescription("Цвет второстепенного текста (строго hex-формат #ffe176 или ffe176)"))
        .addStringOption(option =>
        option.setName("separator")
            .setDescription("Цвет линий (строго hex-формат #FFFFFF или FFFFFF)")).addStringOption(option =>
        option.setName("text_background")
            .setDescription("Цвет фона текста (строго hex-формат #2f242f или 2f242f)")).addStringOption(option =>
        option.setName("border")
            .setDescription("Цвет рамки (строго hex-формат #604b60 или 604b60)")),
    new SlashCommandBuilder()
        .setName("achievement_info")
        .setDescription("🔍 Получить информацию о достижении.")
        .addStringOption(option =>
            option.setName("achievement")
                .setDescription("Название достижения")
                .setRequired(true)
                .setAutocomplete(true)),
]