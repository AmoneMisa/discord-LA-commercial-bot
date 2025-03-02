import updateBetTable from "./updateBetTable.js";

export default async function (interaction, pool) {
    const [action, userId, eventId] = interaction.customId.split("_");

    if (!["bet_accept", "bet_reject"].includes(action)) return;

    const user = await interaction.guild.members.fetch(userId);
    if (!user) return interaction.reply({ content: "❌ Пользователь не найден.", ephemeral: true });

    if (action === "bet_accept") {
        const betData = await pool.query("SELECT * FROM bets WHERE user_id = $1 AND event_id = $2", [userId, eventId]);

        if (betData.rowCount > 0) {
            return interaction.reply({ content: "⚠️ Эта ставка уже была принята ранее.", ephemeral: true });
        }

        await pool.query(
            "INSERT INTO bets (user_id, event_id, choice, amount) VALUES ($1, $2, $3, $4)",
            [userId, eventId, betData.rows[0].choice, betData.rows[0].amount]
        );

        await updateBetTable(pool, interaction.channel, eventId);
        await interaction.update({ content: `✅ **Ставка принята!**`, components: [] });
        return;
    }

    if (action === "bet_reject") {
        await interaction.update({ content: `❌ **Ставка отклонена.**`, components: [] });
    }
}
