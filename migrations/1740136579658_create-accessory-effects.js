/**
 * Represents a migration script to create the "accessory_effects" table in the database.
 *
 * @param {object} pgm - The migration object provided by the database migration framework.
 *   It is used to define schema changes such as creating or modifying tables.
 *
 * The table "accessory_effects" consists of the following columns:
 * - id: A unique identifier for each accessory effect.
 * - category: The category of the accessory effect (string, cannot be null).
 * - effect_name: The name of the effect (string, cannot be null, must be unique).
 * - low_bonus: The bonus effect at a low level (string, cannot be null).
 * - mid_bonus: The bonus effect at a middle level (string, cannot be null).
 * - high_bonus: The bonus effect at a high level (string, cannot be null).
 */
export const up = (pgm) => {
    pgm.createTable("accessory_effects", {
        id: "id",
        category: { type: "VARCHAR", notNull: true },
        effect_name: { type: "VARCHAR", notNull: true, unique: true },
        low_bonus: { type: "VARCHAR", notNull: true },
        mid_bonus: { type: "VARCHAR", notNull: true },
        high_bonus: { type: "VARCHAR", notNull: true },
    });
};

/**
 * Reverts database schema changes by dropping the "accessory_effects" table.
 * This function is typically used when rolling back a migration in the database.
 *
 * @param {object} pgm - The migration object provided by the database migration tool (e.g., pg-migrate).
 */
export const down = (pgm) => {
    pgm.dropTable("accessory_effects");
};
