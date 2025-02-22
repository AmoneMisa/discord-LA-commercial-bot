/**
 * Function to define database migrations for creating two tables:
 * "blocked_reviewers" and "blocked_receivers".
 *
 * The "blocked_reviewers" table contains:
 * - "user_id": A VARCHAR field that is a primary key and references the "user_id" column in the "users" table.
 * - "unblock_time": A TIMESTAMP field indicating the time when a user is no longer blocked.
 *
 * The "blocked_receivers" table contains:
 * - "user_id": A VARCHAR field that is a primary key and references the "user_id" column in the "users" table.
 * - "unblock_time": A TIMESTAMP field indicating the time when a user is no longer blocked.
 *
 * @param {object} pgm - An instance of the database migration tool used to define and manage schema changes.
 */
export const up = (pgm) => {
    pgm.createTable("blocked_reviewers", {
        user_id: { type: "VARCHAR", references: "users(user_id)", primaryKey: true },
        unblock_time: { type: "TIMESTAMP" },
    });

    pgm.createTable("blocked_receivers", {
        user_id: { type: "VARCHAR", references: "users(user_id)", primaryKey: true },
        unblock_time: { type: "TIMESTAMP" },
    });
};

/**
 * Represents a migration step to revert database schema changes by dropping specified tables.
 *
 * @callback down
 * @param {object} pgm - The database migration framework instance.
 * This parameter is used to execute migration commands such as dropping tables.
 *
 * Functionality:
 * - Drops the "blocked_reviewers" table from the database.
 * - Drops the "blocked_receivers" table from the database.
 */
export const down = (pgm) => {
    pgm.dropTable("blocked_reviewers");
    pgm.dropTable("blocked_receivers");
};
