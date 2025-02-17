import {MessageFlags} from "discord.js";

export default async function unSubscribeToBuy(interaction, pool) {
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
