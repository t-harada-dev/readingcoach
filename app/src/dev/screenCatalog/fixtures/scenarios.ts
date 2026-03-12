import type { DailyExecutionPlanDTO } from '../../../bridge/PersistenceBridge';
import type { SessionMode } from '../../../useCases/StartSessionUseCase';
import { fixtureBooks } from './books';
import type { MockScenario } from '../types';

type ScenarioFixture = {
    scenario: MockScenario;
    continuousMissedDays: number;
    heavyDaySignal: boolean;
    notificationsAllowed: boolean;
    progressTrackingEnabled: boolean;
    bookKey: keyof typeof fixtureBooks;
    plan: DailyExecutionPlanDTO;
    mainMode: SessionMode;
    subMode: SessionMode | null;
    rehabMode: SessionMode | null;
};

const basePlan = {
    planDate: '2026-03-11',
    retryCount: 0,
    snoozeCount: 0,
    consistencyCredit: false,
} as const;

export const scenarioFixtures: Record<MockScenario, ScenarioFixture> = {
    normal: {
        scenario: 'normal',
        continuousMissedDays: 0,
        heavyDaySignal: false,
        notificationsAllowed: true,
        progressTrackingEnabled: true,
        bookKey: 'standardBook',
        plan: {
            ...basePlan,
            planId: 'fixture-plan-normal',
            bookId: fixtureBooks.standardBook.id,
            state: 'scheduled',
            result: 'attempted',
            scheduledAt: '2026-03-11T21:00:00.000Z',
            continuousMissedDaysSnapshot: 0,
        },
        mainMode: 'normal_15m',
        subMode: 'rescue_5m',
        rehabMode: null,
    },
    rehab: {
        scenario: 'rehab',
        continuousMissedDays: 3,
        heavyDaySignal: false,
        notificationsAllowed: true,
        progressTrackingEnabled: true,
        bookKey: 'lightweightBook',
        plan: {
            ...basePlan,
            planId: 'fixture-plan-rehab',
            bookId: fixtureBooks.lightweightBook.id,
            state: 'scheduled',
            result: 'missed',
            scheduledAt: '2026-03-11T20:30:00.000Z',
            continuousMissedDaysSnapshot: 3,
        },
        mainMode: 'ignition_1m',
        subMode: 'rescue_5m',
        rehabMode: null,
    },
    long_absence: {
        scenario: 'long_absence',
        continuousMissedDays: 7,
        heavyDaySignal: false,
        notificationsAllowed: false,
        progressTrackingEnabled: false,
        bookKey: 'unknownPageCountBook',
        plan: {
            ...basePlan,
            planId: 'fixture-plan-long-absence',
            bookId: fixtureBooks.unknownPageCountBook.id,
            state: 'scheduled',
            result: 'missed',
            scheduledAt: '2026-03-11T06:30:00.000Z',
            continuousMissedDaysSnapshot: 7,
        },
        mainMode: 'ignition_1m',
        subMode: 'rescue_5m',
        rehabMode: null,
    },
    due: {
        scenario: 'due',
        continuousMissedDays: 5,
        heavyDaySignal: true,
        notificationsAllowed: true,
        progressTrackingEnabled: false,
        bookKey: 'missingCoverBook',
        plan: {
            ...basePlan,
            planId: 'fixture-plan-due',
            bookId: fixtureBooks.missingCoverBook.id,
            state: 'due',
            result: 'missed',
            scheduledAt: '2026-03-11T11:30:00.000Z',
            continuousMissedDaysSnapshot: 5,
        },
        mainMode: 'ignition_1m',
        subMode: 'rescue_5m',
        rehabMode: null,
    },
};

export const fixturePlanStates = {
    scheduled: scenarioFixtures.normal.plan,
    due: scenarioFixtures.due.plan,
    deferred: {
        ...scenarioFixtures.due.plan,
        planId: 'fixture-plan-deferred',
        state: 'scheduled',
        snoozeCount: 1,
        scheduledAt: '2026-03-11T22:00:00.000Z',
    } satisfies DailyExecutionPlanDTO,
    active: {
        ...scenarioFixtures.normal.plan,
        planId: 'fixture-plan-active',
        state: 'active',
        startedAt: '2026-03-11T21:05:00.000Z',
    } satisfies DailyExecutionPlanDTO,
    finalized: {
        ...scenarioFixtures.rehab.plan,
        planId: 'fixture-plan-finalized',
        state: 'finalized',
        result: 'soft_success',
    } satisfies DailyExecutionPlanDTO,
};
