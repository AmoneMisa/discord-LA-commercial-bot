/**
 * A migration script that adds new columns to the "users" table for managing notification preferences.
 *
 * @param {object} pgm - The migration builder object used to define database schema changes.
 * @property {Function} pgm.addColumns - A method to add new columns to an existing table.
 *
 * This script adds the following columns to the "users" table:
 * 1. notifications_enabled: A boolean column that tracks whether general notifications are enabled. It has a default value of `true` and cannot be null.
 * 2. review_notifications_enabled: A boolean column that tracks whether review notifications are enabled. It also has a default value of `true` and cannot be null.
 */
export const up = (pgm) => {
    pgm.addColumns("users", {
        notifications_enabled: {type: "boolean", default: true, notNull: true},  // Общие уведомления
        review_notifications_enabled: {type: "boolean", default: true, notNull: true} // Уведомления об отзывах
    });
};

/**
 * Reverts database schema changes by dropping specific columns from the "users" table.
 *
 * @param {object} pgm - An instance of the database migration framework to define and manage schema changes.
 */
export const down = (pgm) => {
    pgm.dropColumns("users",
        ["notifications_enabled", "review_notifications_enabled"]
    );
};
