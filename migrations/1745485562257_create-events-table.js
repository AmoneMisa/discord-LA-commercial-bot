/**
 * Function to define a database migration step for creating the "events" table.
 *
 * This function creates the "events" table with the following columns:
 * - `id`: A serial primary key.
 * - `message_id`: A non-null varchar field with a maximum length of 255 characters, used for storing message identifiers.
 * - `start_time`: A non-null timestamp field indicating the start time of the event.
 * - `end_time`: A non-null timestamp field indicating the end time of the event.
 * - `registration_channel`: A varchar field with a maximum length of 255 characters, used to store the registration channel and allows setting null values when deleted.
 *
 * @param {object} pgm - Database migration helper object for defining and applying schema changes.
 */
export const up = (pgm) => {
    pgm.createTable("events", {
        id: {
            type: "serial",
            primaryKey: true
        },
        message_id: {
            type: "varchar(255)",
            notNull: true
        },
        start_time: {
            type: "timestamp",
            notNull: true
        },
        end_time: {
            type: "timestamp",
            notNull: true
        },
        registration_channel: {
            type: "varchar(255)",
            onDelete: "SET NULL"
        }
    });
};

/**
 * Function to execute the "down" database migration operation.
 * This function is typically used to reverse a migration by
 * removing the "events" table from the database schema.
 *
 * @param {object} pgm - The migration tool object used to perform database schema transformations.
 */
export const down = (pgm) => {
    pgm.dropTable("events");
};
