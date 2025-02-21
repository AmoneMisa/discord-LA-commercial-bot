import {MessageFlags} from "discord.js";

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