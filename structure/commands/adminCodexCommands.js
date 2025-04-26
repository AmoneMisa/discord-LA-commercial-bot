import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName("adm_codex")
        .setDescription("📖 Управление кодексом")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
        subcommand.setName("add")
            .setDescription("📖 Добавить запись в кодекс")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Выберите категорию")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Название записи")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("language")
                .setDescription("Язык (например: ru, en)")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("content")
                .setDescription("Основной текст")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("source_url")
                .setDescription("Источник (если есть)")
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName("image")
                .setDescription("Прикрепите изображение (необязательно)")
                .setRequired(false)
        )).addSubcommand(subcommand =>
        subcommand.setName("edit")
            .setDescription("📖 Редактировать запись в кодексе")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Выберите категорию")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Название записи")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("language")
                .setDescription("Язык (например: ru, en)")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("content")
                .setDescription("Основной текст")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("source_url")
                .setDescription("Источник (если есть)")
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName("image")
                .setDescription("Прикрепите изображение")
                .setRequired(false)
        )).addSubcommand(subcommand =>
        subcommand.setName("delete")
            .setDescription("📖 Удалить запись из кодекса")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Выберите категорию")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Название записи")
                .setRequired(true)
        ))
]