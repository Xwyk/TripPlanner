<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260414200103 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE recipe ADD trip_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE recipe ADD CONSTRAINT FK_DA88B137A5BC2E0E FOREIGN KEY (trip_id) REFERENCES trip (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_DA88B137A5BC2E0E ON recipe (trip_id)');

        // Assign existing orphan recipes to the first available trip
        $this->addSql('UPDATE recipe SET trip_id = (SELECT MIN(id) FROM trip) WHERE trip_id IS NULL');

        // Now set the column to NOT NULL
        $this->addSql('ALTER TABLE recipe ALTER COLUMN trip_id SET NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE recipe DROP CONSTRAINT FK_DA88B137A5BC2E0E');
        $this->addSql('DROP INDEX IDX_DA88B137A5BC2E0E');
        $this->addSql('ALTER TABLE recipe DROP trip_id');
    }
}
