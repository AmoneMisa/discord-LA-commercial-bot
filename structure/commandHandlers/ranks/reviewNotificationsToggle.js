import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles the interaction to enable or disable review notifications for the user.
 *
 * Updates the user's review notifications preference in the database and responds
 * with a confirmation message indicating whether the notifications were enabled or disabled.
 *
 * @param {Object} interaction - The interaction object containing user input and context.
 * @returns {Promise<Object>} A promise that resolves with a reply to the interaction.
 */
export default async function (interaction) {
    const enabled = interaction.options.getBoolean("enabled");

    await pool.query(
        "UPDATE users SET review_notifications_enabled = $1 WHERE user_id = $2",
        [enabled, interaction.user.id]
    );

    return interaction.reply({
        content: enabled
            ? await translatedMessage(interaction, "info.reviewNotificationsEnabled")
            : await translatedMessage(interaction, "info.reviewNotificationsDisabled"),
        flags: MessageFlags.Ephemeral
    });
}