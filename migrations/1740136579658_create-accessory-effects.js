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

export const down = (pgm) => {
    pgm.dropTable("accessory_effects");
};
