import {MessageFlags} from "discord.js";
import saveAchievementIcon from "../achievements/saveAchievementIcon.js";

export default async function createAchievement(interaction, pool) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const icon = interaction.options.getAttachment('icon');

    if (!icon) {
        return interaction.reply({ content: '❌ Прикрепите изображение PNG.', flags: MessageFlags.Ephemeral });
    }

    const isAchievementExist = await pool.query(`SELECT * FROM achievements WHERE name = $1`, [name]);

    if (isAchievementExist.rows.length) {
        return await interaction.reply({ content: '❌ Достижение с таким названием уже существует', flags: MessageFlags.Ephemeral });
    }

    const savedPath = await saveAchievementIcon(name, icon);

    if (savedPath) {
        await interaction.reply({ content: `🏆 Достижение **${name}** создано!\n📁 Файл сохранён: ${savedPath}`, flags: MessageFlags.Ephemeral });
    } else {
        return await interaction.reply({ content: '❌ Ошибка при сохранении иконки.', flags: MessageFlags.Ephemeral });
    }

    await pool.query(
        `INSERT INTO achievements (name, description, icon) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
        [name, description, icon.url]
    );
}
