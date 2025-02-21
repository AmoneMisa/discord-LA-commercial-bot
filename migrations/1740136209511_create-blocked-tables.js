exports.up = (pgm) => {
    pgm.createTable("blocked_reviewers", {
        user_id: { type: "VARCHAR", references: "users(user_id)", primaryKey: true },
        unblock_time: { type: "TIMESTAMP" },
    });

    pgm.createTable("blocked_receivers", {
        user_id: { type: "VARCHAR", references: "users(user_id)", primaryKey: true },
        unblock_time: { type: "TIMESTAMP" },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("blocked_reviewers");
    pgm.dropTable("blocked_receivers");
};
