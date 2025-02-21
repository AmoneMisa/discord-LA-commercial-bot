export const up  = (pgm) => {
    pgm.createTable("roles", {
        id: "id",
        role_name: { type: "VARCHAR", unique: true, notNull: true },
        role_id: { type: "VARCHAR", unique: true },
        required_rating: { type: "INTEGER", default: 0, notNull: true },
        min_reviews: { type: "INTEGER", default: 0, notNull: true },
        min_positive_reviews: { type: "INTEGER", default: 0, notNull: true },
        min_negative_reviews: { type: "INTEGER", default: 0, notNull: true },
    });
};

export const down = (pgm) => {
    pgm.dropTable("roles");
};
