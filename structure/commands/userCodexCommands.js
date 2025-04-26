import {SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName("get_codex")
        .setDescription("🔍 Получить информацию из кодекса")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Выберите категорию")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Выберите название")
                .setRequired(true)
                .setAutocomplete(true)
        )
]