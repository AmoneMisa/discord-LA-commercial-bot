/**
 * A database migration function that creates the "reviews" table.
 *
 * The table structure includes the following columns:
 * - `id`: Primary key, automatically generated.
 * - `target_user`: A string field referencing the `user_id` column in the "users" table, must not be null.
 * - `reviewer_id`: A string field referencing the `user_id` column in the "users" table, must not be null.
 * - `is_positive`: A boolean field indicating whether the review is positive, must not be null.
 * - `review_text`: A text field containing the content of the review.
 * - `timestamp`: A timestamp field with a default value set to the current time when the row is created, must not be null.
 *
 * @param {object} pgm - The database migration object used to define schema changes.
 */
export const up = (pgm) => {
    pgm.createTable("reviews", {
        id: "id",
        target_user: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        reviewer_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        is_positive: { type: "BOOLEAN", notNull: true },
        review_text: { type: "TEXT" },
        timestamp: { type: "TIMESTAMP", default: pgm.func("NOW()"), notNull: true },
    });
};

/**
 * Function that defines the "down" migration for rolling back database changes.
 * This function drops the "reviews" table from the database schema.
 *
 * @param {object} pgm - The migration object provided by the database migration tool.
 */
export const down = (pgm) => {
    pgm.dropTable("reviews");
};
