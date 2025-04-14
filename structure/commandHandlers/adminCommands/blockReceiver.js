import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Blocks a user from receiving feedback by adding their user ID to the blocked_receivers database.
 *
 * @param {Object} interaction - The interaction object from the command, containing user and context data.
 * @return {Promise<void>} Resolves after the user is successfully blocked and a response is sent.
 */
export default async function blockReceiver(interaction) {
    const user = interaction.options.getUser('user');

    await pool.query('INSERT INTO blocked_receivers (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.userBlockedFromReviews", {username: user.username}),
        flags: MessageFlags.Ephemeral
    });
}
