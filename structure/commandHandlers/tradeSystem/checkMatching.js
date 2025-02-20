import {getWTBtoWTSMatching, getWTTMatching} from "../../dbUtils.js";

export default async function (pool, client){
    const wtsMatching = await getWTBtoWTSMatching(pool);
    const wttMatching = await getWTTMatching(pool);

    for (const match of wtsMatching.rows) {
        const buyer = await client.users.fetch(match.buyer_id);
        const seller = await client.users.fetch(match.seller_id);

        await buyer.send(`🔔 Найден продавец для **${match.buyer_item}** (${match.buyer_rarity}, ур. ${match.buyer_level ?? 'N/A'}). 
        💰 Цена: ${match.seller_price}к. Торг: ${match.seller_negotiable ? '✅ Да' : '❌ Нет'}
        📌 Продавец: <@${match.seller_id}>`);

        await seller.send(`🔔 Найден покупатель для **${match.seller_item}** (${match.seller_rarity}, ур. ${match.seller_level ?? 'N/A'}).
        💰 Цена: ${match.buyer_price}к. Покупатель готов торговаться? ${match.seller_negotiable ? '✅ Да' : '❌ Нет'}
        📌 Покупатель: <@${match.buyer_id}>`);
    }

    for (const match of wttMatching.rows) {
        const trader1 = await client.users.fetch(match.trader1_id);
        const trader2 = await client.users.fetch(match.trader2_id);

        await trader1.send(`🔔 Найден обмен: **${match.trader1_offer}** на **${match.trader1_request}**. 
        📌 Контакт: <@${match.trader2_id}>`);

        await trader2.send(`🔔 Найден обмен: **${match.trader2_offer}** на **${match.trader2_request}**. 
        📌 Контакт: <@${match.trader1_id}>`);
    }
}