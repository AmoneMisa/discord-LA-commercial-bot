import {SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName("language")
        .setDescription("Язык бота")
        .addStringOption(option =>
        option.setName("language")
            .setDescription("Выберите язык из списка")
            .setRequired(true)
            .addChoices({name: "Русский", value: "ru"},
                {name: "Українська", value: "ua"},
                {name: "Беларуская", value: "by"},
                {name: "English", value: "en"},
    {name: "中文", value: "ch"}))
]