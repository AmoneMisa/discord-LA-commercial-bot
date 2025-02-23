import {MessageFlags} from "discord.js";
import createModalBuyResponse from "./createModalBuyResponse.js";
import {givePointsForActivity} from "../../dbUtils.js";

/**
 * Handles the "I want to buy" button interaction.
 *
 * This function processes a user interaction when they click the "I want to buy" button, ensuring
 * they cannot send a request to themselves and triggers a modal response for the buying process.
 *
 * @param {Object} interaction - The interaction object representing the user's action.
 * @param {Object} pool - The database connection pool for managing database operations.
 * @param {Object} client - The bot client object for performing bot-related operations.
 *
 * @returns {Promise<void>} Resolves when the action completes, or replies to the interaction in case of an error.
 */
export default async function (interaction, pool, client) {
    // Кнопка "Хочу купить"
    const [, , , sellerId] = interaction.customId.split('_');

    if (interaction.user.id === sellerId) {
        return interaction.reply({
            content: '🚫 Вы не можете отправить заявку самому себе.',
            flags: MessageFlags.Ephemeral
        });
    }

    await createModalBuyResponse(interaction);
    await givePointsForActivity(pool, interaction.user.id, 2);
}