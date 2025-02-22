export const up = (pgm) => {
    pgm.addColumns("profiles", {
        server: {type: "varchar", default: 'кратос', notNull: true},
    });
};

export const down = (pgm) => {
    pgm.dropColumns("profiles",
        ["server"]
    );
};
