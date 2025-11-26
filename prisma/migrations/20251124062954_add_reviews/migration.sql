-- CreateTable
CREATE TABLE `danh_gia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_san_pham` INTEGER NOT NULL,
    `id_khach_hang` INTEGER NOT NULL,
    `sao` INTEGER NOT NULL,
    `noi_dung` TEXT NULL,
    `ngay_tao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_san_pham`(`id_san_pham`),
    INDEX `id_khach_hang`(`id_khach_hang`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `danh_gia` ADD CONSTRAINT `danh_gia_id_san_pham_fkey` FOREIGN KEY (`id_san_pham`) REFERENCES `san_pham`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `danh_gia` ADD CONSTRAINT `danh_gia_id_khach_hang_fkey` FOREIGN KEY (`id_khach_hang`) REFERENCES `khach_hang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
