export const up = (pgm) => {
    pgm.createTable("settings", {
        key: { type: "VARCHAR", primaryKey: true },
        value: { type: "VARCHAR", default: "", notNull: true },
    });

    pgm.sql(`
        INSERT INTO settings (key, value) VALUES
        ('cooldown_minutes', '20'),
        ('cooldown_enabled', 'true'),
        ('allow_self_voting', 'false'),
        ('rank_update_frequency', '1d'),
        ('leaderboard_channel_id', ''),
        ('leaderboard_message_id', '');
    `);
};

export const down = (pgm) => {
    pgm.dropTable("settings");
};
