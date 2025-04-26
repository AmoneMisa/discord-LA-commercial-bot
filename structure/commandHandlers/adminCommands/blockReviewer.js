import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Blocks a user from leaving reviews by adding their user ID to the blocked reviewers' database.
 *
 * @param {Object} interaction - The interaction object representing the command interaction.
 * @return {Promise<void>} Resolves when the user is successfully added to the blocked reviewers list and the interaction is replied to.
 */
export default async function blockReviewer(interaction) {
    const user = interaction.options.getUser('user');

    await pool.query('INSERT INTO blocked_reviewers (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.userBlockedFromLeavingReviews", {username: user.username}),
        flags: MessageFlags.Ephemeral
    });
}
