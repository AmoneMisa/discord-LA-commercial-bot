export const up = (pgm) => {
    pgm.createTable("profiles", {
        id: "id",
        user_id: { type: "VARCHAR", unique: true, references: "users(user_id)", onDelete: "CASCADE", notNull: true },
        name: { type: "VARCHAR" },
        main_nickname: { type: "VARCHAR", unique: true, notNull: true },
        role: { type: "VARCHAR(20)", check: "role IN ('покупатель', 'продавец', 'нейтрал')" },
        prime_start: { type: "TIME" },
        prime_end: { type: "TIME" },
        raid_experience: { type: "VARCHAR[]", notNull: false },
        sales_experience: { type: "VARCHAR" },
        achievements: { type: "VARCHAR[]" },
    });
};

export const down = (pgm) => {
    pgm.dropTable("profiles");
};
