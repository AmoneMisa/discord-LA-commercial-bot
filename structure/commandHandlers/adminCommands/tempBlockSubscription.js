import {MessageFlags} from "discord.js";

export default async function tempBlockSubscription(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    const hours = interaction.options.getInteger('hours');

    await pool.query('INSERT INTO temp_blocked_subscriptions (user_id, expires_at) VALUES ($1, NOW() + INTERVAL \'$2 hours\') ON CONFLICT (user_id) DO UPDATE SET expires_at = NOW() + INTERVAL \'$2 hours\'', [userId, hours]);

    await interaction.reply({ content: `🚫 Пользователь заблокирован для подписок на ${hours} часов.`, flags: MessageFlags.Ephemeral });
}
