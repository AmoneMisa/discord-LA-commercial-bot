import {MessageFlags} from "discord.js";

export default async function createAchievement(interaction, pool) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const icon = interaction.options.getString('icon');

    await pool.query(
        `INSERT INTO achievements (name, description, icon) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
        [name, description, icon]
    );

    await interaction.reply({ content: `✅ Достижение **${name}** создано!`, flags: MessageFlags.Ephemeral });
}
