/**
 * The `up` variable is a function that defines the schema for the "inventory" table.
 * This table is used to store information about inventory items, trades, and related properties.
 *
 * The table includes the following columns:
 * - `id`: Unique identifier for each inventory item, automatically generated.
 * - `user_id`: Identifier for the user associated with the inventory item. References the `user_id` column in the "users" table. Cannot be null.
 * - `trade_type`: Represents the type of trade (e.g., 'WTT', 'WTS', 'WTB'). Must not be null and constrained to specific values.
 * - `item_offer`: Describes the item being offered in the trade. Cannot be null.
 * - `item_request`: Optional description of the item being requested in exchange.
 * - `offer_level`: Optional numeric level associated with the offered item. Constrained to values between 1 and 10.
 * - `request_level`: Optional numeric level associated with the requested item. Constrained to values between 1 and 10.
 * - `price`: Numeric price of the offer. Must be zero or a positive integer if specified.
 * - `negotiable`: Boolean field indicating whether the price is negotiable. Defaults to `false` and cannot be null.
 * - `server`: Represents the server associated with the trade. Constrained to specific server names ('Альдеран', 'Кратос', 'Альдеран и Кратос') and defaults to 'Кратос'.
 * - `offer_rarity`: Describes the rarity of the offered item. Constrained to specific values ('Реликтовый', 'Древний').
 * - `request_rarity`: Describes the rarity of the requested item if any. Constrained to specific values ('Реликтовый', 'Древний').
 * - `expires_at`: Timestamp indicating when the inventory entry will expire. Defaults to the current time plus three days. Cannot be null.
 * - `notified`: Boolean field indicating whether the user has been notified. Defaults to `false` and cannot be null.
 *
 * This function uses the `pgm.createTable` method to define the schema above.
 */
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

/**
 * Reverts changes made by a previous migration operation.
 *
 * @param {object} pgm - The database migration object provided by the migration framework.
 * This object allows for defining schema changes.
 */
export const down = (pgm) => {
    pgm.dropTable("inventory");
};
