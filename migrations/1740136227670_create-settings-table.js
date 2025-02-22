/**
 * Defines the migration script for creating and populating the "settings" table in the database.
 *
 * The "settings" table is designed to store configuration key-value pairs. Each configuration key is unique
 * and serves as a primary key in the table. The table also populates the initial settings with default values
 * using SQL INSERT statements.
 *
 * @param {object} pgm - The PostgreSQL migration object, which provides methods for defining database changes.
 */
export const up = (pgm) => {
    pgm.createTable("settings", {
        key: { type: "VARCHAR", primaryKey: true },
        value: { type: "VARCHAR", default: "", notNull: true },
    });

    pgm.sql(`
        INSERT INTO settings (key, value) VALUES
        ('cooldown_minutes', '20'),
        ('cooldown_enabled', 'true'),
        ('allow_self_voting', 'false'),
        ('rank_update_frequency', '1d'),
        ('leaderboard_channel_id', ''),
        ('leaderboard_message_id', '');
    `);
};

/**
 * Function to reverse the database migration by dropping the "settings" table.
 *
 * @param {object} pgm - The database migration object providing methods to modify database schema.
 */
export const down = (pgm) => {
    pgm.dropTable("settings");
};
