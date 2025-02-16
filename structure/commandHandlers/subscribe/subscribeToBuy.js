import {MessageFlags} from "discord.js";

export default async function subscribeToBuy(interaction, pool) {
    const seller = interaction.options.getUser('user');
    const buyer = interaction.user.id;
    const raids = interaction.options.getString('raids').split(',');

    const blockedBuyer = await pool.query('SELECT * FROM blocked_reviewers WHERE user_id = $1', [buyer]);
    if (blockedBuyer.rowCount > 0) {
        return interaction.reply({
            content: '🚫 Вам запрещено подписываться на продавцов.',
            flags: MessageFlags.Ephemeral
        });
    }

    for (const raid of raids) {
        const raidData = await pool.query('SELECT id FROM raids WHERE LOWER(raid_name) = LOWER($1)', [raid]);
        const result = await pool.query('SELECT id FROM available_raids WHERE raid_id = $1', [raidData.rows[0].id]);

        for (const availableRaid of result.rows) {

            await pool.query(`
                INSERT INTO subscriptions (buyer_id, seller_id, raid_id)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING
            `, [buyer, seller.id, availableRaid.id]);
        }
    }

    return interaction.reply({
        content: `✅ Вы подписались на уведомления от **<@${seller.id}>** по рейдам: ${raids.join(', ')}.`,
        flags: MessageFlags.Ephemeral
    });
}
