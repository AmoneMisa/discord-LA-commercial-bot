/**
 * Defines a database migration script that creates a "factions" table and inserts default data.
 *
 * This function defines a database table named "factions" with the following columns:
 * - `id`: A serial primary key.
 * - `name`: A unique, non-null string with a maximum length of 255 characters.
 * - `created_at`: A non-null timestamp with a default value of the current time.
 *
 * Additionally, the function inserts three default values into the "factions" table:
 * - 'Sanguinum'
 * - 'Veni Vidi Vici'
 * - 'est Diaboli'
 *
 * @param {object} pgm - The migration object used to define schema changes and execute SQL commands.
 */
export const up = (pgm) => {
    pgm.createTable("factions", {
        id: {
            type: "serial",
            primaryKey: true
        },
        name: {
            type: "varchar(255)",
            notNull: true,
            unique: true
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("NOW()"),
            notNull: true
        }
    });

    // Создаем три фракции по умолчанию
    pgm.sql(`
        INSERT INTO factions (name) VALUES
        ('Sanguinum'),
        ('Veni Vidi Vici'),
        ('est Diaboli');
    `);
};

/**
 * Reverses the migration by dropping the "factions" table.
 *
 * @function
 * @param {Object} pgm - The database migration object that provides methods to define schema changes.
 */
export const down = (pgm) => {
    pgm.dropTable("factions");
};
