import {MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} from 'discord.js';

/**
 * Handles the interaction event for creating a modal to purchase a raid.
 *
 * Parses the customId of the interaction to extract the seller ID and builds a modal
 * with a text input field for entering the buyer's nickname. The modal is then displayed
 * to the user.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object representing the user's action.
 * @param {string} interaction.customId - The custom ID of the interaction, used to extract seller information.
 * @param {Object} interaction.user - The user who initiated the interaction.
 * @returns {Promise<void>} A promise that resolves when the modal is successfully displayed.
 */
export default async function (interaction) {
    // создание модалки на покупку рейда
    const [, , , sellerId] = interaction.customId.split('_');

    const modal = new ModalBuilder()
        .setCustomId(`response_raid_buy_${sellerId}_${interaction.user.id}`)
        .setTitle('Покупка рейда');

    const inputField = new TextInputBuilder()
        .setCustomId('raid_buyer_nickname')
        .setLabel('Ваш ник')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20)
        .setMinLength(8)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(inputField);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}
