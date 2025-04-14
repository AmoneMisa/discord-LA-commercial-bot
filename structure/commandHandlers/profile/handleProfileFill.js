import {MessageFlags} from "discord.js";
import {saveProfileToDB} from "../../../scrapping/parser.js";

/**
 * Handles the process of filling out a user profile based on the provided interaction data.
 *
 * @param {Object} interaction - The interaction object representing the user's command or action.
 * @returns {Promise<void>} Resolves when the process is complete, either by saving the profile or responding to the user.
 */
export default async function handleProfileFill(interaction) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const userId = interaction.user.id;
    const name = interaction.options.getString('name') || null;
    const server = interaction.options.getString('server') || "кратос";
    const mainNickname = interaction.options.getString('main_nickname').toLowerCase();
    const role = interaction.options.getString('role');
    const primeStart = interaction.options.getString('prime_start') || null;
    const primeEnd = interaction.options.getString('prime_end') || null;
    const raidExperience = interaction.options.getString('raid_experience')?.split(',') || [];
    const salesExperience = interaction.options.getString('sales_experience') || null;

    let result = await pool.query(`SELECT COUNT(*)
                                   FROM profiles
                                   WHERE user_id = $1`, [userId]);

    if (result.rows[0].count > 0) {
        return await interaction.editReply({
            content: 'У вас уже есть анкета. Чтобы изменить её, используйте команду /profile edit',
            flags: MessageFlags.Ephemeral
        });
    }

    try {
        if (mainNickname) {
            await saveProfileToDB({
                userId,
                name,
                mainNickname,
                role,
                primeStart,
                primeEnd,
                raidExperience,
                salesExperience,
                server});
        }

        await interaction.editReply({content: '✅ Анкета успешно заполнена!', flags: MessageFlags.Ephemeral});
    } catch (err) {
        if (err.code === '23505') { // Код ошибки уникальности в PostgreSQL
            await interaction.editReply({
                content: '❌ Этот ник уже занят другим пользователем. Пожалуйста, выберите другой.',
                flags: MessageFlags.Ephemeral
            });
        }
        console.error(err);
    }
}
