import { MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Handles buy button interactions by presenting a modal for raid purchase.
 *
 * @param {Object} interaction - The interaction object from the Discord API.
 * @param {string} interaction.customId - The custom ID associated with the interaction.
 * @return {Promise<void>} Resolves when the modal is shown to the user.
 */
export default async function handleBuyButtons(interaction) {
    const [ , , sellerId, raidId] = interaction.customId.split('_');

    const modal = new ModalBuilder()
        .setCustomId(`raid_buy_${sellerId}_${raidId}`)
        .setTitle(await translatedMessage(interaction, 'raids.modalBuyRaidTitle'));

    const inputField = new TextInputBuilder()
        .setCustomId('buyer_nickname')
        .setLabel(await translatedMessage(interaction, 'raids.modalNicknameLabel'))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(inputField);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}
