import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from 'discord.js';
import {getRaidName} from "../../dbUtils.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles message subscriptions for a specified guild message, verifying mentioned roles,
 * querying the database for relevant raid data, and sending notifications to subscribers.
 *
 * @param {Object} message - The message object from Discord.js, containing details about the message.
 * @return {Promise<void>} A promise that resolves with no returned value after handling the message subscription.
 */
export default async function handleMessageSubscription(message) {
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
            SELECT id
            FROM available_raids ar
            WHERE role_id = $1
        `, [role.id]);

        if (raid.rowCount === 0) {
            console.error(`Raid with role_id = ${role.id} not found`);
            return;
        }

        const raidsId = raid.rows;
        for (const raidId of raidsId) {
            const subscribers = await pool.query(`
                SELECT buyer_id
                FROM subscriptions
                WHERE seller_id = $1
                  AND raid_id = $2
            `, [message.author.id, raidId.id]);

            if (!subscribers.rows.length) {
                console.log("У пользователя нет подписчиков", message.author.id);
                return;
            }

            for (const subscriber of subscribers.rows) {
                const user = await client.users.fetch(subscriber.buyer_id);

                if (!user) {
                    console.error("Пользователь не найден:", subscriber.buyer_id);
                    return;
                }

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`raid_buy_${message.author.id}_${raidId.id}`)
                            .setLabel(await translatedMessage(message, 'raids.want_to_buy'))
                            .setStyle(ButtonStyle.Primary)
                    );

                const raidName = await getRaidName(raidId.id);

                await user.send({
                    content: await translatedMessage(message, 'raids.user_recruiting', {
                        user: `<@${message.author.id}>`,
                        raid: raidName,
                        url: message.url
                    }),
                    components: [row],
                    flags: MessageFlags.Ephemeral
                }).then((sentMessage) => {
                    setTimeout(async () => {
                        await sentMessage.edit({
                            content: await translatedMessage(message, 'raids.timeExpired'),
                            components: [],
                            flags: MessageFlags.Ephemeral
                        });
                    }, 1000 * 60 * 5);
                });
            }
        }
    }
}
