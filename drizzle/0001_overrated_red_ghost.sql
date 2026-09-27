CREATE TABLE `loginAttempt` (
	`adminUserId` text PRIMARY KEY NOT NULL,
	`failures` integer NOT NULL,
	`windowStart` integer NOT NULL,
	FOREIGN KEY (`adminUserId`) REFERENCES `adminUser`(`id`) ON UPDATE no action ON DELETE cascade
);
