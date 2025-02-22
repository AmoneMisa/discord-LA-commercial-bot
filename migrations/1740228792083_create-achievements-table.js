export async function up(pgm) {
    pgm.createTable('achievements', {
        id: 'id',
        name: { type: 'varchar', notNull: true, unique: true },
        description: { type: 'varchar', notNull: true },
        icon: { type: 'text', notNull: true }, // Путь к файлу иконки
        created_at: { type: 'timestamp', default: pgm.func('NOW()') }
    });

    pgm.createTable('user_achievements', {
        id: 'id',
        user_id: { type: 'varchar', notNull: true, references: 'users(user_id)', onDelete: 'CASCADE' },
        achievement_id: { type: 'integer', notNull: true, references: 'achievements(id)', onDelete: 'CASCADE' },
        assigned_by: { type: 'varchar', notNull: true, references: 'users(user_id)', onDelete: 'CASCADE' },
        assigned_at: { type: 'timestamp', default: pgm.func('NOW()') }
    });

    pgm.createIndex('user_achievements', ['user_id', 'achievement_id'], { unique: true });
}

export async function down(pgm) {
    pgm.dropTable('user_achievements');
    pgm.dropTable('achievements');
}
