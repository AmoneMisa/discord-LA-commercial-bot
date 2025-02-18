import {EmbedBuilder, MessageFlags} from "discord.js";

export default async function handleProfileView(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    const profile = await pool.query(`SELECT * FROM profiles WHERE user_id = $1`, [userId]);

    if (!profile.rows.length) {
        return interaction.reply({ content: '🚫 У пользователя нет анкеты!', flags: MessageFlags.Ephemeral });
    }

    const characters = await pool.query(`SELECT *
                                           FROM characters
                                           WHERE profile_id = $1`, [profile.rows[0].id]);

    let characterListMessage = '';
    if (characters.rows.length) {
        for (const character of characters.rows) {
            characterListMessage += `[${character.class_name}] **${character.char_name}** - :crossed_swords: ${character.gear_score}\n`;
        }
    }

    const data = profile.rows[0];
    const embed = new EmbedBuilder()
        .setTitle(`📜 Профиль ${interaction.options.getUser('user').username}`)
        .setDescription(`:peacock: **Имя:** ${data.name || 'Не указано'}\n**Роль:** ${data.role}\n**Прайм:** ${data.prime_start || 'Не указан'} - ${data.prime_end || 'Не указан'}\n**Рейдовый опыт:** ${data.raid_experience.join(', ') || 'Не указан'}\n**Опыт в продажах:** ${data.sales_experience || 'Не указан'}` + characterListMessage)
        .setColor('#0099ff');

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
