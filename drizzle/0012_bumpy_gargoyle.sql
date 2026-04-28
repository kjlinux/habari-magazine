CREATE TABLE `communityMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255),
	`company` varchar(255),
	`country` varchar(255),
	`category` varchar(100),
	`bio` text,
	`avatar` varchar(512),
	`linkedin` varchar(512),
	`email` varchar(320),
	`verified` boolean DEFAULT false,
	`featured` boolean DEFAULT false,
	`published` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `economicIndicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`value` varchar(100) NOT NULL,
	`trend` enum('up','down','stable') NOT NULL DEFAULT 'stable',
	`delta` varchar(50),
	`category` enum('macro','commodity') NOT NULL DEFAULT 'macro',
	`periodLabel` varchar(100),
	`sortOrder` int DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `economicIndicators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `newsletterSubscribers` MODIFY COLUMN `status` enum('pending','active','unsubscribed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `newsletterSubscribers` ADD `confirmToken` varchar(64);--> statement-breakpoint
ALTER TABLE `newsletterSubscribers` ADD `confirmedAt` timestamp;--> statement-breakpoint
ALTER TABLE `newsletterSubscribers` ADD `unsubscribeToken` varchar(64);