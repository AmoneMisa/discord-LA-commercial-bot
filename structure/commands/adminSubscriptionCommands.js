import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName('adm_subscription')
        .setDescription('Управление правилами подписок')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName('block_subscription')
                .setDescription('Запрещает пользователю подписываться на других')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Выберите пользователя')
                        .setRequired(true)
                ).addStringOption(option =>
                    option.setName('block_type')
                        .setDescription("Выберите тип блокировки")
                        .addChoices({name: 'Запрет получать подписки', value: 'receiver'},
                            {name: 'Запрет подписываться', value: 'reviewer'}))
        ).addSubcommand(subcommand =>
        subcommand.setName('temp_block_subscription')
            .setDescription('Временно запрещает пользователю подписываться (в часах)')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('Выберите пользователя')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName('hours')
                    .setDescription('Количество часов')
                    .setRequired(true)
            )
    ).addSubcommand(subcommand =>
        subcommand.setName('unblock_subscription')
            .setDescription('Разрешает пользователю снова подписываться')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('Выберите пользователя')
                    .setRequired(true)
            )
    ).addSubcommand(subcommand =>
        subcommand.setName('edit_raids')
            .setDescription('Редактирование списка доступных рейдов')
    ).addSubcommand(subcommand =>
        subcommand.setName('set_raid_role')
            .setDescription('Настроить соответствие между рейдом и ролью')
            .addStringOption(option =>
                option.setName('raid')
                    .setDescription('Название рейда')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('Роль, соответствующая рейду')
                    .setRequired(true)
            )
    ).addSubcommand(subcommand =>
        subcommand.setName('set_bus_category')
            .setDescription('Установить категорию для отслеживания рейдов')
            .addChannelOption(option =>
                option.setName('category')
                    .setDescription('Категория, в которой продают рейды')
                    .setRequired(true)
            )
    )
]