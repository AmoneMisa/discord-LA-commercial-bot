import { EmbedBuilder } from 'discord.js';
import getTopSellers, { getLeaderboardChannelId } from './dbUtils.js';

export default async function updateLeaderboard(client, pool) {
    const channelId = await getLeaderboardChannelId(pool);
    if (!channelId) {
        console.log('❌ Канал для таблицы лидеров не установлен.');
        return;
    }

    const topSellers = await getTopSellers(pool);
    if (!topSellers.length) {
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
    const messages = await channel.messages.fetch({ limit: 10 });
    const leaderboardMessage = messages.find(msg => msg.author.id === client.user.id && msg.embeds.length > 0);

    if (leaderboardMessage) {
        await leaderboardMessage.edit({ embeds: [embed] });
    } else {
        await channel.send({ embeds: [embed] });
    }

    console.log('✅ Таблица лидеров обновлена!');
}
