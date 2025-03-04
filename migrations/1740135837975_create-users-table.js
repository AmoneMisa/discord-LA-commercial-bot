/**
 * Defines the database migration function to create a "users" table with specified columns.
 *
 * @param {object} pgm - The migration object provided by the database migration tool.
 *
 * The "users" table contains the following columns:
 * - user_id: A VARCHAR field that serves as the primary key.
 * - rating: An INTEGER field with a default value of 0 and cannot be null.
 * - positive_reviews: An INTEGER field with a default value of 0 and cannot be null.
 * - negative_reviews: An INTEGER field with a default value of 0 and cannot be null.
 */
export const up = (pgm) => {
    pgm.createTable("users", {
        user_id: { type: "VARCHAR", primaryKey: true },
        rating: { type: "INTEGER", default: 0, notNull: true },
        positive_reviews: { type: "INTEGER", default: 0, notNull: true },
        negative_reviews: { type: "INTEGER", default: 0, notNull: true }
    });
};

/**
 * Function to handle the downward database migration.
 * This function is typically used in a migration framework to define actions for rolling back changes made in the corresponding upward migration.
 *
 * @param {object} pgm - The migration object provided by the database migration framework.
 * It is used to define schema operations such as dropping tables, altering columns, etc.
 */
export const down = (pgm) => {
    pgm.dropTable("users");
};

