import {MessageFlags} from "discord.js";
import sendCharacterList from "../../generateCharactersListImage.js";
import {getUserAchievements} from "../../dbUtils.js";
import {getMember, translatedMessage} from "../../utils.js";
import dotenv from "dotenv";

dotenv.config();
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
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand, 'user');

    if (member.bot) {
        return await interaction.editReply({
            content: await translatedMessage(interaction, "errors.userIsBot"),
            flags: MessageFlags.Ephemeral
        });
    }

    const userId = member.id;
    const profile = await pool.query(`SELECT *
                                      FROM profiles
                                      WHERE user_id = $1`, [userId]);

    if (!profile.rows.length) {
        return interaction.editReply({
            content: await translatedMessage(interaction, "errors.userDontHaveProfile"),
            flags: MessageFlags.Ephemeral
        });
    }

    const characters = await pool.query(`SELECT *
                                         FROM characters
                                         WHERE profile_id = $1`, [profile.rows[0].id])

    const options = {};
    if (process.env.ACHIEVEMENTS_MODULE) {
        options["achievements"] = await getUserAchievements(userId);
    }

    if (process.env.WHITE_BLACK_LIST_MODULE) {
        const stats = await pool.query(`
            SELECT COUNT(CASE WHEN type = 'whitelist' AND role = 'driver' THEN 1 END) AS whitelist_drivers,
                   COUNT(CASE WHEN type = 'whitelist' AND role = 'buyer' THEN 1 END)  AS whitelist_buyers,
                   COUNT(CASE WHEN type = 'blacklist' AND role = 'driver' THEN 1 END) AS blacklist_drivers,
                   COUNT(CASE WHEN type = 'blacklist' AND role = 'buyer' THEN 1 END)  AS blacklist_buyers
            FROM whitelist_blacklist
            WHERE target_id = $1
        `, [userId]);
        const {whitelist_drivers, whitelist_buyers, blacklist_drivers, blacklist_buyers} = stats.rows[0];

        options["whitelistDrivers"] = whitelist_drivers;
        options["whitelistBuyers"] = whitelist_buyers;
        options["blacklistDrivers"] = blacklist_drivers;
        options["blacklistBuyers"] = blacklist_buyers;
    }

    if (process.env.SUBSCRIPTION_MODULE) {
        const subscriptions = await pool.query(`
            SELECT COUNT(*)
            FROM subscriptions
            WHERE seller_id = $1
        `, [userId]);
        options["subscribers"] = subscriptions.rows[0].count;
    }

    const notSpecifiedMessage = await translatedMessage(interaction, "profile.notSpecified");

    if (characters.rows.length) {
        const data = profile.rows[0];
        await sendCharacterList(interaction,
            await translatedMessage(interaction, "profile.full", {
                username: getMember(interaction).username,
                name: data.name || notSpecifiedMessage,
                role: data.role || notSpecifiedMessage,
                salesExperience: data.sales_experience || notSpecifiedMessage,
                primeStart: data.prime_start || notSpecifiedMessage,
                primeEnd: data.prime_end || notSpecifiedMessage,
                ...options
            }),
            characters.rows,
            null,
            options.achievements);
    }
}
