-- DropForeignKey
ALTER TABLE `follow` DROP FOREIGN KEY `follow_followerId_fkey`;

-- DropForeignKey
ALTER TABLE `follow` DROP FOREIGN KEY `follow_followingId_fkey`;

-- DropIndex
DROP INDEX `follow_followingId_fkey` ON `follow`;

-- AddForeignKey
ALTER TABLE `follow` ADD CONSTRAINT `follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow` ADD CONSTRAINT `follow_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
