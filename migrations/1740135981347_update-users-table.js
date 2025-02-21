export const up = (pgm) => {
    pgm.addColumns("users", {
        notifications_enabled: {type: "boolean", default: true, notNull: true},  // Общие уведомления
        review_notifications_enabled: {type: "boolean", default: true, notNull: true} // Уведомления об отзывах
    });
};

export const down = (pgm) => {
    pgm.dropColumns("users",
        ["notifications_enabled", "review_notifications_enabled"]
    );
};
