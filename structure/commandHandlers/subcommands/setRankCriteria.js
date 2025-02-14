import { MessageFlags } from 'discord.js';

export default async function setRankCriteria(interaction, pool) {
    const topSeller = interaction.options.getInteger('top_seller');
    const greatSeller = interaction.options.getInteger('great_seller');
    const goodSeller = interaction.options.getInteger('good_seller');
    const seller = interaction.options.getInteger('seller');

    await pool.query(`
        INSERT INTO rank_criteria (top_seller, great_seller, good_seller, seller)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET 
            top_seller = EXCLUDED.top_seller,
            great_seller = EXCLUDED.great_seller,
            good_seller = EXCLUDED.good_seller,
            seller = EXCLUDED.seller
    `, [topSeller, greatSeller, goodSeller, seller]);

    await interaction.reply({
        content: `✅ Установлены новые критерии для ролей:\n- **Топ-продавец**: ${topSeller}\n- **Отличный продавец**: ${greatSeller}\n- **Хороший продавец**: ${goodSeller}\n- **Продавец**: ${seller}`,
        flags: MessageFlags.Ephemeral
    });
}
