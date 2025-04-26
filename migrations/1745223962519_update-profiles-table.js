/**
 * A migration function that adds a new column to the "profiles" table.
 *
 * This variable is a function intended to modify the database schema by adding a
 * new column named "server" to the "profiles" table. The column is of type "varchar",
 * has a default value of 'кратос', and cannot be null.
 *
 * @param {object} pgm - The migration object provided by the migration framework,
 *                       used to define schema changes.
 */
export const up = (pgm) => {
    pgm.addColumns("profiles", {
        server: {type: "varchar", default: 'кратос', notNull: true},
    });
};

/**
 * A function called `down` that removes specified columns from the "profiles" table.
 *
 * @param {object} pgm - The database migration object used to modify database schema.
 *                       It provides methods for altering tables and columns.
 *
 * The function is used to revert changes made in a migration by dropping the "server" column
 * from the "profiles" table in the database.
 */
export const down = (pgm) => {
    pgm.dropColumns("profiles",
        ["server"]
    );
};
