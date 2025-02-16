import {getRaidName} from "../dbUtils.js";

export default async function (interaction, pool, client) {
    try {
        const [ , , , buyerId, raidId] = interaction.customId.split('_');
        const buyer = await client.users.fetch(buyerId);
        const raidName = await getRaidName(pool, raidId);

        await buyer.send(`Продавец: <@${interaction.user.id}> одобрил ваш запрос на покупку рейда: ${raidName}\nНазвание лобби: **${interaction.fields.getTextInputValue('lobby')}**!`);
    } catch (e) {
        console.error('Ошибка при отправке ответа покупателю', e);
    }
}