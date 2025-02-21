export const up  = (pgm) => {
    pgm.createTable("rank_criteria", {
        id: "id",
        top_seller: { type: "INTEGER", default: 100, notNull: true },
        great_seller: { type: "INTEGER", default: 75, notNull: true },
        good_seller: { type: "INTEGER", default: 50, notNull: true },
        seller: { type: "INTEGER", default: 25, notNull: true },
    });
};

export const down = (pgm) => {
    pgm.dropTable("rank_criteria");
};
