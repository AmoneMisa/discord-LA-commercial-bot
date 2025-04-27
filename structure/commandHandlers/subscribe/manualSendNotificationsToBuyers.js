import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles a raid creation or subscription broadcasting process for a Discord interaction.
 *
 * This function processes a command interaction in a Discord bot that involves finding a specific raid
 * in the database by raid name, querying subscribers to that raid, and sending notification messages
 * to the subscribers.
 *
 * @async
 * @function
 * @param {Object} interaction - The Discord interaction object provided by the user for the command input.
 * @param {String} raidName
 * @returns {Promise<void>} - Resolves when the process completes successfully or an error has been handled.
 *
 * @throws Will log an error to the console if the raid cannot be found in the database.
 *
 * Queries performed:
 * - Finds the raid ID by raid name in the `raids` table.
 * - Retrieves the list of subscribers (buyer IDs) for the raid and the current seller (user initiating the interaction).
 *
 * Sends:
 * - Direct messages to all subscribers with the option to join/purchase the raid. A timeout is applied to allow limited response time.
 *
 * Utilizes:
 * - Fetching of user data from the Discord API.
 * - Creation of interactive buttons with a timeout functionality for response.
 *
 * Requirements:
 * - Database schema must include `raids` and `subscriptions` tables.
 * - `getRaidName(pool, raidId)` must be a valid utility function that retrieves the raid name based on the raid ID.
 * - Permissions should allow the bot to send direct messages on behalf of the bot to users.
 */
export default async function(interaction, raidName) {
    const raidId = await pool.query(`SELECT id FROM raids WHERE LOWER(raid_name) = LOWER($1)`, [raidName]);

    if (!raidId || !raidId.rows.length) {
        console.error("Ошибка при поиске рейда в базе:", raidName);
        return await interaction.reply({
            content: await translatedMessage(interaction, 'raids.raidNotFound'),
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.editReply({content: await translatedMessage(interaction, "raids.sellerAcceptSuccess")});

    const subscribers = await pool.query(`
        SELECT buyer_id FROM subscriptions
        WHERE seller_id = $1
          AND raid_id = $2
    `, [interaction.user.id, raidId.rows[0].id]);

    for (const subscriber of subscribers.rows) {
        const user = await client.users.fetch(subscriber.buyer_id);
        if (user) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`raid_buy_${interaction.user.id}_${raidId.rows[0].id}`)
                        .setLabel(await translatedMessage(interaction, 'raids.buttonBuyLabel'))
                        .setStyle(ButtonStyle.Primary)
                );

            await user.send({
                content: await translatedMessage(interaction, 'raids.notifySubscribers', { sellerId: interaction.user.id, raidName }),
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
        }
    }
}
