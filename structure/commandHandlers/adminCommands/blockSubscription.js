import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Blocks a user's subscription by adding their user ID to the blocked subscriptions list.
 *
 * @param {Object} interaction - The interaction object from the command, containing the user to block and other related data.
 * @return {Promise<void>} Resolves after the user's subscription block is successfully added and a response is sent to the interaction.
 */
export default async function blockSubscription(interaction) {
    const user = interaction.options.getUser('user');
    const blockType = interaction.options.getString('block_type');

    await pool.query('INSERT INTO blocked_subscriptions (user_id, block_type) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, blockType]);
    await interaction.reply({
        content: await translatedMessage(interaction, "info.userBlockedFromLeavingReviews", {username: user.username}),
        flags: MessageFlags.Ephemeral
    });
}
