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

export const down = (pgm) => {
    pgm.dropTable("inventory_characteristics");
};
