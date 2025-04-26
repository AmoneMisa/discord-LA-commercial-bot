/**
 * A migration function that defines the schema for the `activity_points` table in the database.
 *
 * This table is used to store activity point records for users. It includes the following columns:
 * - `user_id`: A primary key referencing the `user_id` column in the `users` table. On deletion of the referenced user, the corresponding record is also deleted (CASCADE).
 * - `points`: An integer column that stores the number of points associated with a user. Defaults to 0 and must not be null.
 * - `last_reset`: A timestamp column that stores the last reset date and time for the points. Defaults to the current timestamp and must not be null.
 *
 * @param {Object} pgm - The migration object provided by the database migration tool to define and manipulate schemas.
 */
export const up = (pgm) => {
    pgm.createTable("activity_points", {
        user_id: {
            type: "varchar",
            primaryKey: true,
            references: "users(user_id)",
            onDelete: "CASCADE"
        },
        points: {
            type: "integer",
            notNull: true,
            default: 0
        },
        last_reset: {
            type: "timestamp",
            default: pgm.func("NOW()"),
            notNull: true
        }
    });
};

/**
 * Reverts a database schema migration by dropping the "activity_points" table.
 *
 * @param {object} pgm - The migration helper object provided by the database migration framework.
 */
export const down = (pgm) => {
    pgm.dropTable("activity_points");
};
