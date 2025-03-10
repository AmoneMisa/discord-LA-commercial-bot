import {MessageFlags} from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Blocks a user from receiving feedback by adding their user ID to the blocked_receivers database.
 *
 * @param {Object} interaction - The interaction object from the command, containing user and context data.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} Resolves after the user is successfully blocked and a response is sent.
 */
export default async function blockReceiver(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('INSERT INTO blocked_receivers (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

    await interaction.reply({
        content: i18n.t("info.userBlockedFromReviews", { lng: await getUserLanguage(interaction.user.id, pool), username: user.username }),
        flags: MessageFlags.Ephemeral
    });
}
