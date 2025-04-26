import {SlashCommandBuilder} from "discord.js";

export default [
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
        ).addSubcommand(subcommand =>
        subcommand.setName('send_notification')
            .setDescription('Уведомление подписчикам о сборе рейда')
            .addStringOption(option =>
                option.setName('raid')
                    .setDescription('Выберите рейд')
                    .setRequired(true)
                    .setAutocomplete(true))
    )
]