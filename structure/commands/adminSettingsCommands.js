import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName('adm_settings')
        .setDescription('Настройки администратора')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
    )
]