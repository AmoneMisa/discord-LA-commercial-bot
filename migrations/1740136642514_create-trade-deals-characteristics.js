/**
 * Defines the "up" migration for creating and modifying the "trade_deals_characteristics" table.
 *
 * This migration performs the following actions:
 * 1. Creates the "trade_deals_characteristics" table with the following columns:
 *    - `id`: Primary key.
 *    - `trade_id`: References the `id` column of the "trade_deals" table, cascading on delete and cannot be null.
 *    - `effect_name`: A non-nullable string representing the name of the effect.
 *    - `effect_value`: A non-nullable string representing the value of the effect.
 *
 * 2. Adds a foreign key constraint on the "effect_name" column that references the "effect_name" column
 *    in the "accessory_effects" table.
 *
 * 3. Enforces a uniqueness constraint to ensure that each combination of `trade_id` and `effect_name`
 *    is unique.
 *
 * @param {object} pgm - The database migration object used to define the schema changes.
 */
export const up = (pgm) => {
    pgm.createTable("trade_deals_characteristics", {
        id: "id",
        trade_id: { type: "INTEGER", references: "trade_deals(id)", onDelete: "CASCADE", notNull: true },
        effect_name: { type: "VARCHAR", notNull: true },
        effect_value: { type: "VARCHAR", notNull: true },
    });

    // Ограничение на существование эффекта в accessory_effects
    pgm.addConstraint(
        "trade_deals_characteristics",
        "fk_trade_deals_characteristics_effect_name",
        "FOREIGN KEY(effect_name) REFERENCES accessory_effects(effect_name)"
    );

    // Уникальность effect_name для одного trade_id
    pgm.addConstraint(
        "trade_deals_characteristics",
        "unique_trade_deals_characteristics",
        "UNIQUE(trade_id, effect_name)"
    );
};

/**
 * A function to migrate the database schema down by dropping the
 * "trade_deals_characteristics" table.
 *
 * @param {Object} pgm - The database migration object used to perform schema changes.
 */
export const down = (pgm) => {
    pgm.dropTable("trade_deals_characteristics");
};
