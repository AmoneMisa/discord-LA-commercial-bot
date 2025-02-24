import {MessageFlags} from "discord.js";

/**
 * Handles the interaction for placing a bet on a specified event in the system.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object containing the user's input and command execution context.
 * @param {Object} pool - The database connection pool for executing queries.
 *
 * @throws Will return an error response if the event does not exist or has already ended.
 *
 * Interaction Parameters:
 * - event_id: Integer representing the ID of the betting event.
 * - target: User object representing the targeted user for the bet.
 * - item_id: Integer representing the ID of the item being wagered.
 * - amount: Integer specifying the amount being bet.
 *
 * Database Operations:
 * - Validates the existence and status of the specified event.
 * - Inserts a new record into the `bets` table for the given event.
 *
 * Interaction Responses:
 * - Sends an ephemeral error message if the event is invalid or completed.
 * - Sends a success message when the bet is successfully placed.
 */
export default async function (interaction, pool) {
    const eventId = interaction.options.getInteger('event_id');
    const targetUserId = interaction.options.getUser('target');
    const itemId = interaction.options.getInteger('item_id');
    const amount = interaction.options.getInteger('amount');

    const event = await pool.query(`SELECT * FROM bet_events WHERE id = $1 AND end_time > NOW()`, [eventId]);

    if (!event.rows.length) {
        return interaction.reply({ content: '🚫 Это событие уже завершено или не существует!',  flags: MessageFlags.Ephemeral });
    }

    await pool.query(
        `INSERT INTO bets (event_id, user_id, target_user_id, item_id, amount) 
         VALUES ($1, $2, $3, $4, $5)`,
        [eventId, interaction.user.id, targetUserId, itemId, amount]
    );

    await interaction.reply({ content: `✅ Ваша ставка успешно сделана!`,  flags: MessageFlags.Ephemeral });
}
