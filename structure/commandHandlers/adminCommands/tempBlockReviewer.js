import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Temporarily blocks a reviewer for a specified number of hours by updating the database
 * and notifying the interaction user.
 *
 * @param {CommandInteraction} interaction - The interaction object containing the command context and options.
 * @param {Pool} pool - The database connection pool used for querying and updating the blocked reviewers table.
 * @return {Promise<void>} A promise that resolves when the reviewer is successfully blocked and the interaction reply is sent.
 */
export default async function tempBlockReviewer(interaction) {
    const user = interaction.options.getUser('user');
    const hours = interaction.options.getInteger('hours');

    const unblockTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    await pool.query(
        'INSERT INTO blocked_reviewers (user_id, unblock_time) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET unblock_time = EXCLUDED.unblock_time',
        [user.id, unblockTime]
    );

    await interaction.reply({
        content: await translatedMessage(interaction, "info.userBlockedFromReviewing", {
            username: user.username,
            hours
        }),
        flags: MessageFlags.Ephemeral
    });
}