-- CreateTable
CREATE TABLE `gio_hang_combo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_khach_hang` INTEGER NOT NULL,
    `ten_combo` VARCHAR(200) NOT NULL,
    `gia_ban` DECIMAL(10, 2) NOT NULL,
    `so_luong` INTEGER NOT NULL DEFAULT 1,
    `ngay_them` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `gio_hang_combo_id_khach_hang_idx`(`id_khach_hang`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gio_hang_combo_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_gio_hang_combo` INTEGER NOT NULL,
    `id_san_pham` INTEGER NOT NULL,
    `ten_san_pham` VARCHAR(100) NOT NULL,
    `so_luong` INTEGER NOT NULL,
    `don_gia` DECIMAL(10, 2) NOT NULL,

    INDEX `gio_hang_combo_item_id_gio_hang_combo_idx`(`id_gio_hang_combo`),
    INDEX `gio_hang_combo_item_id_san_pham_idx`(`id_san_pham`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gio_hang_combo` ADD CONSTRAINT `gio_hang_combo_id_khach_hang_fkey` FOREIGN KEY (`id_khach_hang`) REFERENCES `khach_hang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gio_hang_combo_item` ADD CONSTRAINT `gio_hang_combo_item_id_gio_hang_combo_fkey` FOREIGN KEY (`id_gio_hang_combo`) REFERENCES `gio_hang_combo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gio_hang_combo_item` ADD CONSTRAINT `gio_hang_combo_item_id_san_pham_fkey` FOREIGN KEY (`id_san_pham`) REFERENCES `san_pham`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
