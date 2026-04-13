ALTER TABLE `users` ADD `firstName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `jobFunction` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `organization` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `sector` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `profileCompleted` boolean DEFAULT false;