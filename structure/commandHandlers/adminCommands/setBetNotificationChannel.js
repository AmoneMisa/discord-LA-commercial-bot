import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";

/**
 * Updates or inserts a record in the `bet_settings` table with the specified guild and channel IDs,
 * setting the notification channel for bet updates. If a record for the given guild already exists,
 * the channel ID is updated.
 *
 * @async
 * @function
 * @param {Object} interaction - Represents the Discord interaction object containing information
 *                               about the command execution context.
 * @param {Object} pool - An instance of the database connection pool used for executing queries.
 * @throws {Error} Throws an error if the database query fails.
 */
export default async function (interaction, pool) {
    const channelId = interaction.options.getChannel("channel").id;

    await pool.query(
        `UPDATE settings SET value = $1 WHERE key = 'bet_leaderboard_channel_id';`,
        [channelId]
    );

    await interaction.reply({ content: i18n.t("info.betNotificationChannelSet", { channelId, lng: interaction.client.language[interaction.user.id] }), flags: MessageFlags.Ephemeral });
}
