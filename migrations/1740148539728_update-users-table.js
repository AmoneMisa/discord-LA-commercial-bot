/**
 * Migration script to modify the "rating" column in the "users" table.
 *
 * This function updates the column type of "rating" to "REAL" in the database schema.
 * It uses the "pgm.alterColumn" method provided by the migration library to alter the column.
 * The 'using' clause ensures that the existing values in the "rating" column are correctly cast to the new type.
 *
 * @param {object} pgm - The migration object used to define database schema changes.
 */
export const up = (pgm) => {
    pgm.alterColumn("users", "rating", {
        type: "REAL",
        using: "rating::REAL",
    });
};

/**
 * Migration step to revert changes made in the schema for the "users" table.
 * Alters the "rating" column back to the INTEGER data type.
 *
 * @param {object} pgm - The migration object used to define schema modifications.
 */
export const down = (pgm) => {
    pgm.alterColumn("users", "rating", {
        type: "INTEGER",
        using: "rating::INTEGER",
    });
};
