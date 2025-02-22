/**
 * Defines the migration script for creating and modifying the "inventory_characteristics" table.
 *
 * The `up` function performs the following actions:
 * 1. Creates the "inventory_characteristics" table with the following columns:
 *    - `id`: Primary key, auto-generated.
 *    - `inventory_id`: Foreign key referencing the `id` column of the "inventory" table,
 *                      with "CASCADE" behavior on deletion. This column is required.
 *    - `effect_name`: A string column that is required.
 *    - `effect_value`: A string column that is required.
 * 2. Adds a foreign key constraint to ensure that `effect_name` in this table corresponds
 *    to an existing `effect_name` in the "accessory_effects" table.
 * 3. Adds a unique constraint enforcing that each `inventory_id` and `effect_name` pair
 *    must be unique, preventing duplicate entries for a given inventory item.
 */
export const up = (pgm) => {
    pgm.createTable("inventory_characteristics", {
        id: "id",
        inventory_id: { type: "INTEGER", references: "inventory(id)", onDelete: "CASCADE", notNull: true },
        effect_name: { type: "VARCHAR", notNull: true },
        effect_value: { type: "VARCHAR", notNull: true },
    });

    // Устанавливаем ограничение, что effect_name должен существовать в accessory_effects(effect_name)
    pgm.addConstraint(
        "inventory_characteristics",
        "fk_inventory_characteristics_effect_name",
        "FOREIGN KEY(effect_name) REFERENCES accessory_effects(effect_name)"
    );

    // Запрещаем дублирование effect_name для одного inventory_id
    pgm.addConstraint(
        "inventory_characteristics",
        "unique_inventory_characteristics",
        "UNIQUE(inventory_id, effect_name)"
    );
};

/**
 * The `down` function is a migration step used to revert database schema changes.
 * This specific implementation drops the "inventory_characteristics" table from the database.
 *
 * @function
 * @param {object} pgm - The migration object provided by the database migration framework.
 */
export const down = (pgm) => {
    pgm.dropTable("inventory_characteristics");
};
