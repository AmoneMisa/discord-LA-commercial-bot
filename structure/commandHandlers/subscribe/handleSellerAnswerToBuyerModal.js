import {getRaidName} from "../../dbUtils.js";
import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles an interaction event for approving a raid purchase request.
 * Sends a confirmation message to the buyer and updates the interaction message.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object containing details of the user's action.
 * @throws Will log an error if sending the response to the buyer fails.
 */
export default async function (interaction) {
    try {
        const [ , , , buyerId, raidId] = interaction.customId.split('_');
        const buyer = await client.users.fetch(buyerId);
        const raidName = await getRaidName(raidId);

        await client.channels.fetch(interaction.message.channelId);
        await interaction.message.edit({
            content: await translatedMessage(interaction, 'raids.message_sent_to_user'),
            components: [],
            flags: MessageFlags.Ephemeral
        });

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.deleteReply();

        await client.users.send(buyer, {
            content: await translatedMessage(interaction, 'raids.seller_approved_purchase', {
                seller: `<@${interaction.user.id}>`,
                raid: raidName,
                lobby: interaction.fields.getTextInputValue('lobby')
            }),
            flags: MessageFlags.Ephemeral
        });
    } catch (e) {
        console.error('Ошибка при отправке ответа покупателю', e);
    }
}