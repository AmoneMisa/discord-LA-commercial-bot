import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getRaidName} from "../../dbUtils.js";

export default async function(interaction, pool, client) {
    const raidName = interaction.options.getString('raid');
    const raidId = await pool.query(`SELECT raid_id FROM raids WHERE raid_name = $1`, [raidName]);

    if (!raidId) {
        console.error("Ошибка при поиске рейда в базе:", raidName, raidId.rows[0].id);
        return await interaction.reply('Рейд не найден!');
    }

    const subscribers = await pool.query(`
                SELECT buyer_id FROM subscriptions
                WHERE seller_id = $1
                  AND raid_id = $2
            `, [interaction.user.id, raidId.rows[0].id]);

    for (const subscriber of subscribers.rows) {
        const user = await client.users.fetch(subscriber.buyer_id);
        if (user) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`raid_buy_${interaction.user.id}_${raidId}`)
                        .setLabel('Хочу купить')
                        .setStyle(ButtonStyle.Primary)
                );

            const raidName = await getRaidName(pool, raidId);

            await user.send({
                content: `🔔 Игрок **<@${interaction.user.id}>** набирает группу на **${raidName}**!)`,
                components: [row], flags: MessageFlags.Ephemeral
            }).then((message) => {
                setTimeout(() => {
                    message.edit({content: `Время для ответа истекло`, components: [], flags: MessageFlags.Ephemeral});
                }, 1000 * 60 * 5);
            });
        }
    }
}