/**
 * Defines the 'up' migration function for creating and modifying the database schema
 * related to blocked subscriptions.
 *
 * This function applies the following changes:
 * 1. Creates a new table named 'blocked_subscriptions'.
 *    - The table consists of the following columns:
 *        - `id`: A serial primary key.
 *        - `user_id`: A varchar representing the user's ID. It references 'users(id)'
 *          and applies cascading deletion when the associated user is removed.
 *        - `block_type`: A varchar(10) column enforcing a check constraint to
 *          ensure the value is either 'reviewer' or 'receiver'.
 *        - `blocked_until`: A timestamp indicating the end of the block duration. It is optional.
 *        - `created_at`: A timestamp column defaulted to the current time and cannot be null.
 * 2. Adds an index on the 'user_id' column for optimized query performance.
 *
 * @param {object} pgm The database migration object.
 */
export const up = (pgm) => {
    pgm.createTable("blocked_subscriptions", {
        id: {
            type: "serial",
            primaryKey: true,
        },
        user_id: {
            type: "varchar",
            notNull: true,
            references: "users(user_id)",
            onDelete: "CASCADE"
        },
        block_type: {
            type: "varchar(10)",
            notNull: true,
            check: "block_type IN ('reviewer', 'receiver')"
        },
        blocked_until: {
            type: "timestamp",
            notNull: false,
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("NOW()"),
            notNull: true
        }
    });

    // Создаём индекс для быстрого поиска по user_id
    pgm.createIndex("blocked_subscriptions", ["user_id"]);
};

/**
 * Function to handle rollback operations for database migrations.
 *
 * This function drops the "blocked_subscriptions" table from the database.
 *
 * @param {object} pgm - The migration object provided by the database migration tool.
 */
export const down = (pgm) => {
    pgm.dropTable("blocked_subscriptions");
};