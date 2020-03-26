import {
    FREQUENCY,
    WEEKLY_TYPE,
    MONTHLY_TYPE,
    YEARLY_TYPE,
    END_TYPE,
    DAY_TO_NUMBER,
    DAILY_TYPE,
    DAY_TO_NUMBER_KEYS
} from '../../../constants';
import { propertyToUTCDate } from 'proton-shared/lib/calendar/vcalConverter';
import { convertUTCDateTimeToZone, fromUTCDate } from 'proton-shared/lib/date/timezone';
import { DateTimeModel, FrequencyModel } from '../../../interfaces/EventModel';
import { VcalDateTimeValue, VcalFrequencyProperty } from '../../../interfaces/VcalModel';

const getEndType = (count?: number, until?: VcalDateTimeValue) => {
    // count and until cannot occur at the same time (see https://tools.ietf.org/html/rfc5545#page-37)
    if (count && count >= 1) {
        return END_TYPE.AFTER_N_TIMES;
    }
    if (until) {
        return END_TYPE.UNTIL;
    }
    return END_TYPE.NEVER;
};

const getMonthType = (bysetpos?: number, byday?: DAY_TO_NUMBER_KEYS | DAY_TO_NUMBER_KEYS[]) => {
    if (bysetpos && byday) {
        return bysetpos > 0 ? MONTHLY_TYPE.ON_NTH_DAY : MONTHLY_TYPE.ON_MINUS_NTH_DAY;
    }
    return MONTHLY_TYPE.ON_MONTH_DAY;
};

const getUntilDate = (until?: VcalDateTimeValue, startTzid?: string) => {
    if (!until) {
        return undefined;
    }
    if (!until.isUTC) {
        // this will only occur for all-day events
        const { year, month, day } = until;
        return new Date(year, month - 1, day);
    }
    const utcDate = propertyToUTCDate({ value: until });
    const localDate = startTzid ? convertUTCDateTimeToZone(fromUTCDate(utcDate), startTzid) : fromUTCDate(utcDate);
    return new Date(localDate.year, localDate.month - 1, localDate.day);
};

const getWeeklyDays = (startDate: Date, byday?: DAY_TO_NUMBER_KEYS | DAY_TO_NUMBER_KEYS[]) => {
    const DEFAULT = [startDate.getDay()];

    if (!byday) {
        return DEFAULT;
    }

    const bydayArray = Array.isArray(byday) ? byday : [byday];
    if (bydayArray.some((DD) => DAY_TO_NUMBER[DD] === undefined)) {
        return DEFAULT;
    }
    return bydayArray.map((DD) => DAY_TO_NUMBER[DD]);
};

/**
 * Given a parsed recurrence rule in standard format,
 * parse it into the object that goes in the Event model
 */
export const propertiesToFrequencyModel = (
    { value: frequencyProperty }: Partial<VcalFrequencyProperty> = {},
    { date: startDate, tzid: startTzid }: DateTimeModel
): FrequencyModel => {
    const { freq, count, interval, until, bysetpos, byday, bymonthday, bymonth } = frequencyProperty || {};
    const isCustom = !!(count || interval || until || bysetpos || byday || bymonthday || bymonth);

    const type = isCustom ? FREQUENCY.CUSTOM : freq || FREQUENCY.ONCE;
    const frequency = freq || FREQUENCY.WEEKLY;

    const endType = getEndType(count, until);
    const monthType = getMonthType(bysetpos, byday);
    const untilDate = getUntilDate(until, startTzid);
    const weeklyDays = getWeeklyDays(startDate, byday);

    return {
        type,
        frequency,
        interval: interval || 1, // INTERVAL=1 is ignored when parsing a recurring rule
        daily: {
            type: DAILY_TYPE.ALL_DAYS
        },
        weekly: {
            type: WEEKLY_TYPE.ON_DAYS,
            days: weeklyDays
        },
        monthly: {
            type: monthType
        },
        yearly: {
            type: YEARLY_TYPE.BY_MONTH_ON_MONTH_DAY
        },
        ends: {
            type: endType,
            count: count || 2,
            until: untilDate
        }
    };
};
