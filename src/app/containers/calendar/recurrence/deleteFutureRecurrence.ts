import { getPropertyTzid, isIcalPropertyAllDay } from 'proton-shared/lib/calendar/vcalConverter';
import { fromUTCDate } from 'proton-shared/lib/date/timezone';
import { addDays } from 'proton-shared/lib/date-fns-utc';
import { omit } from 'proton-shared/lib/helpers/object';
import { getUntilProperty } from '../../../components/eventModal/eventForm/modelToFrequencyProperties';
import { VcalVeventComponent } from '../../../interfaces/VcalModel';
import { getSafeRruleCount } from './helper';

const deleteFutureRecurrence = (
    component: VcalVeventComponent,
    localStartToExclude: Date,
    occurrenceNumber: number
): VcalVeventComponent => {
    const { dtstart, rrule } = component;

    if (!rrule) {
        throw new Error('Trying to delete future recurrence of a non-recurring event');
    }

    if (rrule.value.count) {
        const newCount = occurrenceNumber - 1;
        const safeRrule = getSafeRruleCount(rrule, newCount);
        if (!safeRrule) {
            return omit(component, ['rrule']);
        }
        return { ...component, rrule: safeRrule };
    }

    // Subtract one day from the local start, and get until property which in the end yields the previous day at 23:59:59
    const until = getUntilProperty(
        fromUTCDate(addDays(localStartToExclude, -1)),
        isIcalPropertyAllDay(dtstart),
        getPropertyTzid(dtstart)
    );

    return {
        ...component,
        rrule: {
            ...rrule,
            value: {
                ...rrule.value,
                until
            }
        }
    };
};

export default deleteFutureRecurrence;