import {MessageFlags} from "discord.js";

export default async function editAchievement(interaction, pool) {
    const name = interaction.options.getString('name');
    const field = interaction.options.getString('field'); // 'name' | 'description' | 'icon'
    const value = interaction.options.getString('value');

    await pool.query(`UPDATE achievements SET ${field} = $1 WHERE name = $2`, [value, name]);

    await interaction.reply({ content: `✅ Достижение **${name}** обновлено!`, flags: MessageFlags.Ephemeral });
}
