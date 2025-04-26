import {ButtonStyle, MessageFlags} from 'discord.js';
import {getActiveLotsCount} from "../../dbUtils.js";
import {createTradeMessage} from "./createMessage.js";

/**
 * Handles the creation of a lot for a user during an interaction.
 * Checks if the user has less than 5 active lots and creates a trade message if the condition is met.
 *
 * @param {object} interaction - The interaction object representing the user's request.
 * @return {Promise<void>} - Resolves once the lot of creation process or the error response is completed.
 */
export default async function createLotHandler(interaction) {
    const userId = interaction.user.id;

    // Проверяем количество активных лотов у пользователя
    const activeLots = await getActiveLotsCount(userId);
    if (activeLots.rows[0].count >= 5) {
        return interaction.reply({ content: "🚫 У вас уже 5 активных лотов!", flags: MessageFlags.Ephemeral });
    }

    await createTradeMessage(interaction);
}
