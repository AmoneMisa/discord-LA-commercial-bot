import i18n from "../../../locales/i18n.js";
import {formatDateToCustomString} from "../../utils.js";

export default function (page, bets, lang, event) {
    const perPage = 12;
    const totalPages = Math.ceil(bets.rowCount / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedBets = bets.rows.slice(startIndex, endIndex);

    let embedContent = i18n.t("info.betTableHeader", {
        lng: lang,
        eventId: event.id,
        eventName: event.name,
        startTime: formatDateToCustomString(event.start_time),
        endTime: formatDateToCustomString(event.end_time),
        page: page,
        totalPages: totalPages
    });

    for (const bet of paginatedBets) {
        const index = paginatedBets.indexOf(bet);
        embedContent += i18n.t("info.betRow", {
            lng: lang,
            position: startIndex + index + 1,
            userId: bet.user_id,
            amount: bet.amount,
            target: bet.target,
            odds: bet.odds,
            winnings: (Math.round(bet.amount * bet.odds * 0.9))
        });
    }

    embedContent += i18n.t("info.betCommission", {
        lng: lang
    });

    return embedContent;
}