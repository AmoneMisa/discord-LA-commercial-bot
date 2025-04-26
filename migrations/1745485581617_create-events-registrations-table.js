/**
 * Represents a migration function to set up a database table named "event_registrations".
 *
 * This function is executed to create the "event_registrations" table with the following structure:
 * - id: A unique identifier for each registration, set as the primary key.
 * - event_id: A foreign key referencing the "id" column in the "events" table. Deletions on the referenced table will cascade.
 * - user_id: A foreign key referencing the "user_id" column in the "users" table. Deletions on the referenced table will cascade.
 * - registered_at: A timestamp representing the time of registration, defaulting to the current time.
 * - registration_message: An optional text message associated with the registration.
 *
 * Additionally, a unique index is created on the combination of the "event_id" and "user_id" columns.
 *
 * @param {object} pgm - The PostgreSQL migration object provided by the migration framework.
 */
export const up = (pgm) => {
    pgm.createTable("event_registrations", {
        id: {
            type: "serial",
            primaryKey: true
        },
        event_id: {
            type: "integer",
            notNull: true,
            references: "events(id)",
            onDelete: "CASCADE"
        },
        user_id: {
            type: "varchar(255)",
            notNull: true,
            references: "users(user_id)",
            onDelete: "CASCADE"
        },
        registered_at: {
            type: "timestamp",
            default: pgm.func("NOW()"),
            notNull: true
        },
        registration_message: {
            type: "varchar(255)",
            notNull: false
        }
    });

    pgm.createIndex("event_registrations", ["event_id", "user_id"], { unique: true });
};

/**
 * A function to perform a database migration that rolls back changes.
 * This specific migration function drops the "event_registrations" table
 * from the database schema.
 *
 * @param {Object} pgm - The database migration object provided by the migration library.
 */
export const down = (pgm) => {
    pgm.dropTable("event_registrations");
};
