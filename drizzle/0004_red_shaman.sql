ALTER TABLE `userSubscriptions` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `userSubscriptions` ADD `stripeProductKey` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);