CREATE TABLE `magazinePurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`issueId` int NOT NULL,
	`issueNumber` varchar(20) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'eur',
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`status` enum('pending','paid','refunded','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	CONSTRAINT `magazinePurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`label` varchar(255),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `notifNewsletter` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifNewArticles` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifInvestments` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifTenders` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifEvents` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `magazinePurchases` ADD CONSTRAINT `magazinePurchases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `magazinePurchases` ADD CONSTRAINT `magazinePurchases_issueId_magazineIssues_id_fk` FOREIGN KEY (`issueId`) REFERENCES `magazineIssues`(`id`) ON DELETE no action ON UPDATE no action;