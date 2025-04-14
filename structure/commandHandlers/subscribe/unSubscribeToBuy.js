import {MessageFlags} from "discord.js";

/**
 * Unsubscribes the user from receiving notifications from a specified seller.
 *
 * @param {object} interaction - The interaction object containing the user's request and related data.
 * @return {Promise<object>} A promise that resolves to the interaction response after successful unsubscription.
 */
export default async function unSubscribeToBuy(interaction) {
    const seller = interaction.options.getUser('user');
    const buyer = interaction.user.id;

    await pool.query(`DELETE
                      FROM subscriptions
                      WHERE buyer_id = $1 AND seller_id = $2`, [buyer, seller.id]);

    return interaction.reply({
        content: `❌ Вы отписались от уведомлений от **${seller.username}**`,
        flags: MessageFlags.Ephemeral
    });
}
