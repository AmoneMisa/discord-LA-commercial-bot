import { SlashCommandBuilder } from 'discord.js';

export default [new SlashCommandBuilder()
    .setName('list_add')
    .setDescription('➕ Добавить пользователя в белый или чёрный список')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Кого добавить в список')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Тип списка')
            .setRequired(true)
            .addChoices(
                { name: 'Белый список', value: 'whitelist' },
                { name: 'Чёрный список', value: 'blacklist' }
            )
    )
    .addStringOption(option =>
        option.setName('role')
            .setDescription('Роль пользователя')
            .setRequired(true)
            .addChoices(
                { name: 'Водила', value: 'driver' },
                { name: 'Покупатель', value: 'buyer' }
            )
    ),
    new SlashCommandBuilder()
    .setName('list_remove')
    .setDescription('➖ Удалить пользователя из белого или чёрного списка')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Пользователь, которого нужно удалить из списка')
            .setRequired(true)
    ),
    new SlashCommandBuilder()
    .setName('list_check')
    .setDescription('Проверить наличие пользователя в списке')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Пользователь, которого нужно проверить')
            .setRequired(true)
    )
]