import * as mongoose from "mongoose";

export enum eventType {
    ANNUAL_LEAVE = "ANNUAL_LEAVE",
    SICK_LEAVE = "SICK_LEAVE",
}

export enum AnnualLeaveType {
    ANNUAL_LEAVE = "ANNUAL_LEAVE",
    APPOINTMENT = "APPOINTMENT",
    ARMED_SERVICES_LEAVE = "ARMED_SERVICES_LEAVE",
    COMMUNITY_SERVICE = "COMMUNITY_SERVICE",
    COMPASSIONATE_LEAVE = "COMPASSIONATE_LEAVE",
    DEPENDANTS_LEAVE = "DEPENDANTS_LEAVE",
    JURY_DUTY = "JURY_DUTY",
    STUDY_LEAVE = "STUDY_LEAVE",
    UNION_DUTIES = "UNION_DUTIES",
    UNPAID_LEAVE = "UNPAID_LEAVE",
}

export enum SickLeaveType {
    INJURY = "INJURY",
    LONG_TERM_SICKNESS = "LONG_TERM_SICKNESS",
    MEDICAL_PROCEDURE = "MEDICAL_PROCEDURE",
    NOTIFIABLE_DISEASE = "NOTIFIABLE_DISEASE",
    PREGNANCY_RELATED_ILLNESS = "PREGNANCY_RELATED_ILLNESS",
    SICKNESS = "SICKNESS",
}

export interface ICalendarEvent extends mongoose.Document {
    createdAt: Date;
    customerId: string;
    duration: number;
    endAt: Date;
    eventType: eventType;
    id: string;
    isAllDay: boolean;
    leaveType: AnnualLeaveType | SickLeaveType;
    startAt: Date;
    title: string;
    type: "CalendarEvent";
    updatedAt: Date;
    userId: string;
}

// Inspired by: https://github.com/bmoeskau/Extensible/blob/master/recurrence-overview.md
export const CalendarEventSchema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        duration: { type: Number, default: 0 },
        endAt: { type: Date, required: true, index: true },
        eventType: { type: String, required: true, index: true },
        isAllDay: { type: Boolean, default: false },
        leaveType: { type: String, required: true, index: true },
        startAt: { type: Date, required: true, index: true },
        title: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc: any, ret: any): ICalendarEvent {
                ret.id = ret._id;
                ret.type = "CalendarEvent";
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    });

// Compound index on IDs
CalendarEventSchema.index({ customerId: 1, userId: 1 });
CalendarEventSchema.index({ customerId: 1, userId: 1, _id: 1 });

export const CalendarEvent = mongoose.model("CalendarEvent", CalendarEventSchema);
