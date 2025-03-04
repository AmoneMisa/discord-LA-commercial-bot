import updateBetTable from "./updateBetTable.js";
import {getCurrentUserOdd, updateUsersOdds} from "../../dbUtils.js";
import {MessageFlags} from "discord.js";

export default async function (interaction, pool) {
    const [, action, userId, eventId, amount, target, server, nickname, isUpdate] = interaction.customId.split("_");

    if (!["accept", "reject"].includes(action)) {
        return;
    }

    const user = await interaction.guild.members.fetch(userId);
    if (!user) return interaction.reply({content: "❌ Пользователь не найден.", flags: MessageFlags.Ephemeral});

    if (action === "accept") {
        if (isUpdate) {
            const betResult = await pool.query("SELECT amount FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);
            if (betResult.rows[0].amount === parseInt(amount)) {
                return await interaction.reply({
                    content: "⚠️ Эта ставка уже была принята ранее.",
                    flags: MessageFlags.Ephemeral
                });
            }

            await pool.query("UPDATE bets SET amount = $1 WHERE user_id = $2", [amount, userId]);
        } else {
            const betResult = await pool.query("SELECT * FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);

            if (betResult.rowCount > 0) {
                return await interaction.reply({
                    content: "⚠️ Эта ставка уже была принята ранее.",
                    flags: MessageFlags.Ephemeral
                });
            }

            await pool.query(`INSERT INTO bets (event_id, user_id, nickname, amount, server, target, odds) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [eventId, userId, nickname, amount, server, target, await getCurrentUserOdd(pool, eventId, userId)]);
        }

        await updateUsersOdds(pool, eventId);
        await updateBetTable(pool, interaction.channel, 1);
        await interaction.reply({
            content: "✅ **Ставка принята!**",
            flags: MessageFlags.Ephemeral
        });
        const user = await interaction.guild.members.fetch(userId);
        await user.send({
            content: `✅ **Ставка на ${target} в количестве ${amount} принята!**`,
            flags: MessageFlags.Ephemeral
        });

        return;
    }

    if (action === "reject") {
        await interaction.reply({
            content: "❌ **Ставка отклонена.**",
            flags: MessageFlags.Ephemeral
        });

        const user = await interaction.guild.members.fetch(userId);
        await user.send({
            content: `❌ **Ставка на ${target} в количестве ${amount} отклонена.**`,
            flags: MessageFlags.Ephemeral
        });
    }
}
