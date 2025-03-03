import updateBetTable from "./updateBetTable.js";
import {updateUsersOdds} from "../../dbUtils.js";
import {MessageFlags} from "discord.js";

export default async function (interaction, pool) {
    const [, action, userId, eventId, amount, target, isUpdate] = interaction.customId.split("_");

    if (!["accept", "reject"].includes(action)) {
        return;
    }

    const user = await interaction.guild.members.fetch(userId);
    if (!user) return interaction.reply({content: "❌ Пользователь не найден.", flags: MessageFlags.Ephemeral});

    if (action === "accept") {
        if (isUpdate) {
            await pool.query("UPDATE bets SET amount = $1 WHERE user_id = $2", [amount, userId]);
        } else {
            const betData = await pool.query("SELECT * FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);

            if (betData.rowCount > 0) {
                return interaction.reply({
                    content: "⚠️ Эта ставка уже была принята ранее.",
                    flags: MessageFlags.Ephemeral
                });
            }

            await pool.query(
                "INSERT INTO bets (user_id, event_id, target, amount) VALUES ($1, $2, $3, $4)",
                [userId, eventId, target, amount]
            );
        }

        await updateUsersOdds(pool, eventId);
        await updateBetTable(pool, interaction.channel, 1);
        await interaction.reply({
            content: "✅ **Ставка принята!**",
            flags: MessageFlags.Ephemeral
        });

        return;
    }

    if (action === "reject") {
        await interaction.reply({
            content: "❌ **Ставка отклонена.**",
            flags: MessageFlags.Ephemeral
        });
    }
}
