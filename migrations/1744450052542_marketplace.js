export const up = (pgm) => {
    // Таблица лотов
    pgm.createTable("marketplace_lots", {
        id: "id",
        seller_id: {
            type: "varchar",
            notNull: true,
            references: "marketplace_sellers(user_id)",
            onDelete: "CASCADE"
        },
        gold_amount: {
            type: "bigint",
            notNull: true
        },
        price_per_thousand: {
            type: "numeric(10,2)",
            notNull: true
        },
        delivery_method: {
            type: "varchar",
            notNull: true,
            check: "delivery_method IN ('auction', 'mail', 'both')"
        },
        min_order: {
            type: "bigint",
            notNull: true,
            default: 1000
        },
        server: {
            type: "varchar",
            notNull: true,
            check: "server IN ('kratos', 'alderan', 'both')"
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("NOW()")
        }
    });

// Таблица запросов на покупку золота
    pgm.createTable("marketplace_requests", {
        id: "id",
        lot_id: {
            type: "integer",
            notNull: true,
            references: "marketplace_lots(id)",
            onDelete: "CASCADE"
        },
        buyer_id: {
            type: "varchar",
            notNull: true
        },
        requested_amount: {
            type: "bigint",
            notNull: true
        },
        comment: {
            type: "text"
        },
        status: {
            type: "varchar",
            default: "pending",
            check: "status IN ('pending', 'accepted', 'rejected')"
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("NOW()")
        }
    });

// Таблица курсов валют
    pgm.createTable("currency_rates", {
        currency_code: {
            type: "varchar",
            primaryKey: true
        },
        rate_to_rub: {
            type: "numeric(12,6)",
            notNull: true
        },
        updated_at: {
            type: "timestamp",
            default: pgm.func("NOW()")
        }
    });
};

export const down = (pgm) => {
    pgm.dropTable('currency_rates');
    pgm.dropTable('marketplace_requests');
    pgm.dropTable('marketplace_lots');
    pgm.dropTable('marketplace_sellers');
};
