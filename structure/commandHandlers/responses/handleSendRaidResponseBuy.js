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
 * @returns {Promise<void>} Resolves when the action completes, or replies to the interaction in case of an error.
 */
export default async function (interaction) {
    // Кнопка "Хочу купить"
    const [, , , sellerId] = interaction.customId.split('_');

    if (interaction.user.id === sellerId) {
        return interaction.reply({
            content: '🚫 Вы не можете отправить заявку самому себе.',
            flags: MessageFlags.Ephemeral
        });
    }

    await createModalBuyResponse(interaction);
    await givePointsForActivity(interaction.user.id, 2);
}