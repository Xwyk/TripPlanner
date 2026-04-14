<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260414194421 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE meal DROP estimated_cost');
        $this->addSql('ALTER TABLE recipe DROP default_portions');
        $this->addSql('ALTER TABLE recipe DROP estimated_cost');
        $this->addSql('ALTER TABLE recipe_ingredient ADD price_per_person NUMERIC(10, 2) DEFAULT NULL');
        $this->addSql('ALTER TABLE recipe_ingredient RENAME COLUMN quantity TO quantity_per_person');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE meal ADD estimated_cost NUMERIC(10, 2) DEFAULT NULL');
        $this->addSql('ALTER TABLE recipe ADD default_portions INT NOT NULL');
        $this->addSql('ALTER TABLE recipe ADD estimated_cost NUMERIC(10, 2) DEFAULT NULL');
        $this->addSql('ALTER TABLE recipe_ingredient DROP price_per_person');
        $this->addSql('ALTER TABLE recipe_ingredient RENAME COLUMN quantity_per_person TO quantity');
    }
}
