import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from 'discord.js';
import {getRaidName} from "../dbUtils.js";

export default async function messageSubscriptionHandler(message, pool, client) {
    if (!message.guild || message.author.bot) {
        return;
    }

    const mentionedRoles = message.mentions.roles;
    const categoryResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['bus_category']);

    if (categoryResult.rowCount === 0) {
        return;
    }

    const categoryId = categoryResult.rows[0].value;

    if (message.channel.parentId !== categoryId) {
        return;
    }

    for (const role of mentionedRoles.values()) {
        const raid = await pool.query(`
            SELECT id FROM available_raids ar
            WHERE role_id = $1
        `, [role.id]);

        if (raid.rowCount === 0) {
            throw new Error(`Raid with role_id = ${role.id} not found`);
        }

        const raidId = raid.rows[0].id;
        const subscribers = await pool.query(`
                SELECT buyer_id FROM subscriptions
                WHERE seller_id = $1
                  AND raid_id = $2
            `, [message.author.id, raidId]);

        for (const subscriber of subscribers.rows) {
            const user = await client.users.fetch(subscriber.buyer_id);
            if (user) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`raid_buy_${message.author.id}_${raidId}`)
                            .setLabel('Хочу купить')
                            .setStyle(ButtonStyle.Primary)
                    );

                const raidName = await getRaidName(pool, raidId);

                await user.send({
                    content: `🔔 Игрок **${message.author.username}** набирает группу на **${raidName}**! [Перейти к сообщению](${message.url})`,
                    components: [row]
                }).then((message) => {
                    setTimeout(() => {
                        message.edit({content: `Время для ответа истекло`, components: [], flags: MessageFlags.Ephemeral});
                    }, 1000 * 60 * 5)
                });
            }
        }
    }
}
