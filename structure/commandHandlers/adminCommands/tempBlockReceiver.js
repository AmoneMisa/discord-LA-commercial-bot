import { MessageFlags } from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Temporarily blocks a user from receiving feedback for a specified number of hours.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} pool - The database connection pool used to execute queries.
 * @param {Object} interaction.options - The options provided with the interaction command.
 * @param {Function} interaction.options.getUser - Function to retrieve the user mentioned in the command options.
 * @param {Function} interaction.options.getInteger - Function to retrieve the integer value provided in the command options.
 * @param {Object} user - The user to be temporarily blocked, retrieved from the interaction.
 * @param {number} hours - The duration in hours for which the user should be blocked.
 * @return {Promise<void>} Resolves when the user is successfully blocked and the confirmation message is sent.
 */
export default async function tempBlockReceiver(interaction, pool) {
    const user = interaction.options.getUser('user');
    const hours = interaction.options.getInteger('hours');

    const unblockTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    await pool.query('INSERT INTO blocked_receivers (user_id, unblock_time) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET unblock_time = EXCLUDED.unblock_time', [user.id, unblockTime]);

    await interaction.reply({
        content: i18n.t("info.userBlockedForReviews", {
            username: user.username,
            hours,
            lng: await getUserLanguage(interaction.user.id, pool)
        }),
        flags: MessageFlags.Ephemeral
    });
}
