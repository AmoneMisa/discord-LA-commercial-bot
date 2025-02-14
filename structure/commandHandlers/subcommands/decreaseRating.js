import {MessageFlags} from "discord.js";

export default async function decreaseRating(interaction, pool) {
    const user = interaction.options.getUser('user');
    const points = interaction.options.getInteger('points');

    await pool.query('UPDATE users SET rating = rating - $1 WHERE user_id = $2', [points, user.id]);

    await interaction.reply({
        content: `❌ **${points}** баллов снято у **${user.username}**.`,
        flags: MessageFlags.Ephemeral
    });
}
