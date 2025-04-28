import { ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } from "discord.js";
import { getAllAchievements } from "../../dbUtils.js";
import { translatedMessage } from "../../utils.js";

global.tempInteractionData = global.tempInteractionData || null;

export default async function(interaction, customIdPrefix) {
    const achievements = await getAllAchievements();

    if (!achievements.length) {
        return interaction.reply({
            content: await translatedMessage(interaction, 'info.noAchievements'),
            flags: MessageFlags.Ephemeral
        });
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${customIdPrefix}_select_achievement`)
        .setPlaceholder(await translatedMessage(interaction, 'info.selectAchievementPlaceholder'))
        .addOptions(
            achievements.map(achievement => ({
                label: achievement.name,
                value: achievement.name,
                description: achievement.description.length > 80
                    ? achievement.description.substring(0, 77) + '...'
                    : achievement.description,
            }))
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        content: await translatedMessage(interaction, 'info.selectAchievement'),
        components: [row],
        flags: MessageFlags.Ephemeral
    });

    global.tempInteractionData = interaction.options;
}
