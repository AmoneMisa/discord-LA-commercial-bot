import {MessageFlags} from "discord.js";
import sendCharacterList from "../../generateCharactersListImage.js";
import {getUserAchievements} from "../../dbUtils.js";
import {getMember, translatedMessage} from "../../utils.js";

/**
 * Handles the profile view interaction, retrieves profile details and associated characters,
 * and sends back the appropriate response with the profile and character information.
 *
 * @param {object} interaction - The interaction object containing user input and context.
 * @param {boolean} [isContextMenu=false] - Indicates if the command was triggered through a context menu.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates if the interaction was invoked through a message content menu command.
 * @return {Promise<void>} Resolves when the interaction has been successfully processed and a response is sent.
 */
export default async function handleProfileView(interaction, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (member.bot) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.userIsBot"),
            flags: MessageFlags.Ephemeral
        });
    }

    const userId = member.id;

    const profile = await pool.query(`SELECT *
                                      FROM profiles
                                      WHERE user_id = $1`, [userId]);

    if (!profile.rows.length) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.userDontHaveProfile"),
            flags: MessageFlags.Ephemeral
        });
    }

    const characters = await pool.query(`SELECT *
                                         FROM characters
                                         WHERE profile_id = $1`, [profile.rows[0].id])

    const achievements = await getUserAchievements(userId);
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
            await translatedMessage(interaction, "profile.full", {
                username: interaction.options.getUser('user').username,
                name: data.name || await translatedMessage(interaction, "profile.notSpecified"),
                role: data.role || await translatedMessage(interaction, "profile.notSpecified"),
                primeStart: data.prime_start || await translatedMessage(interaction, "profile.notSpecified"),
                primeEnd: data.prime_end || await translatedMessage(interaction, "profile.notSpecified"),
                raidExperience: data.raid_experience.length > 0
                    ? data.raid_experience.join(', ')
                    : await translatedMessage(interaction, "profile.notSpecified"),
                salesExperience: data.sales_experience || await translatedMessage(interaction, "profile.notSpecified"),
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
