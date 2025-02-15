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

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Топ 30 продавцов за 14 дней')
        .setFields(
            {
                name: 'Ранг',
                value: topSellers.map((user, index) => (index + 1).toString() + '` `\n').join(''),
                inline: true,
            },
            {
                name: 'User',
                value: topSellers.map((user, index) =>  `<@${user.user_id}>` + '` `\n').join(''),
                inline: true
            },
            {
                name: 'Rating',
                value: topSellers.map((user, index) => `${user.rating.toFixed(2)}% (👍 ${user.positive_reviews} / 👎 ${user.negative_reviews})` + '` `\n').join(''),
                inline: true
            }
        )
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
    console.log(newMessage.id);
    await setLeaderboardMessageId(pool, newMessage.id);
    console.log('✅ Таблица лидеров создана и сохранена!');
}
