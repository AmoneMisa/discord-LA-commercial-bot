/**
 * This variable defines a function to create a database table named "users_factions".
 *
 * The table represents a relationship between users and factions with the following columns:
 *
 * - `user_id`:
 *   - Type: varchar
 *   - Acts as the primary key
 *   - References the `user_id` column in the "users" table
 *   - On delete: cascade
 *
 * - `faction_id`:
 *   - Type: integer
 *   - References the `id` column in the "factions" table
 *   - On delete: set null
 *
 * - `joined_at`:
 *   - Type: timestamp
 *   - Defaults to the current timestamp (using `NOW()`)
 *   - Cannot be null
 *
 * The function uses the specified parameter `pgm` to define the structure and constraints of the table.
 */
export const up = (pgm) => {
    pgm.createTable("users_factions", {
        user_id: {
            type: "varchar",
            primaryKey: true,
            references: "users(user_id)",
            onDelete: "CASCADE"
        },
        faction_id: {
            type: "integer",
            references: "factions(id)",
            onDelete: "SET NULL"
        },
        joined_at: {
            type: "timestamp",
            default: pgm.func("NOW()"),
            notNull: true
        }
    });
};

/**
 * A function that defines the "down" database migration step.
 *
 * This function is intended to reverse changes applied in a database migration,
 * specifically to drop the "users_factions" table from the database schema.
 *
 * @param {object} pgm - The database migration object provided by the migration framework.
 *                        It is used to define schema changes.
 */
export const down = (pgm) => {
    pgm.dropTable("users_factions");
};
