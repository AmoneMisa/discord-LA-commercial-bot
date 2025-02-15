import { EmbedBuilder } from 'discord.js';
import { getLeaderboardChannelId, getLeaderboardMessageId, setLeaderboardMessageId, getTopSellers } from './dbUtils.js';

export default async function updateLeaderboard(client, pool) {
    const channelId = await getLeaderboardChannelId(pool);
    if (!channelId || channelId === '') {
        console.log('❌ Канал для таблицы лидеров не установлен.');
        return;
    }

    const topSellers = await getTopSellers(pool);

    if (!topSellers.length) {
        console.log('❌ Нет данных для обновления таблицы лидеров.');
        return;
    }

    let leaderboardText = '```Rank  | User           | Rating | 👍 | 👎 \n';
    leaderboardText += '------------------------------------------\n';

    topSellers.forEach((user, index) => {
        const username = `<@${user.user_id}>`.padEnd(14);
        const rating = `${user.rating.toFixed(2)}%`.padStart(6);
        const positive = `${user.positive_reviews}`.padStart(3);
        const negative = `${user.negative_reviews}`.padStart(3);
        leaderboardText += `${(index + 1).toString().padEnd(4)} | ${username} | ${rating} | ${positive} | ${negative}\n`;
    });

    leaderboardText += '```';

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Топ 30 продавцов за 14 дней')
        .setDescription(leaderboardText)
        .setFooter({ text: 'Обновляется ежедневно' });

    const channel = await client.channels.fetch(channelId);
    let messageId = await getLeaderboardMessageId(pool);

    if (messageId) {
        try {
            const message = await channel.messages.fetch(messageId);
            await message.edit({ embeds: [embed] });
            console.log('✅ Таблица лидеров обновлена!');
            return;
        } catch (error) {
            console.log('⚠️ Не удалось найти сообщение с таблицей, создаём новое...');
        }
    }

    const newMessage = await channel.send({ embeds: [embed] });
    await setLeaderboardMessageId(pool, newMessage.id);
    console.log('✅ Таблица лидеров создана и сохранена!');
}
