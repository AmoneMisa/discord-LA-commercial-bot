/**
 * Creates the "roles" table in the database schema.
 * The table is designed to store role-related information with specific constraints.
 *
 * @param {object} pgm - The database migration object that provides methods to define schema changes.
 *
 * The "roles" table includes the following columns:
 * - id: Primary key column with a default id type.
 * - role_name: A VARCHAR column that must be unique and cannot be null.
 * - role_id: A VARCHAR column that must be unique.
 * - required_rating: An INTEGER column with a default value of 0 and cannot be null.
 * - min_reviews: An INTEGER column with a default value of 0 and cannot be null.
 * - min_positive_reviews: An INTEGER column with a default value of 0 and cannot be null.
 * - min_negative_reviews: An INTEGER column with a default value of 0 and cannot be null.
 */
export const up  = (pgm) => {
    pgm.createTable("roles", {
        id: "id",
        role_name: { type: "VARCHAR", unique: true, notNull: true },
        role_id: { type: "VARCHAR", unique: true },
        required_rating: { type: "INTEGER", default: 0, notNull: true },
        min_reviews: { type: "INTEGER", default: 0, notNull: true },
        min_positive_reviews: { type: "INTEGER", default: 0, notNull: true },
        min_negative_reviews: { type: "INTEGER", default: 0, notNull: true },
    });
};

/**
 * A function to handle the migration down process for the "roles" table.
 * This function is typically used to revert changes made in the database schema
 * during the migration up process. It drops the "roles" table from the database.
 *
 * @param {Object} pgm - A migration object provided by the database migration tool
 *                        that facilitates schema changes.
 */
export const down = (pgm) => {
    pgm.dropTable("roles");
};
