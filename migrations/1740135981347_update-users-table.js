exports.up = (pgm) => {
    pgm.alterTable("users", {
        addColumns: {
            notifications_enabled: { type: "boolean", default: true, notNull: true },  // Общие уведомления
            review_notifications_enabled: { type: "boolean", default: true, notNull: true } // Уведомления об отзывах
        }
    });
};

exports.down = (pgm) => {
    pgm.alterTable("users", {
        dropColumns: ["rating", "positive_reviews", "negative_reviews", "notifications_enabled", "review_notifications_enabled"]
    });
};
