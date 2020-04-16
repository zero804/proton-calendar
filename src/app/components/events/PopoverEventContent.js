import React, { useMemo } from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { Icon, Info } from 'react-components';
import { format as formatUTC } from 'proton-shared/lib/date-fns-utc';
import { dateLocale } from 'proton-shared/lib/i18n';
import { getFormattedWeekdays } from 'proton-shared/lib/date/date';
import { truncate } from 'proton-shared/lib/helpers/string';

import PopoverNotification from './PopoverNotification';
import CalendarIcon from '../CalendarIcon';
import { getTimezonedFrequencyString } from '../../helpers/rrule';

const PopoverEventContent = ({
    Calendar = {},
    isCalendarDisabled,
    event: { start, end, isAllDay, isAllPartDay } = {},
    tzid,
    weekStartsOn,
    model,
    formatTime
}) => {
    const { Name: calendarName, Color } = Calendar;
    const trimmedLocation = typeof model.location === 'string' ? model.location.trim() : '';
    const trimmedDescription = typeof model.description === 'string' ? model.description.trim() : '';

    const dateString = useMemo(() => {
        const dateStart = formatUTC(start, 'PP', { locale: dateLocale });
        const dateEnd = formatUTC(end, 'PP', { locale: dateLocale });

        if (dateStart === dateEnd) {
            return dateStart;
        }

        return `${dateStart} - ${dateEnd}`;
    }, [start, end]);

    const [weekdays] = useMemo(() => {
        return ['cccc'].map((format) => getFormattedWeekdays(format, { locale: dateLocale }));
    }, [dateLocale]);

    const timeString = useMemo(() => {
        const timeStart = formatTime(start);
        const timeEnd = formatTime(end);
        return `${timeStart} - ${timeEnd}`;
    }, [start, end]);

    const frequencyString = useMemo(() => {
        return getTimezonedFrequencyString(model.frequencyModel, {
            date: model.start.date,
            startTzid: model.start.tzid,
            currentTzid: tzid,
            weekdays,
            weekStartsOn,
            locale: dateLocale
        });
    }, [model.frequencyModel, weekdays, start]);

    const calendarString = useMemo(() => {
        if (isCalendarDisabled) {
            const truncatedCalendarName = truncate(calendarName, 32);
            const disabledText = <span className="italic">({c('Disabled calendar').t`Disabled`})</span>;
            const tooltipText = c('Disabled calendar')
                .t`The event belongs to a disabled calendar and you cannot modify it. Please enable your email address again to enable the calendar.`;
            return (
                <>
                    {truncatedCalendarName} {disabledText} <Info title={tooltipText} />
                </>
            );
        }
        return calendarName;
    }, [calendarName, isCalendarDisabled]);

    const wrapClassName = 'flex flex-nowrap mb0-5';
    const iconClassName = 'flex-item-noshrink mr1 mt0-25';

    return (
        <>
            <div className={wrapClassName}>
                <Icon name="clock" className={iconClassName} />
                <div className="flex flex-column">
                    {!isAllDay || isAllPartDay ? <span>{timeString}</span> : null}
                    <span>{dateString}</span>
                </div>
            </div>
            {frequencyString ? (
                <div className={wrapClassName}>
                    <Icon name="reload" className={iconClassName} />
                    <span>{frequencyString}</span>
                </div>
            ) : null}
            {trimmedLocation ? (
                <div className={wrapClassName}>
                    <Icon title={c('Title').t`Location`} name="address" className={iconClassName} />
                    <span className="break">{trimmedLocation}</span>
                </div>
            ) : null}
            {calendarString ? (
                <div className={wrapClassName}>
                    <CalendarIcon color={Color} className={iconClassName} />
                    <span className="ellipsis" title={calendarName}>
                        {calendarString}
                    </span>
                </div>
            ) : null}
            {trimmedDescription ? (
                <div className={wrapClassName}>
                    <Icon title={c('Title').t`Description`} name="note" className={iconClassName} />
                    <p className="break mt0 mb0 pre-wrap">{trimmedDescription}</p>
                </div>
            ) : null}
            {model.notifications && Array.isArray(model.notifications) && model.notifications.length ? (
                <div className={wrapClassName}>
                    <Icon name="notifications-enabled" className={iconClassName} />
                    <div className="flex flex-column">
                        {model.notifications.map((notification, i) => {
                            return <PopoverNotification key={i} notification={notification} formatTime={formatTime} />;
                        })}
                    </div>
                </div>
            ) : null}
        </>
    );
};

PopoverEventContent.propTypes = {
    Calendar: PropTypes.object,
    isCalendarDisabled: PropTypes.bool,
    event: PropTypes.object,
    tzid: PropTypes.string,
    weekStartsOn: PropTypes.number,
    model: PropTypes.object,
    formatTime: PropTypes.func
};

export default PopoverEventContent;
