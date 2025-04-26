/**
 * Defines the database schema for raid management and subscriptions.
 *
 * The `up` function is executed to create the necessary database tables:
 *
 * - `raids`: Stores information about raids.
 *   - `id`: Primary key, generated automatically.
 *   - `raid_name`: A string field that stores the name of the raid. Cannot be null.
 *
 * - `raid_roles`: Stores roles associated with raids.
 *   - `id`: Primary key, generated automatically.
 *   - `role_name`: A string field that stores the name of the role. Cannot be null.
 *   - `role_id`: A unique string field that identifies a specific role. Cannot be null.
 *
 * - `available_raids`: Maps raids to specific roles that are available.
 *   - `id`: Primary key, generated automatically.
 *   - `raid_id`: A foreign key referencing the `raids(id)` field. Cannot be null.
 *   - `role_id`: A foreign key referencing the `raid_roles(role_id)` field. Cannot be null.
 *
 * - `subscriptions`: Tracks purchases of raid services between users.
 *   - `id`: Primary key, generated automatically.
 *   - `buyer_id`: A foreign key referencing the `users(user_id)` field, denoting the user buying the service. Cannot be null.
 *   - `seller_id`: A foreign key referencing the `users(user_id)` field, denoting the user providing the service. Cannot be null.
 *   - `raid_id`: A foreign key referencing the `available_raids(id)` field, linking to a specific available raid. Cannot be null.
 *
 * This function is typically run as part of a database migration to set up the schema.
 *
 * @param {object} pgm - An object provided by the database migration library, used to create and manage tables.
 */
export const up = (pgm) => {
    pgm.createTable("raids", {
        id: "id",
        raid_name: { type: "VARCHAR", notNull: true },
    });

    pgm.createTable("raid_roles", {
        id: "id",
        role_name: { type: "VARCHAR", notNull: true },
        role_id: { type: "VARCHAR", unique: true, notNull: true },
    });

    pgm.createTable("available_raids", {
        id: "id",
        raid_id: { type: "INTEGER", references: "raids(id)", notNull: true },
        role_id: { type: "VARCHAR", references: "raid_roles(role_id)", notNull: true },
    });

    pgm.createTable("subscriptions", {
        id: "id",
        buyer_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        seller_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        raid_id: { type: "INTEGER", references: "available_raids(id)", notNull: true },
    });
};

/**
 * Function to define the "down" migration step.
 * This function is executed to revert changes made in the "up" migration step, effectively undoing the schema modifications.
 *
 * @param {object} pgm - The object provided by the database migration framework to execute schema-altering commands.
 *
 * The function performs the following operations:
 * - Drops the "subscriptions" table.
 * - Drops the "available_raids" table.
 * - Drops the "raid_roles" table.
 * - Drops the "raids" table.
 */
export const down = (pgm) => {
    pgm.dropTable("subscriptions");
    pgm.dropTable("available_raids");
    pgm.dropTable("raid_roles");
    pgm.dropTable("raids");
};
