CREATE TABLE `adminSession` (
	`id` text PRIMARY KEY NOT NULL,
	`adminUserId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`adminUserId`) REFERENCES `adminUser`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `adminUser` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`passwordHash` text NOT NULL,
	`name` text,
	`createdAt` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `adminUser_email_unique` ON `adminUser` (`email`);--> statement-breakpoint
CREATE TABLE `course` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `industry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `member` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectUUID` text NOT NULL,
	`name` text,
	`contact` text,
	`isFounder` integer,
	`isLeader` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectUUID` text NOT NULL,
	`name` text NOT NULL,
	`slogan` text,
	`projectDescription` text,
	`targetAudience` text,
	`productDescription` text,
	`projectViability` text,
	`link` text,
	`year` integer,
	`semester` integer,
	`course` integer,
	`tech` integer,
	`industry` integer,
	`logoImg` text,
	`teamImg` text,
	`productImg` text,
	`date` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`status` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`year`) REFERENCES `year`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`semester`) REFERENCES `semester`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tech`) REFERENCES `tech`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`industry`) REFERENCES `industry`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_projectUUID_unique` ON `project` (`projectUUID`);--> statement-breakpoint
CREATE TABLE `semester` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tech` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `year` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
