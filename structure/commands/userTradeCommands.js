import {SlashCommandBuilder} from "discord.js";

export default [
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
                .setDescription('Список лотов'))
]