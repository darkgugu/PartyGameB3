-- CreateTable
CREATE TABLE `Utilisateur` (
    `idUtilisateur` INTEGER NOT NULL AUTO_INCREMENT,
    `firebase_uid` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `nom_de_famille` VARCHAR(191) NOT NULL,
    `pseudo` VARCHAR(191) NOT NULL,
    `date_inscription` DATETIME(3) NOT NULL,
    `points_succes` INTEGER NOT NULL,
    `avatar` VARCHAR(191) NOT NULL,
    `birthdate` DATETIME(3) NULL,
    `country` VARCHAR(191) NULL,
    `about` VARCHAR(191) NULL,

    UNIQUE INDEX `Utilisateur_firebase_uid_key`(`firebase_uid`),
    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    UNIQUE INDEX `Utilisateur_pseudo_key`(`pseudo`),
    PRIMARY KEY (`idUtilisateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Statistique` (
    `idStatistiques` INTEGER NOT NULL AUTO_INCREMENT,
    `idUtilisateur` INTEGER NOT NULL,
    `nombre_victoire` INTEGER NOT NULL,
    `heure_jouees` INTEGER NOT NULL,
    `nombre_parties` INTEGER NOT NULL,

    PRIMARY KEY (`idStatistiques`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Relations_Joueurs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idJoueur1` INTEGER NOT NULL,
    `idJoueur2` INTEGER NOT NULL,
    `relation` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Succes` (
    `idSucces` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `objectif` INTEGER NOT NULL,
    `image` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idSucces`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Joueurs_has_Succes` (
    `idUtilisateur` INTEGER NOT NULL,
    `idSucces` INTEGER NOT NULL,
    `progression` INTEGER NOT NULL DEFAULT 0,
    `obtenu` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`idUtilisateur`, `idSucces`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `idsession` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idsession`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Joueurs_dans_Session` (
    `idUtilisateur` INTEGER NOT NULL,
    `idSession` INTEGER NOT NULL,
    `place` INTEGER NULL,

    PRIMARY KEY (`idUtilisateur`, `idSession`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jeux` (
    `idJeux` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `nombre_de_joueurs` INTEGER NOT NULL,

    UNIQUE INDEX `Jeux_slug_key`(`slug`),
    PRIMARY KEY (`idJeux`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pack` (
    `idPack` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idPack`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pack_has_Jeux` (
    `idPack` INTEGER NOT NULL,
    `idJeux` INTEGER NOT NULL,

    PRIMARY KEY (`idPack`, `idJeux`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jeux_has_Session` (
    `idJeux` INTEGER NOT NULL,
    `idSession` INTEGER NOT NULL,

    PRIMARY KEY (`idJeux`, `idSession`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Statistique` ADD CONSTRAINT `Statistique_idUtilisateur_fkey` FOREIGN KEY (`idUtilisateur`) REFERENCES `Utilisateur`(`idUtilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relations_Joueurs` ADD CONSTRAINT `fk_relations_joueurs_joueur1` FOREIGN KEY (`idJoueur1`) REFERENCES `Utilisateur`(`idUtilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relations_Joueurs` ADD CONSTRAINT `fk_relations_joueurs_joueur2` FOREIGN KEY (`idJoueur2`) REFERENCES `Utilisateur`(`idUtilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Joueurs_has_Succes` ADD CONSTRAINT `Joueurs_has_Succes_idUtilisateur_fkey` FOREIGN KEY (`idUtilisateur`) REFERENCES `Utilisateur`(`idUtilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Joueurs_has_Succes` ADD CONSTRAINT `Joueurs_has_Succes_idSucces_fkey` FOREIGN KEY (`idSucces`) REFERENCES `Succes`(`idSucces`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Joueurs_dans_Session` ADD CONSTRAINT `fk_joueurs_dans_session_utilisateur` FOREIGN KEY (`idUtilisateur`) REFERENCES `Utilisateur`(`idUtilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Joueurs_dans_Session` ADD CONSTRAINT `fk_joueurs_dans_session_session` FOREIGN KEY (`idSession`) REFERENCES `Session`(`idsession`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pack_has_Jeux` ADD CONSTRAINT `Pack_has_Jeux_idPack_fkey` FOREIGN KEY (`idPack`) REFERENCES `Pack`(`idPack`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pack_has_Jeux` ADD CONSTRAINT `Pack_has_Jeux_idJeux_fkey` FOREIGN KEY (`idJeux`) REFERENCES `Jeux`(`idJeux`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jeux_has_Session` ADD CONSTRAINT `Jeux_has_Session_idJeux_fkey` FOREIGN KEY (`idJeux`) REFERENCES `Jeux`(`idJeux`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Jeux_has_Session` ADD CONSTRAINT `Jeux_has_Session_idSession_fkey` FOREIGN KEY (`idSession`) REFERENCES `Session`(`idsession`) ON DELETE RESTRICT ON UPDATE CASCADE;
