/**
 * Defines the database schema changes for setting up tables related to betting events and their associated data.
 *
 * This function is intended for use in a database migration system, creating the necessary tables to manage betting
 * events, bets, and results. It organizes data related to events, individual bets, and outcomes, and establishes the
 * required relationships between them.
 *
 * Functionality:
 * - Creates the "bet_events" table to store information about betting events.
 * - Creates the "bets" table to record individual bets placed on events.
 * - Creates the "bet_results" table to store results for completed betting events.
 * - Inserts default settings for tracking betting leaderboard information.
 *
 * Table Definitions:
 * - **bet_events**: Represents details of a betting event (e.g., name, description, start time, end time).
 * - **bets**: Contains individual bets data, linking to users, items, and events.
 * - **bet_results**: Holds the results for a betting event, including the winner and prize information.
 *
 * Constraints and Foreign Keys:
 * - Each table includes relationships and cascade rules for managing data integrity.
 * - Ensures "bets" and "bet_results" are linked to their respective "bet_events".
 * - Enforces references to users, items, and events with appropriate `onDelete` actions.
 *
 * Example:
 * This function is used in systems facilitating betting events with structured schemas, enabling clear
 * tracking of events, bets, and their results.
 *
 * @param {object} pgm - Migration builder object provided by the database migration framework.
 */
export const up = (pgm) => {
    // Таблица событий ставок
    pgm.createTable("bet_events", {
        id: { type: "serial", primaryKey: true },
        name: { type: "varchar(255)", notNull: true },
        description: { type: "text", notNull: true },
        start_time: { type: "timestamp", notNull: true },
        end_time: { type: "timestamp", notNull: true },
        created_at: { type: "timestamp", default: pgm.func("NOW()"), notNull: true }
    });

    // Таблица ставок
    pgm.createTable("bets", {
        id: { type: "serial", primaryKey: true },
        event_id: { type: "integer", references: "bet_events(id)", onDelete: "CASCADE", notNull: true },
        user_id: { type: "varchar", references: "users(user_id)", onDelete: "CASCADE", notNull: true },
        target_user_id: { type: "varchar", references: "users(user_id)", onDelete: "CASCADE", notNull: false },
        item_id: { type: "integer", references: "bet_items(id)", onDelete: "SET NULL", notNull: false },
        amount: { type: "integer", notNull: true, check: "amount > 0" },
        odds: { type: "decimal(5,2)", notNull: true, check: "odds > 0" },
        created_at: { type: "timestamp", default: pgm.func("NOW()"), notNull: true }
    });

    // Таблица итогов ставок
    pgm.createTable("bet_results", {
        id: { type: "serial", primaryKey: true },
        event_id: { type: "integer", references: "bet_events(id)", onDelete: "CASCADE", notNull: true },
        winner_id: { type: "varchar", references: "users(user_id)", onDelete: "SET NULL", notNull: true },
        prize_item_id: { type: "integer", references: "bet_items(id)", onDelete: "SET NULL", notNull: false },
        created_at: { type: "timestamp", default: pgm.func("NOW()"), notNull: true }
    });

    // Таблица предметов для ставок
    pgm.createTable("bet_items", {
        id: { type: "serial", primaryKey: true },
        name: { type: "varchar", notNull: true },
        available: { type: "boolean", notNull: true, default: true },
    });

    pgm.sql(`
        INSERT INTO settings (key, value)
        VALUES ('bet_leaderboard_channel_id', ''),
               ('bet_leaderboard_message_id', '')
    `);
};

/**
 * Handles database operations for rolling back betting-related tables and settings during a downgrade.
 *
 * @param {object} pgm - The migration object used for database schema changes.
 *                        Provides methods for manipulating the database schema and executing SQL statements.
 *
 * This function removes the following tables if they exist:
 * - bet_results
 * - bets
 * - bet_events
 *
 * Additionally, it deletes specific settings records from the `settings` table:
 * - Records with the key 'bet_leaderboard_channel_id'
 * - Records with the key 'bet_leaderboard_message_id'
 */
export const down = (pgm) => {
    pgm.dropTable("bet_results");
    pgm.dropTable("bets");
    pgm.dropTable("bet_events");

    pgm.sql(`
        DELETE
        FROM settings
        WHERE key = 'bet_leaderboard_channel_id';
    `);

    pgm.sql(`
        DELETE
        FROM settings
        WHERE key = 'bet_leaderboard_message_id';
    `);
};
