/**
 * Creates database tables `achievements` and `user_achievements` with the necessary columns
 * and constraints. Also sets up a unique index on the `user_achievements` table.
 *
 * @param {object} pgm - The database migration object provided by node-pg-migrate.
 * @return {Promise<void>} A promise that resolves when the migration operations are complete.
 */
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

/**
 * Reverts database migrations by dropping the specified tables.
 *
 * @param {object} pgm - The migration object that provides methods to define database changes.
 * @return {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function down(pgm) {
    pgm.dropTable('user_achievements');
    pgm.dropTable('achievements');
}
