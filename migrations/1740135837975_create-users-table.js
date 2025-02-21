export const up = (pgm) => {
    pgm.createTable("users", {
        user_id: { type: "VARCHAR", primaryKey: true },
        rating: { type: "INTEGER", default: 0, notNull: true },
        positive_reviews: { type: "INTEGER", default: 0, notNull: true },
        negative_reviews: { type: "INTEGER", default: 0, notNull: true }
    });
};

export const down = (pgm) => {
    pgm.dropTable("users");
};

