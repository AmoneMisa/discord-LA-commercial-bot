import {SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName("adm_achievement")
        .setDescription("Админ команды для достижений")
        .addSubcommand(subcommand =>
            subcommand.setName("give_achievement_to_user")
                .setDescription('Выдать достижение пользователю')
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Пользователь, которому выдается достижение")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("achievement")
                        .setDescription("Название достижения")
                        .setRequired(true)
                        .setAutocomplete(true))
        ).addSubcommand(subcommand =>
        subcommand.setName("give_achievement_to_role")
            .setDescription('Выдать достижение роли')
            .addRoleOption(option =>
                option.setName("role")
                    .setDescription("Роль, которой выдается достижение")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("achievement")
                    .setDescription("Название достижения")
                    .setRequired(true)
                    .setAutocomplete(true))
    ).addSubcommand(subcommand =>
        subcommand.setName("create_achievement")
            .setDescription('Создать достижение')
            .addStringOption(option =>
                option.setName("name")
                    .setDescription("Название достижения")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("description")
                    .setDescription("Описание достижения")
                    .setRequired(true))
            .addAttachmentOption(option =>
                option.setName("icon")
                    .setDescription("Иконка достижения (только формат png)")
                    .setRequired(true))
    ).addSubcommand(subcommand =>
        subcommand.setName("edit_achievement")
            .setDescription('Редактировать достижение')
            .addStringOption(option =>
                option.setName("name")
                    .setDescription("Название достижения")
                    .setRequired(true)
                    .setAutocomplete(true))
            .addStringOption(option =>
                option.setName("field")
                    .setDescription("Какое поле редактировать")
                    .setRequired(true)
                    .addChoices(
                        {name: "Название", value: "name"},
                        {name: "Описание", value: "description"}
                    ))
            .addStringOption(option =>
                option.setName("value")
                    .setDescription("Новое значение")
                    .setRequired(true))
    ).addSubcommand(subcommand =>
        subcommand.setName("edit_icon")
            .setDescription('Редактировать иконку достижения')
            .addStringOption(option =>
                option.setName("name")
                    .setDescription("Название достижения")
                    .setRequired(true)
                    .setAutocomplete(true))
            .addAttachmentOption(option =>
                option.setName("icon")
                    .setDescription("Загрузите новую иконку")
                    .setRequired(true))
    ).addSubcommand(subcommand =>
        subcommand.setName("delete_achievement")
            .setDescription('Удалить достижение')
            .addStringOption(option =>
                option.setName("name")
                    .setDescription("Название достижения")
                    .setRequired(true)
                    .setAutocomplete(true))
    ).addSubcommand(subcommand =>
        subcommand.setName("achievement_give_mentions")
            .setDescription("Выдать достижение всем, кто упомянут в сообщении")
            .addStringOption(option =>
                option.setName("message_id")
                    .setDescription("ID сообщения с упоминаниями")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("achievement")
                    .setDescription("Название достижения")
                    .setRequired(true)
                    .setAutocomplete(true)
            )
    ).addSubcommand(subcommand =>
        subcommand.setName("achievement_remove_user")
            .setDescription("Забрать достижение у пользователя")
            .addUserOption(option =>
                option.setName("user")
                    .setDescription("Пользователь")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("achievement")
                    .setDescription("Название достижения")
                    .setRequired(true)
                    .setAutocomplete(true)
            )
    )
];