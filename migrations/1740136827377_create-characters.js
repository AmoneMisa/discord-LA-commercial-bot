exports.up = (pgm) => {
    pgm.createTable("characters", {
        id: "id",
        profile_id: { type: "INTEGER", references: "profiles(id)", onDelete: "CASCADE", notNull: true },
        class_name: { type: "VARCHAR", notNull: true },
        char_name: { type: "VARCHAR", unique: true, notNull: true },
        gear_score: { type: "FLOAT", notNull: true },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("characters");
};
