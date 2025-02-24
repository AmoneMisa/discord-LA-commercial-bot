import {SlashCommandBuilder, PermissionFlagsBits} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName("adm_bet")
        .setDescription("🎲 Создать событие для ставок")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName("create")
                .setDescription("Создать событие для ставок")
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
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("delete")
                .setDescription("❌ Удалить событие ставок")
                .addIntegerOption(option =>
                    option.setName("event_id")
                        .setDescription("ID события")
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("channel")
                .setDescription("📢 Выбрать канал для уведомлений о ставках")
                .addChannelOption(option =>
                    option.setName("channel")
                        .setDescription("Выберите текстовый канал")
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand.setName("message")
                .setDescription("📢 Выбрать сообщение для уведомлений о ставках")
                .addChannelOption(option =>
                    option.setName("message")
                        .setDescription("Введите id сообщения")
                        .setRequired(true)
                ))
];
