import { MessageFlags } from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Blocks a user from leaving reviews by adding their user ID to the blocked reviewers database.
 *
 * @param {Object} interaction - The interaction object representing the command interaction.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} Resolves when the user is successfully added to the blocked reviewers list and the interaction is replied to.
 */
export default async function blockReviewer(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('INSERT INTO blocked_reviewers (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

    await interaction.reply({
        content: i18n.t("info.userBlockedFromLeavingReviews", { lng: await getUserLanguage(interaction.user.id, pool), username: user.username }),
        flags: MessageFlags.Ephemeral
    });
}
