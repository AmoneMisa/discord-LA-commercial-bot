import {getUserProfile} from "../../dbUtils.js";
import {EmbedBuilder, MessageFlags} from "discord.js";

const tempMessageStorage = new Map();

export default async function (interaction, pool, client) {
    // Кнопка "Хочу в рейд"
    if (tempMessageStorage.has(interaction.message.id)
        && tempMessageStorage.get(interaction.message.id).includes(interaction.user.id)) {
        await interaction.reply({content: "Вы уже взаимодействовали с этим сообщением", flags: MessageFlags.Ephemeral});
        return console.log("Пользователь уже взаимодействовал с этим сообщением", interaction.message.id, interaction.user.id);
    }

    const [, , sellerId] = interaction.customId.split('_');

    if (interaction.user.id === sellerId) {
        return interaction.reply({
            content: '🚫 Вы не можете отправить заявку самому себе.',
            flags: MessageFlags.Ephemeral
        });
    }

    const userProfile = await getUserProfile(pool, interaction.user.id);

    if (!userProfile) {
        return interaction.reply({
            content: "Для использования кнопки 'Хочу в рейд' необходимо иметь заполненный профиль.",
            flags: MessageFlags.Ephemeral
        });
    }

    if (!userProfile.characters.length) {
        await interaction.reply({content: "Не найдены персонажи", flags: MessageFlags.Ephemeral})
        console.error("Не найдены персонажи для пользователя", interaction.user.id);
        return;
    }

    let characterListMessage = `${userProfile.main_nickname}\n`;

    for (const character of userProfile.characters) {
        characterListMessage += `${character}\n`;
    }

    const embed = new EmbedBuilder()
        .setTitle(`📜 Профиль ${interaction.user.username}`)
        .setDescription(
            `:peacock: **Имя:** ${userProfile.name || 'Не указано'}\n` +
            characterListMessage
        )
        .setColor('#0099ff');

    // Отправляем сообщение автору оригинального сообщения
    const seller = await client.users.fetch(sellerId);

    if (seller) {
        await seller.send({embeds: [embed]}).catch(console.error);
        interaction.reply({content: "Запрос отправлен", flags: MessageFlags.Ephemeral});
        tempMessageStorage.set(interaction.message.id, []);
        tempMessageStorage.get(interaction.message.id).push(interaction.user.id);
    }

    setTimeout(() => tempMessageStorage.delete(interaction.message.id), 5 * 60 * 1000);
}