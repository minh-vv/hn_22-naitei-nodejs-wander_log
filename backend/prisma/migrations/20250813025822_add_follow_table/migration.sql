-- CreateTable
CREATE TABLE `follow` (
    `followerId` VARCHAR(191) NOT NULL,
    `followingId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`followerId`, `followingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `follow` ADD CONSTRAINT `follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow` ADD CONSTRAINT `follow_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
