import {getRaidName} from "../dbUtils.js";
import {MessageFlags} from "discord.js";

export default async function (interaction, pool, client) {
    try {
        const [ , , , buyerId, raidId] = interaction.customId.split('_');
        const buyer = await client.users.fetch(buyerId);
        const raidName = await getRaidName(pool, raidId);

        await client.channels.fetch(interaction.message.channelId);
        await interaction.message.edit({
            content: '✅ Сообщение пользователю отправлено!',
            components: [],
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.deleteReply();

        await client.users.send(buyer, {
            content: `Продавец: <@${interaction.user.id}> одобрил ваш запрос на покупку рейда: ${raidName}\nНазвание лобби: **${interaction.fields.getTextInputValue('lobby')}**`,
            flags: MessageFlags.Ephemeral
        });
    } catch (e) {
        console.error('Ошибка при отправке ответа покупателю', e);
    }
}