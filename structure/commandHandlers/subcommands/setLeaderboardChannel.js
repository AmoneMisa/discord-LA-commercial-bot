import { MessageFlags } from 'discord.js';
import { setLeaderboardChannelId } from '../dbUtils.js';
import updateLeaderboard from '../updateLeaderboard.js';

export default async function setLeaderboardChannel(interaction, pool, client) {
    if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
            content: '❌ У вас нет прав для этой команды!',
            flags: MessageFlags.Ephemeral
        });
    }

    const channel = interaction.options.getChannel('channel');
    if (!channel || channel.type !== 0) { // 0 = Text Channel
        return interaction.reply({
            content: '❌ Укажите корректный текстовый канал!',
            flags: MessageFlags.Ephemeral
        });
    }

    await setLeaderboardChannelId(pool, channel.id);

    await interaction.reply({
        content: `✅ Канал для таблицы лидеров установлен: <#${channel.id}>\nОбновляю таблицу...`,
        flags: MessageFlags.Ephemeral
    });

    await updateLeaderboard(client, pool);
}
