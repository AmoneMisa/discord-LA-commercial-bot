import {
    SlashCommandBuilder,
} from "discord.js";

export default [new SlashCommandBuilder()
    .setName("market")
    .setDescription("💰 Просмотр и покупка лотов")
    .addSubcommand(sub =>
        sub.setName("list")
            .setDescription("📦 Посмотреть список доступных лотов")
    )
]