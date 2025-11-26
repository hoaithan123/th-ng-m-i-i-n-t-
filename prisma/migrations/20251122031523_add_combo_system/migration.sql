-- CreateTable
CREATE TABLE `combo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_combo` VARCHAR(100) NOT NULL,
    `mo_ta` TEXT NULL,
    `gia_ban` DECIMAL(10, 2) NULL,
    `hinh_anh` VARCHAR(255) NULL,
    `trang_thai` BOOLEAN NOT NULL DEFAULT true,
    `ngay_tao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ngay_cap_nhat` DATETIME(0) NOT NULL,

    INDEX `combo_trang_thai_idx`(`trang_thai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `combo_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_combo` INTEGER NOT NULL,
    `id_san_pham` INTEGER NOT NULL,
    `so_luong` INTEGER NOT NULL DEFAULT 1,

    INDEX `combo_item_id_combo_idx`(`id_combo`),
    INDEX `combo_item_id_san_pham_idx`(`id_san_pham`),
    UNIQUE INDEX `combo_item_id_combo_id_san_pham_key`(`id_combo`, `id_san_pham`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `combo_item` ADD CONSTRAINT `combo_item_id_combo_fkey` FOREIGN KEY (`id_combo`) REFERENCES `combo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `combo_item` ADD CONSTRAINT `combo_item_id_san_pham_fkey` FOREIGN KEY (`id_san_pham`) REFERENCES `san_pham`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
