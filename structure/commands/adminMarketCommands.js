import {SlashCommandBuilder} from "discord.js";

export default [
    new SlashCommandBuilder()
    .setName("adm_market")
    .setDescription("⚙️ Управление лотами")
    .addSubcommand(sub =>
        sub.setName("create")
            .setDescription("➕ Создать новый лот")
            .addIntegerOption(opt =>
                opt.setName("amount")
                    .setDescription("Общее количество золота")
                    .setRequired(true)
            )
            .addNumberOption(opt =>
                opt.setName("price")
                    .setDescription("Цена за 1000 золота в рублях")
                    .setRequired(true)
            )
            .addStringOption(opt =>
                opt.setName("delivery")
                    .setDescription("Способ получения")
                    .setRequired(true)
                    .addChoices(
                        { name: "Аукцион", value: "auction" },
                        { name: "Почта", value: "mail" },
                        { name: "Оба варианта", value: "both" }
                    )
            )
            .addIntegerOption(opt =>
                opt.setName("min_order")
                    .setDescription("Минимальное количество для заказа")
                    .setRequired(true)
            )
            .addStringOption(opt =>
                opt.setName("server")
                    .setDescription("Сервер продажи")
                    .setRequired(true)
                    .addChoices(
                        { name: "Кратос", value: "kratos" },
                        { name: "Альдеран", value: "alderan" },
                        { name: "Оба сервера", value: "both" }
                    )
            )
    )
    .addSubcommand(sub =>
        sub.setName("my")
            .setDescription("📜 Посмотреть свои активные лоты")
    )
]
