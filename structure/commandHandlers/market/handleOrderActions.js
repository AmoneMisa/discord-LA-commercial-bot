export default async function(interaction, pool) {
    const [_, action, buyerId, lotId, goldAmountRaw] = interaction.customId.split("_");
    const buyer = await interaction.client.users.fetch(buyerId);
    const lot = (await pool.query("SELECT * FROM marketplace_lots WHERE id = $1", [lotId])).rows[0];

    if (!lot) {
        return;
    }

    if (action === "accept") {
        const remaining = lot.gold_amount - parseInt(goldAmountRaw);

        if (remaining <= 0) {
            await pool.query("DELETE FROM marketplace_lots WHERE id = $1", [lotId]);
        } else {
            await pool.query("UPDATE marketplace_lots SET gold_amount = $1 WHERE id = $2", [remaining, lotId]);
        }

        await buyer.send("✅ Ваша заявка на покупку золота выполнена!");
        await interaction.update({ content: "✅ Сделка успешно завершена.", components: [] });
    }

    if (action === "reject") {
        await buyer.send("❌ Продавец отклонил ваш запрос на покупку.");
        await interaction.update({ content: "❌ Сделка отклонена.", components: [] });
    }
}
