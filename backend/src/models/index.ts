/**
 * Models Index
 * Export all database models
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

export { default as User } from './User';
export { default as JournalEntry } from './JournalEntry';
export { default as Goal } from './Goal';
export { Badge, UserBadge } from './Badge';
export { default as Collection } from './Collection';
export { default as Reminder } from './Reminder';
export { default as Category } from './Category';
export { default as Template } from './Template';
export { default as Challenge } from './Challenge';
export { default as FamilyJournal } from './FamilyJournal';

export type { IUser } from './User';
export type { IJournalEntry, IMedia, ILocation } from './JournalEntry';
export type { IGoal } from './Goal';
export type { IBadge, IUserBadge } from './Badge';
export type { ICollection } from './Collection';
export type { IReminder } from './Reminder';
export type { ICategory } from './Category';
export type { ITemplate } from './Template';
export type { IChallenge } from './Challenge';
export type { IFamilyJournal } from './FamilyJournal';
