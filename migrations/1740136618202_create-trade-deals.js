exports.up = (pgm) => {
    pgm.createTable("trade_deals", {
        id: "id",
        buyer_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        seller_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        item_offered: { type: "VARCHAR", notNull: true },
        item_requested: { type: "VARCHAR" },
        offer_level: { type: "INTEGER", check: "offer_level BETWEEN 1 AND 10" },
        request_level: { type: "INTEGER", check: "request_level BETWEEN 1 AND 10" },
        price: { type: "INTEGER", check: "price >= 0" },
        trade_type: { type: "VARCHAR(3)", check: "trade_type IN ('WTT', 'WTS', 'WTB')", notNull: true },
        server: { type: "VARCHAR(20)", check: "server IN ('Альдеран', 'Кратос', 'Альдеран и Кратос')", notNull: true },
        offer_rarity: { type: "VARCHAR(20)", check: "offer_rarity IN ('Реликтовый', 'Древний')" },
        request_rarity: { type: "VARCHAR(20)", check: "request_rarity IN ('Реликтовый', 'Древний')" },
        timestamp: { type: "TIMESTAMP", default: pgm.func("NOW()"), notNull: true },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("trade_deals");
};
