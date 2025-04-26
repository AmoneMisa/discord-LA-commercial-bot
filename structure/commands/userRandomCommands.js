import {SlashCommandBuilder} from "discord.js";

export default [
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
        ),
    new SlashCommandBuilder()
        .setName("pick_from_channel")
        .setDescription("🎯 Выбрать случайных игроков из текущего текстового канала")
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Количество игроков для выбора")
                .setMinValue(1)
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName("pick_online_from_channel")
        .setDescription("🟢 Выбрать случайных онлайн игроков из текущего текстового канала")
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Количество игроков для выбора")
                .setMinValue(1)
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName("pick_from_mentions")
        .setDescription("📌 Выбрать случайных игроков среди упомянутых в сообщении")
        .addStringOption(option =>
            option.setName("message_id")
                .setDescription("ID сообщения с упоминаниями")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Количество игроков для выбора")
                .setMinValue(1)
                .setRequired(true))
]