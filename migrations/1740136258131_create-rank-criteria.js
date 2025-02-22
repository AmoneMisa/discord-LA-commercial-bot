/**
 * Defines the database migration for creating the "rank_criteria" table.
 *
 * The "rank_criteria" table includes the following columns:
 * - `id`: A unique identifier for each row.
 * - `top_seller`: An integer representing the top seller criteria with a default value of 100. This field is not nullable.
 * - `great_seller`: An integer representing the great seller criteria with a default value of 75. This field is not nullable.
 * - `good_seller`: An integer representing the good seller criteria with a default value of 50. This field is not nullable.
 * - `seller`: An integer representing the seller criteria with a default value of 25. This field is not nullable.
 *
 * @param {object} pgm - The database migration object provided by the migration framework.
 */
export const up  = (pgm) => {
    pgm.createTable("rank_criteria", {
        id: "id",
        top_seller: { type: "INTEGER", default: 100, notNull: true },
        great_seller: { type: "INTEGER", default: 75, notNull: true },
        good_seller: { type: "INTEGER", default: 50, notNull: true },
        seller: { type: "INTEGER", default: 25, notNull: true },
    });
};

/**
 * Function to define the database migration operation for reverting changes.
 * The `down` function is typically used to reverse modifications made by the `up` function in database migrations.
 *
 * @param {object} pgm - The migration object provided by the database migration framework, used to define operations.
 *                       In this case, the function drops the "rank_criteria" table from the database.
 */
export const down = (pgm) => {
    pgm.dropTable("rank_criteria");
};
