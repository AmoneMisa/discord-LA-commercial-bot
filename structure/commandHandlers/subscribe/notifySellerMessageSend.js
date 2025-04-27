import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getRaidName} from "../../dbUtils.js";
import {translatedMessage} from "../../utils.js";

/**
 * Notifies the seller about a raid purchase request by sending a message to the seller with the provided details.
 * Includes buttons for the seller to accept or reject the request. The response is time-limited, and the message
 * is updated if no response is received within the specified time.
 *
 * @async
 * @function notifySellerMessageSend
 * @param {Object} interaction - The interaction object representing the user's action.
 * @return {Promise<void>} Resolves successfully if the notification was sent or updated without errors; otherwise, logs the error and sends a failure reply.
 */
export default async function notifySellerMessageSend(interaction) {
    try {
        const [, , sellerId, raidId] = interaction.customId.split('_');
        const seller = await client.users.fetch(sellerId);
        const raidName = await getRaidName(raidId);
        await interaction.deferUpdate();

        if (seller) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`seller_answer_${interaction.user.id}_${raidId}`)
                        .setLabel(await translatedMessage(interaction, 'buttons.accept'))
                        .setStyle(ButtonStyle.Success)
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId(`seller_reject_${interaction.user.id}_${raidId}`)
                        .setLabel(await translatedMessage(interaction, 'buttons.reject'))
                        .setStyle(ButtonStyle.Danger)
                );

            seller.send({
                content: await translatedMessage(interaction, 'raids.purchaseRequest', {
                    buyerId: interaction.user.id,
                    nickname: interaction.fields.getTextInputValue('buyer_nickname'),
                    raidName
                }),
                components: [row],
                flags: MessageFlags.Ephemeral
            }).then((message) => {
                setTimeout(async () => {
                    await message.edit({
                        content: await translatedMessage(interaction, 'raids.timeExpired'),
                        components: [],
                        flags: MessageFlags.Ephemeral
                    });
                }, 1000 * 60 * 5);
            });

            await client.channels.fetch(interaction.message.channelId);
            await interaction.message.edit({
                content: await translatedMessage(interaction, 'raids.requestSentToSeller'),
                components: [],
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (error) {
        console.error('Ошибка при отправке уведомления продавцу:', error);
        await interaction.reply({content: await translatedMessage(interaction, 'raids.sendRequestError'), flags: MessageFlags.Ephemeral});
    }
}