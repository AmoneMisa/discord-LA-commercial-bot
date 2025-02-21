import {ButtonStyle, MessageFlags} from 'discord.js';
import {getActiveLotsCount} from "../../dbUtils.js";
import {createTradeMessage} from "./createMessage.js";

export default async function createLotHandler(interaction, pool, client) {
    const userId = interaction.user.id;

    // Проверяем количество активных лотов у пользователя
    const activeLots = await getActiveLotsCount(pool, userId);
    if (activeLots.rows[0].count >= 5) {
        return interaction.reply({ content: "🚫 У вас уже 5 активных лотов!", flags: MessageFlags.Ephemeral });
    }

    await createTradeMessage(interaction, pool, client);
}
