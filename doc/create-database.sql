DROP DATABASE IF EXISTS `texocms`;
CREATE DATABASE `texocms`;

USE `texocsm`;

CREATE TABLE `settings` (
	`themeName` VARCHAR(50) NOT NULL DEFAULT 'default',
	`timezone` VARCHAR(50) NOT NULL DEFAULT 'UTC'
) ENGINE=MyISAM;

CREATE TABLE `user` (
	`id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`email` VARCHAR(255) NOT NULL UNIQUE,
	`password` VARCHAR(255) NOT NULL,
	`firstName` VARCHAR(50) NOT NULL,
	`lastName` VARCHAR(50) NOT NULL
) ENGINE=MyISAM;

CREATE INDEX `idx_user_email` ON `user` (`email`);

CREATE TABLE `poststatus` (
	`id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`status` VARCHAR(20) NOT NULL
) ENGINE=MyISAM;

CREATE TABLE `post` (
	`id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`title` VARCHAR(175) NOT NULL,
	`authorId` INT UNSIGNED NOT NULL,
	`slug` VARCHAR(300) NOT NULL,
	`content` TEXT,
	`createdDateTime` DATETIME,
	`publishedDateTime` DATETIME,
	`publishedYear` INT,
	`publishedMonth` INT,
	`postStatusId` INT UNSIGNED,

	FOREIGN KEY (`authorId`) REFERENCES user(`id`),
	FOREIGN KEY (`postStatusId`) REFERENCES poststatus(`id`)
) ENGINE=MyISAM;

CREATE INDEX `idx_post_publishedDateTime` ON `post` (`publishedDateTime`);

CREATE TABLE `posttag` (
	`id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`tag` VARCHAR(20) NOT NULL,
	`howManyTimesUsed` INT NOT NULL DEFAULT 0,

	UNIQUE KEY `posttag_tag` (`tag`)
) ENGINE=MyISAM;

CREATE INDEX `idx_posttag_tag` ON `posttag` (`tag`);

CREATE TABLE `post_posttag` (
	`id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`postId` INT UNSIGNED NOT NULL,
	`postTagId` INT UNSIGNED NOT NULL,

	UNIQUE KEY `post_posttag_unique_tagandid` (`postId`, `postTagId`),
	FOREIGN KEY (`postId`) REFERENCES post(`id`),
	FOREIGN KEY (`postTagId`) REFERENCES posttag(`id`)
) ENGINE=MyISAM;

