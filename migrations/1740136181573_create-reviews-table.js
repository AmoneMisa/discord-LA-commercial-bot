exports.up = (pgm) => {
    pgm.createTable("reviews", {
        id: "id",
        target_user: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        reviewer_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        is_positive: { type: "BOOLEAN", notNull: true },
        review_text: { type: "TEXT" },
        timestamp: { type: "TIMESTAMP", default: pgm.func("NOW()"), notNull: true },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("reviews");
};
