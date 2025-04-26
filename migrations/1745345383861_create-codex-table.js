export const up = (pgm) => {
    // Таблица категорий кодекса
    pgm.createTable("codex_categories", {
        id: {
            type: "serial",
            primaryKey: true
        },
        name: {
            type: "varchar(255)",
            notNull: true,
            unique: true
        }
    });

    // Таблица кодекса
    pgm.createTable("codex_entries", {
        id: {
            type: "serial",
            primaryKey: true
        },
        category_id: {
            type: "integer",
            references: "codex_categories(id)",
            onDelete: "CASCADE",
            notNull: true
        },
        title: {
            type: "varchar(255)",
            notNull: true
        },
        language: {
            type: "varchar(10)", // Пример: "ru", "en"
            notNull: true
        },
        content: {
            type: "text",
            notNull: true
        },
        source_url: {
            type: "varchar(512)",
            notNull: false
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("NOW()"),
            notNull: true
        },
        updated_at: {
            type: "timestamp",
            default: pgm.func("NOW()"),
            notNull: true
        }
    });

    // Таблица изображений для кодекса
    pgm.createTable("codex_images", {
        id: {
            type: "serial",
            primaryKey: true
        },
        entry_id: {
            type: "integer",
            references: "codex_entries(id)",
            onDelete: "CASCADE",
            notNull: true
        },
        image_url: {
            type: "varchar(512)",
            notNull: true
        }
    });

    // Добавим категории по умолчанию
    pgm.sql(`
        INSERT INTO codex_categories (name) VALUES 
        ('Рейды'),
        ('Билды'),
        ('Общая информация'),
        ('Иностранные ресурсы'),
        ('Руязычные ресурсы'),
        ('Гайды продаж');
    `);
};

export const down = (pgm) => {
    pgm.dropTable("codex_images");
    pgm.dropTable("codex_entries");
    pgm.dropTable("codex_categories");
};
