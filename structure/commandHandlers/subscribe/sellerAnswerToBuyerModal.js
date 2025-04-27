import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {getRaidName} from "../../dbUtils.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles interaction events for processing raid purchase requests.
 *
 * This function processes whether the seller accepts or rejects a raid purchase request.
 * If the request is accepted, a modal is presented to the seller to input additional details.
 * If the request is rejected, the buyer is notified, and the interaction message is updated.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object representing the interaction event.
 */
export default async function (interaction) {
    try {
        const [, , buyerId, raidId] = interaction.customId.split('_');
        const buyer = await client.users.fetch(buyerId);
        const raidName = await getRaidName(raidId);

        if (interaction.customId.startsWith('seller_answer_')) {
            const modal = new ModalBuilder()
                .setCustomId(`raid_buy_answer_${buyerId}_${raidId}`)
                .setTitle(await translatedMessage(interaction, 'raids.modalAcceptRequestTitle'));

            const inputField = new TextInputBuilder()
                .setCustomId('lobby')
                .setLabel(await translatedMessage(interaction, 'raids.modalLobbyName'))
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(inputField);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        } else {
            await buyer.send({
                content: await translatedMessage(interaction, 'raids.sellerDeclined', { sellerId: interaction.user.id, raidName }),
                flags: MessageFlags.Ephemeral
            });

            await client.channels.fetch(interaction.message.channelId);
            await interaction.message.edit({
                content: await translatedMessage(interaction, 'raids.sellerDeclineSuccess'),
                components: [],
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (e) {
        console.error('Ошибка при отправке ответа покупателю', e);
    }
}