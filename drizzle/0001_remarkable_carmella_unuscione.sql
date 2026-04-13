CREATE TABLE `articleCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `articleCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `articleCategories_name_unique` UNIQUE(`name`),
	CONSTRAINT `articleCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`slug` varchar(512) NOT NULL,
	`excerpt` text,
	`content` longtext NOT NULL,
	`authorId` int,
	`categoryId` int,
	`countryId` int,
	`featuredImage` varchar(512),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`minSubscriptionTier` enum('free','standard','premium','enterprise') NOT NULL DEFAULT 'free',
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`publishedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `authors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`bio` text,
	`avatar` varchar(512),
	`specialization` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `authors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `callsForBids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`slug` varchar(512) NOT NULL,
	`description` longtext NOT NULL,
	`publisherId` int,
	`countryId` int,
	`sector` varchar(255),
	`budget` decimal(15,2),
	`currency` varchar(3) DEFAULT 'USD',
	`deadline` timestamp,
	`status` enum('open','closed','awarded') NOT NULL DEFAULT 'open',
	`image` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `callsForBids_id` PRIMARY KEY(`id`),
	CONSTRAINT `callsForBids_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(2) NOT NULL,
	`name` varchar(255) NOT NULL,
	`flag` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `economicActors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(512) NOT NULL,
	`slug` varchar(512) NOT NULL,
	`description` longtext,
	`sector` varchar(255),
	`subsector` varchar(255),
	`countryId` int,
	`website` varchar(512),
	`email` varchar(320),
	`phone` varchar(20),
	`logo` varchar(512),
	`foundedYear` int,
	`employees` varchar(100),
	`verified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `economicActors_id` PRIMARY KEY(`id`),
	CONSTRAINT `economicActors_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`slug` varchar(512) NOT NULL,
	`description` longtext,
	`type` enum('conference','webinar','training','workshop','networking') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`location` varchar(512),
	`countryId` int,
	`organizerId` int,
	`image` varchar(512),
	`capacity` int,
	`registeredCount` int DEFAULT 0,
	`status` enum('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `investmentOpportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`slug` varchar(512) NOT NULL,
	`description` longtext NOT NULL,
	`actorId` int,
	`countryId` int,
	`sector` varchar(255),
	`investmentType` enum('equity','debt','grant','partnership') NOT NULL,
	`targetAmount` decimal(15,2),
	`currency` varchar(3) DEFAULT 'USD',
	`minInvestment` decimal(15,2),
	`expectedReturn` varchar(100),
	`timeline` varchar(255),
	`status` enum('open','closed','funded') NOT NULL DEFAULT 'open',
	`image` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investmentOpportunities_id` PRIMARY KEY(`id`),
	CONSTRAINT `investmentOpportunities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`subject` varchar(512),
	`content` longtext NOT NULL,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `readingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`articleId` int,
	`actorId` int,
	`opportunityId` int,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `readingHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tier` enum('standard','premium','enterprise') NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`monthlyPrice` decimal(10,2) NOT NULL,
	`annualPrice` decimal(10,2),
	`features` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptionPlans_tier_unique` UNIQUE(`tier`)
);
--> statement-breakpoint
CREATE TABLE `userAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('article','investment','bid','event','message') NOT NULL,
	`keywords` json,
	`countries` json,
	`sectors` json,
	`enabled` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`articleId` int,
	`actorId` int,
	`opportunityId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int,
	`tier` enum('standard','premium','enterprise') NOT NULL,
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`autoRenew` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','standard','premium','enterprise') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_authorId_authors_id_fk` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_categoryId_articleCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `articleCategories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `authors` ADD CONSTRAINT `authors_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `callsForBids` ADD CONSTRAINT `callsForBids_publisherId_economicActors_id_fk` FOREIGN KEY (`publisherId`) REFERENCES `economicActors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `callsForBids` ADD CONSTRAINT `callsForBids_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `economicActors` ADD CONSTRAINT `economicActors_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_organizerId_economicActors_id_fk` FOREIGN KEY (`organizerId`) REFERENCES `economicActors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investmentOpportunities` ADD CONSTRAINT `investmentOpportunities_actorId_economicActors_id_fk` FOREIGN KEY (`actorId`) REFERENCES `economicActors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investmentOpportunities` ADD CONSTRAINT `investmentOpportunities_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipientId_users_id_fk` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `readingHistory` ADD CONSTRAINT `readingHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `readingHistory` ADD CONSTRAINT `readingHistory_articleId_articles_id_fk` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `readingHistory` ADD CONSTRAINT `readingHistory_actorId_economicActors_id_fk` FOREIGN KEY (`actorId`) REFERENCES `economicActors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `readingHistory` ADD CONSTRAINT `readingHistory_opportunityId_investmentOpportunities_id_fk` FOREIGN KEY (`opportunityId`) REFERENCES `investmentOpportunities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAlerts` ADD CONSTRAINT `userAlerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userFavorites` ADD CONSTRAINT `userFavorites_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userFavorites` ADD CONSTRAINT `userFavorites_articleId_articles_id_fk` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userFavorites` ADD CONSTRAINT `userFavorites_actorId_economicActors_id_fk` FOREIGN KEY (`actorId`) REFERENCES `economicActors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userFavorites` ADD CONSTRAINT `userFavorites_opportunityId_investmentOpportunities_id_fk` FOREIGN KEY (`opportunityId`) REFERENCES `investmentOpportunities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSubscriptions` ADD CONSTRAINT `userSubscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSubscriptions` ADD CONSTRAINT `userSubscriptions_planId_subscriptionPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `subscriptionPlans`(`id`) ON DELETE no action ON UPDATE no action;