import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function(interaction, pool) {
    const [_, __, lotId] = interaction.customId.split("_");

    const goldAmount = parseInt(interaction.fields.getTextInputValue("buy_amount"));
    const comment = interaction.fields.getTextInputValue("buy_comment") || "_нет_";

    if (isNaN(goldAmount) || goldAmount <= 0) {
        return interaction.reply({ content: "❌ Укажите корректное количество золота.", ephemeral: true });
    }

    const lotData = await pool.query("SELECT * FROM marketplace_lots WHERE id = $1", [lotId]);
    if (lotData.rowCount === 0) {
        return interaction.reply({ content: "❌ Лот не найден или удалён.", ephemeral: true });
    }

    const lot = lotData.rows[0];
    const lang = await getUserLanguage(interaction.user.id, pool);

    // Отправляем продавцу
    const sellerUser = await interaction.client.users.fetch(lot.seller_id);
    const requestMsg = await sellerUser.send({
        content: `💸 Вам поступил **запрос на покупку** от <@${interaction.user.id}> на **${goldAmount} золота**\n\n💬 Комментарий: ${comment}`,
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_order_${interaction.user.id}_${lotId}_${goldAmount}`)
                    .setLabel("✅ Выполнено")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_order_${interaction.user.id}_${lotId}`)
                    .setLabel("❌ Отклонено")
                    .setStyle(ButtonStyle.Danger)
            )
        ]
    });

    await interaction.reply({ content: i18n.t("market.requestSent", { lng: lang }), ephemeral: true });
}
