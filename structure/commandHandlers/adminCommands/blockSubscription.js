import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Blocks a user's subscription by adding their user ID to the blocked subscriptions list.
 *
 * @param {Object} interaction - The interaction object from the command, containing the user to block and other related data.
 * @param {Object} pool - The database connection pool used to execute queries.
 * @return {Promise<void>} Resolves after the user's subscription block is successfully added and a response is sent to the interaction.
 */
export default async function blockSubscription(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    const blockType = interaction.options.getString('block_type');

    await pool.query('INSERT INTO blocked_subscriptions (user_id, block_type) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, blockType]);
    await interaction.reply({ content: i18n.t("info.userBlockedFromLeavingReviews", { lng: await getUserLanguage(interaction.user.id, pool), username: user.username }), flags: MessageFlags.Ephemeral });
}
