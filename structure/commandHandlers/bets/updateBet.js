import updateBetTable from "./updateBetTable.js";

export default async function updateBet(interaction, pool) {
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger("amount");

    const bet = await pool.query("SELECT * FROM bets WHERE user_id = $1", [userId]);

    if (bet.rowCount === 0) {
        return interaction.reply({ content: "❌ У вас нет активных ставок на это событие.", ephemeral: true });
    }

    if (amount <= bet.rows[0].amount) {
        return interaction.reply({ content: "❌ Вы можете только увеличить свою ставку!", ephemeral: true });
    }

    await pool.query("UPDATE bets SET amount = $1 WHERE user_id = $2", [amount, userId]);
    await updateBetTable(pool, interaction.channel);
    return await interaction.reply({ content: `✅ Ваша ставка увеличена до **${amount}**!`, ephemeral: true });
}