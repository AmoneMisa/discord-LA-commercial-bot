import {MessageFlags} from "discord.js";

/**
 * Handles the interaction to enable or disable review notifications for the user.
 *
 * Updates the user's review notifications preference in the database and responds
 * with a confirmation message indicating whether the notifications were enabled or disabled.
 *
 * @param {Object} interaction - The interaction object containing user input and context.
 * @param {Object} pool - The database connection pool for executing queries.
 * @returns {Promise<Object>} A promise that resolves with a reply to the interaction.
 */
export default async function (interaction, pool) {
    const enabled = interaction.options.getBoolean("enabled");

    await pool.query(
        "UPDATE users SET review_notifications_enabled = $1 WHERE user_id = $2",
        [enabled, interaction.user.id]
    );

    return interaction.reply({
        content: enabled
            ? "🔔 Уведомления о новых отзывах **включены**!"
            : "🔕 Уведомления о новых отзывах **выключены**!",
        flags: MessageFlags.Ephemeral
    });
}