/**
 * Defines the database schema and creates the "trade_deals" table.
 *
 * @function
 * @name up
 *
 * @param {object} pgm - The database migration object used to define and manage schema changes.
 *
 * This function creates a table named "trade_deals" with the following columns:
 *
 * - id: Unique identifier for the trade deal (primary key, auto-incremented via default "id" type).
 * - buyer_id: ID of the buyer, references "users" table with "user_id" column.
 * - seller_id: ID of the seller, references "users" table with "user_id" column.
 * - item_offered: Name or identifier of the item being offered in the trade.
 * - item_requested: Name or identifier of the item being requested in the trade.
 * - offer_level: Numeric value representing the level of the offered item, must be between 1 and 10.
 * - request_level: Numeric value representing the level of the requested item, must be between 1 and 10.
 * - price: Price associated with the trade, must be non-negative.
 * - trade_type: Type of trade, constrained to values 'WTT' (Want To Trade), 'WTS' (Want To Sell), or 'WTB' (Want To Buy).
 * - server: Server where the trade occurs, constrained to 'Альдеран', 'Кратос', or 'Альдеран и Кратос'.
 * - offer_rarity: Rarity of the offered item, optional, constrained to 'Реликтовый' or 'Древний'.
 * - request_rarity: Rarity of the requested item, optional, constrained to 'Реликтовый' or 'Древний'.
 * - timestamp: Timestamp of the trade deal creation, defaults to the current time.
 *
 * The function specifies various column constraints like `notNull`, `check`, and `references` to ensure data integrity.
 */
export const up = (pgm) => {
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

/**
 * A function that defines the "down" migration step, which reverts
 * changes made by a previous migration step. In this specific case,
 * the function is responsible for dropping the "trade_deals" table
 * from the database schema.
 *
 * @param {Object} pgm - An object provided by the migration library,
 * representing the PostgreSQL migration context. This object
 * contains methods and properties necessary for managing database
 * schema changes.
 */
export const down = (pgm) => {
    pgm.dropTable("trade_deals");
};
