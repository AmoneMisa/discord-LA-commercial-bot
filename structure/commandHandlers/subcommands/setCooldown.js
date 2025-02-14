import {MessageFlags} from "discord.js";

export default async function setCooldown(interaction, pool) {
    const minutes = interaction.options.getInteger('minutes');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'cooldown_minutes\'', [minutes]);

    await interaction.reply({
        content: `✅ Кулдаун на голосование установлен: **${minutes} минут**.`,
        flags: MessageFlags.Ephemeral
    });
}
