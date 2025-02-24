import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName("adm_bet_create")
        .setDescription("🎲 Создать событие для ставок")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName("name")
                .setDescription("Название события")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("description")
                .setDescription("Описание события")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("start_time")
                .setDescription("Дата и время начала (YYYY-MM-DD HH:MM)")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("end_time")
                .setDescription("Дата и время завершения (YYYY-MM-DD HH:MM)")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("adm_bet_delete")
        .setDescription("❌ Удалить событие ставок")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName("event_id")
                .setDescription("ID события")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("adm_bet_channel")
        .setDescription("📢 Выбрать канал для уведомлений о ставках")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Выберите текстовый канал")
                .setRequired(true)
        )
];
