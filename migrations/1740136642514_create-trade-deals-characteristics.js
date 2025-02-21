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

export const down = (pgm) => {
    pgm.dropTable("trade_deals_characteristics");
};
