export const up = (pgm) => {
    pgm.addColumns("users", {
        language: {type: "varchar(4)", default: "ru", notNull: true},  // Общие уведомления
    });
};

export const down = (pgm) => {
    pgm.dropColumns("users",
        ["language"]
    );
};