/**
 * Performs a database migration to populate the "roles" table with predefined role entries.
 *
 * The function utilizes SQL to insert specific roles with associated attributes such as
 * role name, required rating, minimum reviews, minimum positive reviews, and minimum
 * negative reviews. If a role with the same name already exists in the table, the function
 * avoids duplication by skipping the insertion for that role.
 *
 * Roles inserted:
 * - 'Топ-продавец' (Top Seller): requires 100 rating, 100 reviews, 80 positive reviews, and 0 negative reviews.
 * - 'Отличный продавец' (Excellent Seller): requires 75 rating, 80 reviews, 50 positive reviews, and 0 negative reviews.
 * - 'Хороший продавец' (Good Seller): requires 50 rating, 30 reviews, 15 positive reviews, and 0 negative reviews.
 * - 'Продавец' (Seller): no specific requirements (default values set to 0).
 *
 * @param {object} pgm - The migration object that provides the `sql` method for executing raw SQL statements.
 */
export const up = (pgm) => {
    pgm.sql(`
        INSERT INTO roles (role_name, required_rating, min_reviews, min_positive_reviews, min_negative_reviews)
        VALUES ('Топ-продавец', 100, 100, 80, 0),
               ('Отличный продавец', 75, 80, 50, 0),
               ('Хороший продавец', 50, 30, 15, 0),
               ('Продавец', 0, 0, 0, 0)
        ON CONFLICT (role_name) DO NOTHING;
    `);
}

/**
 * An asynchronous function intended to handle the "down" migration step in a database migration script.
 * The function defines the operations to be executed when rolling back a migration, specifically
 * the removal of the "roles" table from the database schema.
 *
 * @param {object} pgm - The migration object provided by the database migration tool,
 *                       typically used to define schema changes.
 */
export const down = async (pgm) => {
    pgm.dropTable('roles');
};