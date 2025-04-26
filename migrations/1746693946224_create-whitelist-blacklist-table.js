export async function up(pgm) {
    pgm.createTable('whitelist_blacklist', {
        id: 'id', // автоинкрементный первичный ключ
        user_id: {
            type: 'varchar',
            notNull: true,
            references: 'users(user_id)',
            onDelete: 'CASCADE'
        }, // кто добавил
        target_id: {
            type: 'varchar',
            notNull: true,
            references: 'users(user_id)',
            onDelete: 'CASCADE'
        }, // кого добавили
        type: {
            type: 'varchar(20)',
            notNull: true,
            check: "type IN ('whitelist', 'blacklist')"
        }, // тип списка
        role: {
            type: 'varchar(20)',
            notNull: true,
            check: "role IN ('driver', 'buyer')"
        }, // роль
        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp')
        } // дата создания
    });

    pgm.addConstraint('whitelist_blacklist', 'unique_user_target', {
        unique: ['user_id', 'target_id']
    });
}

export async function down(pgm) {
    pgm.dropTable('whitelist_blacklist');
}
