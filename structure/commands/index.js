import adminAchievementsCommands from "./adminAchievementsCommands.js";
import adminRankCommands from "./adminRankCommands.js";
import adminSettingsCommands from "./adminSettingsCommands.js";
import adminSubscriptionCommands from "./adminSubscriptionCommands.js";
import userCommands from "./userCommands.js";
import userProfileCommands from "./userProfileCommands.js";
import userSubscriptionCommands from "./userSubscriptionCommands.js";

export default [
    ...userCommands,
    ...userProfileCommands,
    ...userSubscriptionCommands,
    ...adminSettingsCommands,
    ...adminAchievementsCommands,
    ...adminRankCommands,
    ...adminSubscriptionCommands
]