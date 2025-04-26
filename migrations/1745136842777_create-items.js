/**
 * Applies a database migration to create the "items" table and populate it with initial data.
 *
 * This function performs the following steps:
 * 1. Creates a new table named "items" with the following columns:
 *    - `id`: A unique identifier (`id` type).
 *    - `name`: A string representing the item's name, which cannot be null.
 *    - `category`: A string representing the item's category, which cannot be null.
 * 2. Inserts predefined rows into the "items" table with data about various items and their categories.
 *
 * @param {object} pgm - A migration object provided by the library to define database schema changes.
 */
export const up = (pgm) => {
    pgm.createTable("items", {
        id: "id",
        name: { type: "VARCHAR", notNull: true },
        category: { type: "VARCHAR", notNull: true },
    });

    pgm.sql(`
        INSERT INTO items (name, category) VALUES
        ('Серьга', 'Аксессуар'),
        ('Кольцо', 'Аксессуар'),
        ('Ожерелье', 'Аксессуар'),
        ('Самоцвет (Урон)', 'Самоцвет'),
        ('Самоцвет (КД)', 'Самоцвет');
    `);
};

/**
 * A function representing a migration step to revert a database schema change.
 * This function drops the "items" table from the database.
 *
 * @function
 * @param {Object} pgm - The database migration object provided by the migration framework.
 */
export const down = (pgm) => {
    pgm.dropTable("items");
};
