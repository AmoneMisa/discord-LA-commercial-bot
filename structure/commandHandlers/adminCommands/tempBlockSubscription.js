import {MessageFlags} from "discord.js";
import {getUserLanguage} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Temporarily blocks a user from subscriptions for a specified number of hours.
 *
 * @param {object} interaction - The interaction object containing the user and hours information.
 * @param {object} pool - The database connection pool to execute the query.
 * @return {Promise<void>} Resolves when the user has been blocked and a reply is sent to the interaction.
 */
export default async function tempBlockSubscription(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    const hours = interaction.options.getInteger('hours');
    const blockType = interaction.options.getString('block_type');

    await pool.query('INSERT INTO blocked_subscriptions (user_id, blocked_until, block_type) VALUES ($1, NOW() + INTERVAL \'$2 hours\') ON CONFLICT (user_id) DO UPDATE SET blocked_until = NOW() + INTERVAL \'$2 hours\'', [userId, hours, blockType]);

    await interaction.reply({ content: i18n.t("errors.subscriptionTempBlocked", {
            lng: await getUserLanguage(interaction.user.id, pool),
            hours: hours
        }), flags: MessageFlags.Ephemeral });
}
