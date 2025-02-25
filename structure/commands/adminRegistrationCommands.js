import {SlashCommandBuilder, PermissionFlagsBits} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName("adm_event")
        .setDescription("🎭 Управление ивентами")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName("create")
                .setDescription("Зарегистрировать ивент")
                .addStringOption(option =>
                    option.setName("message_id")
                        .setDescription("ID сообщения с приглашением на ивент")
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName("private_channel")
                        .setDescription("id закрытого канала, куда присылать анкеты игроков")
                        .setRequired(false)
                ).addStringOption(option =>
                option.setName("message_id")
                    .setDescription("ID сообщения, под которым появится кнопка")
                    .setRequired(true)
            )
                .addStringOption(option =>
                    option.setName("start_time")
                        .setDescription("Дата и время начала (YYYY-MM-DD HH:MM)")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("end_time")
                        .setDescription("Дата и время окончания (YYYY-MM-DD HH:MM)")
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand.setName("unregister_user")
                .setDescription("Удалить регистрацию пользователя и ивента")
                .addIntegerOption(option =>
                    option.setName("event_id")
                        .setDescription("ID события")
                        .setRequired(true)
                )
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Пользователь, которого удалить")
                        .setRequired(true)
                )
        )
];
