/**
 * Migration function to create the "characters" table.
 *
 * The "characters" table consists of the following columns:
 * - id: Primary key with an auto-incrementing ID.
 * - profile_id: A foreign key referencing the "profiles" table's "id" column. Deletion of a profile cascades to its related characters. This field is mandatory.
 * - class_name: Stores the class name of the character as a non-nullable string.
 * - char_name: Unique, non-nullable string representing the character's name.
 * - gear_score: Non-nullable floating-point number representing the character's gear score.
 *
 * @param {object} pgm - The migration object used for defining database schema changes.
 */
export const up = (pgm) => {
    pgm.createTable("characters", {
        id: "id",
        profile_id: { type: "INTEGER", references: "profiles(id)", onDelete: "CASCADE", notNull: true },
        class_name: { type: "VARCHAR", notNull: true },
        char_name: { type: "VARCHAR", unique: true, notNull: true },
        gear_score: { type: "FLOAT", notNull: true },
    });
};

/**
 * A function that defines the operations to be executed when rolling back a migration.
 *
 * @function down
 * @param {object} pgm - The migration builder object used to define operations for rolling back the migration.
 * It provides methods to reverse changes made to the database schema, such as dropping tables.
 */
export const down = (pgm) => {
    pgm.dropTable("characters");
};
