CREATE TABLE `contactMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(512) NOT NULL,
	`message` longtext NOT NULL,
	`category` enum('general','editorial','partnership','advertising','subscription','other') NOT NULL DEFAULT 'general',
	`status` enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
	`repliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contactMessages_id` PRIMARY KEY(`id`)
);
