import {MessageFlags} from "discord.js";

/**
 * Updates the cooldown value for voting in the database and sends a reply to the user.
 *
 * @param {Object} interaction - The interaction object containing details of the user's command.
 * @param {Object} pool - The database connection pool object used for executing queries.
 * @return {Promise<void>} Resolves when the cooldown has been updated and a reply has been sent.
 */
export default async function setCooldown(interaction, pool) {
    const minutes = interaction.options.getInteger('minutes');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'cooldown_minutes\'', [minutes]);

    await interaction.reply({
        content: `✅ Кулдаун на голосование установлен: **${minutes} минут**.`,
        flags: MessageFlags.Ephemeral
    });
}
