import {MessageFlags} from "discord.js";

export default async function blockSubscription(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    await pool.query('INSERT INTO blocked_subscriptions (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
    await interaction.reply({ content: `🚫 Пользователю запрещено подписываться.`, flags: MessageFlags.Ephemeral });
}
