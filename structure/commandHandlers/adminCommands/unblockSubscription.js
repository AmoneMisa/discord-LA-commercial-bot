import {MessageFlags} from "discord.js";
import {getUserLanguage} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Unblocks a user's subscription by removing their entries from the blocked subscriptions tables.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} pool - The database connection pool used for executing SQL queries.
 * @return {Promise<void>} Resolves when the user's subscription is successfully unblocked and the reply is sent.
 */
export default async function unblockSubscription(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    await pool.query('DELETE FROM blocked_subscriptions WHERE user_id = $1', [userId]);
    await interaction.reply({ content: i18n.t("info.userCanSubscribe", {
            lng: await getUserLanguage(interaction.user.id, pool)
        }), flags: MessageFlags.Ephemeral });
}
