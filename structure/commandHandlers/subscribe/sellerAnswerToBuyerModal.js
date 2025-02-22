import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {getRaidName} from "../../dbUtils.js";

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
 * @param {Object} pool - The database connection pool used to fetch raid details.
 * @param {Object} client - The Discord client instance used to interact with the Discord API.
 */
export default async function (interaction, pool, client) {
    try {
        const [, , buyerId, raidId] = interaction.customId.split('_');
        const buyer = await client.users.fetch(buyerId);
        const raidName = await getRaidName(pool, raidId);

        if (interaction.customId.startsWith('seller_answer_')) {
            const modal = new ModalBuilder()
                .setCustomId(`raid_buy_answer_${buyerId}_${raidId}`)
                .setTitle('Принятие запроса');

            const inputField = new TextInputBuilder()
                .setCustomId('lobby')
                .setLabel('Название лобби')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(inputField);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        } else {
            await buyer.send({content: `Продавец: <@${interaction.user.id}> отклонил ваш запрос на покупку рейда: ${raidName}`});
            await client.channels.fetch(interaction.message.channelId);
            await interaction.message.edit({
                content: '❌ Ваш отказ отправлен покупателю',
                components: [],
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (e) {
        console.error('Ошибка при отправке ответа покупателю', e);
    }
}