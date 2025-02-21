import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getUserProfile} from "../../dbUtils.js";

export default async function sendRaidResponse(message, pool) {
    const userProfile = await getUserProfile(pool, message.author.id);

    if (!userProfile || !userProfile.main_nickname) {
        return message.reply({
            content: `⚠️ ${message.author}, у вас не заполнен профиль или отсутствует основной персонаж. Функция "Хочу в рейд" недоступна.`,
            flags: MessageFlags.Ephemeral,
        });
    }

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`join_raid_${message.id}`)
            .setLabel("Хочу в рейд")
            .setStyle(ButtonStyle.Primary)
    );

    await message.reply({
        content: `⚔️ Вы можете записаться в рейд!`,
        components: [buttons],
    });
}
