/**
 * Executes a database migration to insert new settings into the `settings` table.
 *
 * This migration adds two entries to the `settings` table with the keys
 * 'faction_leaderboard_channel_id' and 'faction_leaderboard_message_id',
 * both initialized with a value of null.
 *
 * @param {Object} pgm - The database migration tool object, typically provided by the migration framework.
 */
export const up = (pgm) => {
    pgm.sql(`
        INSERT INTO settings (key, value)
        VALUES ('faction_leaderboard_channel_id', ''),
               ('faction_leaderboard_message_id', ''),
               ('bet_info_private_channel_id', '')
    `);
};

/**
 * A function that defines the SQL operations to be executed during the "down" migration phase.
 * This function removes specific rows from the "settings" table based on the provided keys.
 *
 * @param {object} pgm - The migration object used to execute SQL statements.
 */
export const down = (pgm) => {
    pgm.sql(`
        DELETE
        FROM settings
        WHERE key = 'faction_leaderboard_channel_id';
    `);

    pgm.sql(`
        DELETE
        FROM settings
        WHERE key = 'faction_leaderboard_message_id';
    `);

    pgm.sql(`
        DELETE
        FROM settings
        WHERE key = 'bet_info_private_channel_id';
    `);
};
