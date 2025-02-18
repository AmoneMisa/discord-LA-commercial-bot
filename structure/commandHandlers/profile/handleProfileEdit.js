import {MessageFlags} from "discord.js";

export default async function handleProfileEdit(interaction, pool) {
    const userId = interaction.user.id;
    const field = interaction.options.getString('field');
    let value = interaction.options.getString('value');

    if (field === 'main_nickname') {
        value = value.toLowerCase();
    }

    await pool.query(`
        UPDATE profiles 
        SET ${field} = $1
        WHERE user_id = $2
    `, [value, userId]);

    await interaction.reply({ content: `✅ Поле **${field}** успешно обновлено!`, flags: MessageFlags.Ephemeral });
}
