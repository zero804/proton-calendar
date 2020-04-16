import { DAILY_TYPE, END_TYPE, FREQUENCY, MONTHLY_TYPE, WEEKLY_TYPE, YEARLY_TYPE } from '../constants';
import { NotificationModel } from './NotificationModel';

export interface FrequencyModel {
    type: FREQUENCY;
    frequency: FREQUENCY;
    interval?: number;
    daily: {
        type: DAILY_TYPE;
    };
    weekly: {
        type: WEEKLY_TYPE;
        days: number[];
    };
    monthly: {
        type: MONTHLY_TYPE;
    };
    yearly: {
        type: YEARLY_TYPE;
    };
    ends: {
        type: END_TYPE;
        count?: number;
        until?: Date;
    };
}

// todo
export interface AttendeeModel {
    name: string;
    email: string;
    permissions: any;
    rsvp: string;
}

export interface DateTimeModel {
    date: Date;
    time: Date;
    tzid: string;
}

export interface CalendarModel {
    id: string;
    color: string;
}

export interface CalendarsModel {
    text: string;
    value: string;
    color: string;
}

export interface EventModel {
    type: 'event' | 'alarm' | 'task';
    uid?: string;
    frequencyModel: FrequencyModel;
    title: string;
    location: string;
    description: string;
    calendar: CalendarModel;
    calendars: CalendarsModel[];
    //attendees: AttendeeModel[];
    attendees?: any;
    start: DateTimeModel;
    end: DateTimeModel;
    isAllDay: boolean;
    rest: any;
    defaultPartDayNotification: NotificationModel;
    defaultFullDayNotification: NotificationModel;
    fullDayNotifications: NotificationModel[];
    partDayNotifications: NotificationModel[];
    initialDate: Date;
    initialTzid: string;
    defaultEventDuration: number;
    hasCalendarRow: boolean;
    hasFrequencyRow: boolean;
    hasModifiedNotifications: {
        partDay: boolean;
        fullDay: boolean;
    };
}

export interface EventModelErrors {
    title?: string;
    end?: string;
    interval?: string;
    until?: string;
    count?: string;
}