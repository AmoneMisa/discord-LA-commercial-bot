import {MessageFlags} from "discord.js";
import sendCharacterList from "../../generateCharactersListImage.js";
import {getUserAchievements, getUserLanguage} from "../../dbUtils.js";
import {getMember} from "../../utils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Handles the profile view interaction, retrieves profile details and associated characters,
 * and sends back the appropriate response with the profile and character information.
 *
 * @param {object} interaction - The interaction object containing user input and context.
 * @param {object} pool - The database connection pool used to query the database.
 * @param {boolean} [isContextMenu=false] - Indicates if the command was triggered through a context menu.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates if the interaction was invoked through a message content menu command.
 * @return {Promise<void>} Resolves when the interaction has been successfully processed and a response is sent.
 */
export default async function handleProfileView(interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (member.bot) {
        return await interaction.reply({
            content: i18n.t("errors.userIsBot", {lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }

    const userId = member.id;
    const lang = await getUserLanguage(userId, pool);

    const profile = await pool.query(`SELECT *
                                      FROM profiles
                                      WHERE user_id = $1`, [userId]);

    if (!profile.rows.length) {
        return interaction.reply({
            content: i18n.t("errors.userDontHaveProfile", {lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }

    const characters = await pool.query(`SELECT *
                                         FROM characters
                                         WHERE profile_id = $1`, [profile.rows[0].id])

    const achievements = await getUserAchievements(pool, userId);
    const stats = await pool.query(`
        SELECT COUNT(CASE WHEN type = 'whitelist' AND role = 'driver' THEN 1 END) AS whitelist_drivers,
               COUNT(CASE WHEN type = 'whitelist' AND role = 'buyer' THEN 1 END)  AS whitelist_buyers,
               COUNT(CASE WHEN type = 'blacklist' AND role = 'driver' THEN 1 END) AS blacklist_drivers,
               COUNT(CASE WHEN type = 'blacklist' AND role = 'buyer' THEN 1 END)  AS blacklist_buyers
        FROM whitelist_blacklist
        WHERE target_id = $1
    `, [userId]);

    const subscriptions = await pool.query(`
        SELECT COUNT(*)
        FROM subscriptions
        WHERE seller_id = $1
    `, [userId]);

    const {whitelist_drivers, whitelist_buyers, blacklist_drivers, blacklist_buyers} = stats.rows[0];
    const subscribers = subscriptions.rows[0].count;

    if (characters.rows.length) {
        const data = profile.rows[0];
        await sendCharacterList(interaction,
            i18n.t("profile.full", {
                lng: lang,
                username: interaction.options.getUser('user').username,
                name: data.name || i18n.t("profile.notSpecified", {lng: lang}),
                role: data.role || i18n.t("profile.notSpecified", {lng: lang}),
                primeStart: data.prime_start || i18n.t("profile.notSpecified", {lng: lang}),
                primeEnd: data.prime_end || i18n.t("profile.notSpecified", {lng: lang}),
                raidExperience: data.raid_experience.length > 0
                    ? data.raid_experience.join(', ')
                    : i18n.t("profile.notSpecified", {lng: lang}),
                salesExperience: data.sales_experience || i18n.t("profile.notSpecified", {lng: lang}),
                whitelistDrivers: whitelist_drivers,
                whitelistBuyers: whitelist_buyers,
                blacklistDrivers: blacklist_drivers,
                blacklistBuyers: blacklist_buyers,
                subscribers: subscribers
            }),
            characters.rows,
            null,
            achievements);
    }
}
