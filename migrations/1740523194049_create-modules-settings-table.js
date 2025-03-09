/**
 * Defines the database migration to create and manage the "modules_settings" table.
 *
 * The function creates the `modules_settings` table, initializes it with default
 * data, defines dependencies between module settings, and creates a trigger to
 * enforce these dependencies when updates are made.
 *
 * The following operations are performed:
 *
 * 1. Creation of the `modules_settings` table:
 *    - `id`: Primary key using a serial type.
 *    - `name`: A non-null varchar(255) column representing the module's name.
 *    - `description`: A non-null varchar(255) column detailing the module's functionality.
 *    - `active`: A boolean column with a default value of `false` indicating if the module is enabled.
 *
 * 2. Inserts default module configurations, including their name, description, and activation state.
 *    - Example modules include "ranks", "fastResponses", "factions", and others.
 *
 * 3. Defines a PL/pgSQL function `module_dependency_trigger` to enforce rules for module dependencies.
 *    - Ensures that if the "profiles" module is deactivated, dependent modules such as "achievements"
 *      and "fastResponses" are also deactivated.
 *    - Ensures that activating "achievements" or "fastResponses" also activates the "profiles" module.
 *
 * 4. Creates a trigger named `module_dependency_after_update` to execute the
 *    `module_dependency_trigger` function after any update to the `modules_settings` table.
 *
 * The function ensures consistency and dependency management between different modules
 * within the application environment.
 *
 * @param {Object} pgm - The database migration object provided by the migration framework.
 */
export const up = (pgm) => {
    pgm.createTable("modules_settings", {
        id: {
            type: "serial",
            primaryKey: true
        },
        name: {
            type: "varchar(255)",
            notNull: true,
        },
        description: {
            type: "varchar(255)",
            notNull: true,
        },
        active: {
            type: "boolean",
            default: false
        }
    });

    pgm.sql(`INSERT INTO modules_settings (name, description, active)
             VALUES ('ranks', 'Система рейтинга', true),
                    ('fastResponses', 'Кнопки быстрой связи с продавцом в канале для продаж', false),
                    ('factions', 'Система фракций и борьбы за активность', false),
                    ('bets', 'Система ставок', true),
                    ('subscriptions', 'Система подписок', false),
                    ('profiles', 'Система профилей', false),
                    ('randomGames', 'Рандомайзер', false),
                    ('registration', 'Система регистрации на ивенты', false),
                    ('achievements', 'Система достижений', false),
                    ('trade', 'Система обмена', false),
                    ('codex', 'Кодекс - система знаний', false)`);

    pgm.sql(`
    CREATE OR REPLACE FUNCTION module_dependency_trigger()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.name = 'profiles' AND NEW.active = false THEN
        UPDATE modules_settings SET active = false WHERE name IN ('achievements', 'fastResponses');
      ELSIF NEW.name IN ('achievements', 'fastResponses') AND NEW.active = true THEN
        UPDATE modules_settings SET active = true WHERE name = 'profiles';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

    // Создание триггера
    pgm.sql(`
    CREATE TRIGGER module_dependency_after_update
    AFTER UPDATE ON modules_settings
    FOR EACH ROW
    EXECUTE FUNCTION module_dependency_trigger();
  `);
};

/**
 * Function to handle the down migration for database schema changes.
 *
 * This function performs the following actions:
 * - Removes the trigger `module_dependency_after_update` if it exists on the `modules_settings` table.
 * - Removes the function `module_dependency_trigger` if it exists in the database.
 * - Drops the `modules_settings` table from the database.
 *
 * @param {object} pgm - Migration builder object used for database schema manipulations.
 */
export const down = (pgm) => {
    pgm.sql(`DROP TRIGGER IF EXISTS module_dependency_after_update ON modules_settings`);
    pgm.sql(`DROP FUNCTION IF EXISTS module_dependency_trigger()`);

    // Удаление таблицы
    pgm.dropTable("modules_settings");
};
