-- CreateTable
CREATE TABLE `activities` (
    `id` VARCHAR(191) NOT NULL,
    `itinerary_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `start_time` VARCHAR(191) NULL,
    `end_time` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `location` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_itinerary_id_fkey` FOREIGN KEY (`itinerary_id`) REFERENCES `itineraries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
