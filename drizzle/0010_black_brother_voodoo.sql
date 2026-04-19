CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`slug` varchar(512) NOT NULL,
	`category` enum('communique','sponsored','report') NOT NULL,
	`source` varchar(255),
	`excerpt` text,
	`content` longtext,
	`tag` varchar(100),
	`image` varchar(512),
	`externalLink` varchar(1024),
	`featured` boolean DEFAULT false,
	`published` boolean DEFAULT true,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `partners_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `minSubscriptionTier` enum('free','premium','integral') NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `subscriptionPlans` MODIFY COLUMN `tier` enum('premium','integral') NOT NULL;--> statement-breakpoint
ALTER TABLE `userSubscriptions` MODIFY COLUMN `tier` enum('premium','integral') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `hasNewsletterPremium` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `subscriptionTier` enum('free','premium','integral') NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `contactMessages` ADD `priority` enum('normal','priority') DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `isExclusive` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `investmentOpportunities` ADD `minSubscriptionTier` enum('free','premium','integral') DEFAULT 'premium' NOT NULL;--> statement-breakpoint
UPDATE `articles` SET `minSubscriptionTier` = 'free' WHERE `minSubscriptionTier` = 'standard';--> statement-breakpoint
UPDATE `articles` SET `minSubscriptionTier` = 'integral' WHERE `minSubscriptionTier` = 'enterprise';--> statement-breakpoint
UPDATE `subscriptionPlans` SET `tier` = 'premium' WHERE `tier` = 'standard';--> statement-breakpoint
UPDATE `subscriptionPlans` SET `tier` = 'integral' WHERE `tier` = 'enterprise';--> statement-breakpoint
UPDATE `userSubscriptions` SET `tier` = 'premium' WHERE `tier` = 'standard';--> statement-breakpoint
UPDATE `userSubscriptions` SET `tier` = 'integral' WHERE `tier` = 'enterprise';--> statement-breakpoint
UPDATE `users` SET `hasNewsletterPremium` = true WHERE `subscriptionTier` = 'standard';--> statement-breakpoint
UPDATE `users` SET `subscriptionTier` = 'free' WHERE `subscriptionTier` = 'standard';--> statement-breakpoint
UPDATE `users` SET `subscriptionTier` = 'integral', `hasNewsletterPremium` = true WHERE `subscriptionTier` = 'enterprise';
