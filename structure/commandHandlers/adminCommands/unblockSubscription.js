import {MessageFlags} from "discord.js";

export default async function unblockSubscription(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    await pool.query('DELETE FROM blocked_subscriptions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM temp_blocked_subscriptions WHERE user_id = $1', [userId]);
    await interaction.reply({ content: `✅ Пользователь теперь может подписываться.`, flags: MessageFlags.Ephemeral });
}
