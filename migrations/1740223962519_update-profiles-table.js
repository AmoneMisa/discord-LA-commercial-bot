export const up = (pgm) => {
    pgm.addColumns("roles", {
        server: {type: "varchar", default: 'кратос', notNull: true},
    });
};

export const down = (pgm) => {
    pgm.dropColumns("roles",
        ["server"]
    );
};
