import { EmbedBuilder } from 'discord.js';
import { getLeaderboardChannelId, getLeaderboardMessageId, setLeaderboardMessageId, getTopSellers } from '../dbUtils.js';

/**
 * Updates the leaderboard in a specified Discord channel with the top 30 sellers from the last 30 days.
 *
 * @return {Promise<void>} A promise that resolves when the leaderboard update process is complete. Outputs logs indicating the status of the operation.
 */
export default async function updateLeaderboard() {
    const channelId = await getLeaderboardChannelId();
    if (!channelId || channelId === '') {
        console.log('❌ Канал для таблицы лидеров не установлен.');
        return;
    }

    const topSellers = await getTopSellers();

    if (!topSellers.length) {
        console.log('❌ Нет данных для обновления таблицы лидеров.');
        return;
    }

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Топ 30 продавцов за 30 дней')
        .setFields(
            {
                name: 'Ранг',
                value: topSellers.map((user, index) => (index + 1).toString() + '\n').join(''),
                inline: true,
            },
            {
                name: 'User',
                value: topSellers.map((user, index) =>  `<@${user.user_id}>` + '\n').join(''),
                inline: true
            },
            {
                name: 'Rating',
                value: topSellers.map((user, index) => `${user.rating.toFixed(2)}% (✔ ${user.positive_reviews} / ✘ ${user.negative_reviews})` + '\n').join(''),
                inline: true
            }
        )
        .setFooter({ text: 'Обновляется ежедневно' });

    const channel = await client.channels.fetch(channelId);
    let messageId = await getLeaderboardMessageId();

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
    await setLeaderboardMessageId(newMessage.id);
    console.log('✅ Таблица лидеров создана и сохранена!');
}
