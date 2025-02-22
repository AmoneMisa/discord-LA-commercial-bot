import {MessageFlags} from "discord.js";

export default async function deleteAchievement(interaction, pool) {
    const name = interaction.options.getString('name');

    await pool.query(`DELETE FROM achievements WHERE name = $1`, [name]);

    await interaction.reply({ content: `✅ Достижение **${name}** удалено!`, flags: MessageFlags.Ephemeral });
}
