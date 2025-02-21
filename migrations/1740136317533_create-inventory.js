export const up = (pgm) => {
    pgm.createTable("inventory", {
        id: "id",
        user_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        trade_type: { type: "VARCHAR(3)", notNull: true, check: "trade_type IN ('WTT', 'WTS', 'WTB')" },
        item_offer: { type: "TEXT", notNull: true },
        item_request: { type: "TEXT" },
        offer_level: { type: "INTEGER", check: "offer_level BETWEEN 1 AND 10" },
        request_level: { type: "INTEGER", check: "request_level BETWEEN 1 AND 10" },
        price: { type: "INTEGER", check: "price >= 0" },
        negotiable: { type: "BOOLEAN", default: false, notNull: true },
        server: { type: "VARCHAR(20)", check: "server IN ('Альдеран', 'Кратос', 'Альдеран и Кратос')", default: 'Кратос' },
        offer_rarity: { type: "VARCHAR(20)", check: "offer_rarity IN ('Реликтовый', 'Древний')" },
        request_rarity: { type: "VARCHAR(20)", check: "request_rarity IN ('Реликтовый', 'Древний')" },
        expires_at: { type: "TIMESTAMP", default: pgm.func("NOW() + INTERVAL '3 days'"), notNull: true },
        notified: { type: "BOOLEAN", default: false, notNull: true },
    });
};

export const down = (pgm) => {
    pgm.dropTable("inventory");
};
