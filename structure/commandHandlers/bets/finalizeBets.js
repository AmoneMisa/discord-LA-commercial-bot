import {MessageFlags} from "discord.js";

/**
 * Finalizes the betting process for a specified event by determining winners and recording the results.
 *
 * @param {Object} interaction - The interaction object containing command details and user context.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} A promise that resolves when the betting process is finalized and a response is sent.
 */
export default async function finalizeBets(interaction, pool) {
    const eventId = interaction.options.getInteger('event_id');

    const event = await pool.query(`SELECT * FROM bet_events WHERE id = $1`, [eventId]);

    if (!event.rows.length) {
        return interaction.reply({ content: '🚫 Это событие не найдено!', flags: MessageFlags.Ephemeral });
    }

    // Выбираем случайного победителя (можно сделать более сложную механику)
    const bets = await pool.query(`SELECT * FROM bets WHERE event_id = $1 ORDER BY RANDOM() LIMIT 20`, [eventId]);

    for (const bet of bets.rows) {
        await pool.query(
            `INSERT INTO bet_results (event_id, winner_id, prize_item_id) 
             VALUES ($1, $2, $3)`,
            [eventId, bet.user_id, bet.item_id]
        );
    }

    await interaction.reply({ content: `🏆 Итоги ставок подведены!`, ephemeral: false });
}
