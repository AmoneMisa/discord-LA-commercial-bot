import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export default async function (interaction, pool) {
    const targetId = interaction.values[0];
    const userId = interaction.user.id;
    const nickname = interaction.message.content.match(/ник: \*\*(.+?)\*\*/)[1];
    const server = interaction.message.content.match(/сервер: \*\*(.+?)\*\*/)[1];
    const betAmount = parseInt(interaction.message.content.match(/ставка: \*\*(\d+)\*\*/)[1], 10);

    await pool.query(`INSERT INTO bets (user_id, target_user_id, amount, server) VALUES ($1, $2, $3, $4, $5)`,
        [userId, nickname, targetId, betAmount, server]);

    await interaction.update({
        content: `✅ Ваша ставка в **${betAmount}** на **${nickname}** (сервер **${server}**) принята!`,
        components: []
    });

    const settings = await pool.query("SELECT bet_info_private_channel_id FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0].value;

    if (channelId) {
        const adminChannel = interaction.guild.channels.fetch(channelId);
        await adminChannel.send({
            content: `🔔 **Новая ставка!**\n\n**Игрок:** <@${userId}>\n**Ник:** ${nickname}\n**Сервер:** ${server}\n**Ставка:** ${betAmount}\n**Цель:** <@${targetId}>`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`accept_bet_${userId}`).setLabel("✅ Принять").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`reject_bet_${userId}`).setLabel("❌ Отклонить").setStyle(ButtonStyle.Danger)
                )
            ]
        });
    } else {
        await interaction.user.send(`🔔 Ваша ставка в **${betAmount}** была отправлена на рассмотрение.`);
    }
}