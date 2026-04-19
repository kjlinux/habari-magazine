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
