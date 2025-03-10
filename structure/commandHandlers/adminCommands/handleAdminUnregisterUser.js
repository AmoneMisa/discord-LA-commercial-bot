import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function (interaction, pool) {
    const eventId = interaction.options.getInteger("event_id");
    const userId = interaction.options.getUser("user").id;

    const deleteResult = await pool.query(
        "DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2 RETURNING *",
        [eventId, userId]
    );

    if (deleteResult.rowCount === 0) {
        return interaction.reply({ content: i18n.t("errors.userNotRegistered", { lng: await getUserLanguage(interaction.user.id, pool) }), flags: MessageFlags.Ephemeral });
    }

    return interaction.reply({ content: i18n.t("info.userRegistrationDeleted", { userId, lng: await getUserLanguage(interaction.user.id, pool) }), flags: MessageFlags.Ephemeral });
}
