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
                ).addStringOption(option =>
                option.setName('raid')
                    .setDescription('Выберите рейд')
                    .setRequired(true)
                    .addChoices({name: 'Бехемос', value: 'Бехемос'},
                        {name: 'Ехидна', value: 'Ехидна'},
                        {name: 'Эгир', value: 'Эгир'},
                        {name: 'Аврельсуд', value: 'Аврельсуд'},
                        {name: 'Камен 2.0', value: 'Камен 2.0'}
                    )
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