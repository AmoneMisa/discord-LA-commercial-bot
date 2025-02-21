export const up = (pgm) => {
    pgm.sql(`
        INSERT INTO roles (role_name, required_rating, min_reviews, min_positive_reviews, min_negative_reviews)
        VALUES ('Топ-продавец', 100, 100, 80, 0),
               ('Отличный продавец', 75, 80, 50, 0),
               ('Хороший продавец', 50, 30, 15, 0),
               ('Продавец', 0, 0, 0, 0)
        ON CONFLICT (role_name) DO NOTHING;
    `);
}

export const down = async (pgm) => {
    pgm.dropTable('roles');
};