import { MessageFlags } from "discord.js";
import { translatedMessage } from "../../utils.js";

/**
 * Temporarily blocks a user from subscriptions for a specified number of hours.
 *
 * @param {object} interaction - The interaction object containing the user and hours information.
 * @return {Promise<void>} Resolves when the user has been blocked and a reply is sent to the interaction.
 */
export default async function tempBlockSubscription(interaction) {
    const userId = interaction.options.getUser('user').id;
    const hours = interaction.options.getInteger('hours');
    const blockType = interaction.options.getString('block_type');

    await pool.query(
        `INSERT INTO blocked_subscriptions (user_id, blocked_until, block_type)
         VALUES ($1, NOW() + INTERVAL '$2 hours', $3)
         ON CONFLICT (user_id) DO UPDATE
         SET blocked_until = NOW() + INTERVAL '$2 hours'`,
        [userId, hours, blockType]
    );

    await interaction.reply({
        content: await translatedMessage(interaction, "errors.subscriptionTempBlocked", { hours }),
        flags: MessageFlags.Ephemeral
    });
}