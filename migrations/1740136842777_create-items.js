exports.up = (pgm) => {
    pgm.createTable("items", {
        id: "id",
        name: { type: "VARCHAR", notNull: true },
        category: { type: "VARCHAR", notNull: true },
    });

    pgm.sql(`
        INSERT INTO items (name, category) VALUES
        ('Серьга', 'Аксессуар'),
        ('Кольцо', 'Аксессуар'),
        ('Ожерелье', 'Аксессуар'),
        ('Самоцвет (Урон)', 'Самоцвет'),
        ('Самоцвет (КД)', 'Самоцвет');
    `);
};

exports.down = (pgm) => {
    pgm.dropTable("items");
};
