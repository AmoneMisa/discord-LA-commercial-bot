import {SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
        .setName("create_bet")
        .setDescription("🎲 Создать ставку"),
    new SlashCommandBuilder()
        .setName("update_bet")
        .setDescription("🎲 Изменить ставку")
        .addIntegerOption(option =>
        option.setName("amount")
            .setDescription("Новое значение ставки. Должно быть больше предыдущей")
            .setRequired(true)
            .setMinValue(201)
        )
]