export const up = (pgm) => {
    pgm.createTable("raids", {
        id: "id",
        raid_name: { type: "VARCHAR", notNull: true },
    });

    pgm.createTable("raid_roles", {
        id: "id",
        role_name: { type: "VARCHAR", notNull: true },
        role_id: { type: "VARCHAR", unique: true, notNull: true },
    });

    pgm.createTable("available_raids", {
        id: "id",
        raid_id: { type: "INTEGER", references: "raids(id)", notNull: true },
        role_id: { type: "VARCHAR", references: "raid_roles(role_id)", notNull: true },
    });

    pgm.createTable("subscriptions", {
        id: "id",
        buyer_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        seller_id: { type: "VARCHAR", references: "users(user_id)", notNull: true },
        raid_id: { type: "INTEGER", references: "available_raids(id)", notNull: true },
    });
};

export const down = (pgm) => {
    pgm.dropTable("subscriptions");
    pgm.dropTable("available_raids");
    pgm.dropTable("raid_roles");
    pgm.dropTable("raids");
};
