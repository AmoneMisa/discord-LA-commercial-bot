import {
    SlashCommandBuilder,
    PermissionFlagsBits
} from "discord.js";

export default new SlashCommandBuilder()
    .setName("market")
    .setDescription("💰 Просмотр и покупка лотов")
    .addSubcommand(sub =>
        sub.setName("list")
            .setDescription("📦 Посмотреть список доступных лотов")
    )
    .addSubcommand(sub =>
        sub.setName("buy")
            .setDescription("🛒 Купить золото у продавца")
            .addStringOption(opt =>
                opt.setName("lot_id")
                    .setDescription("ID лота, который хотите купить")
                    .setRequired(true)
            )
    );