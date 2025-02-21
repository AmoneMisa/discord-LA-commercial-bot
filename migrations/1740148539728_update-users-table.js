export const up = (pgm) => {
    pgm.alterColumn("users", "rating", {
        type: "REAL",
        using: "rating::REAL",
    });
};

export const down = (pgm) => {
    pgm.alterColumn("users", "rating", {
        type: "INTEGER",
        using: "rating::INTEGER",
    });
};
