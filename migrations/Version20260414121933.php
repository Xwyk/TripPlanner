<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260414121933 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE participant_trip (participant_id INT NOT NULL, trip_id INT NOT NULL, PRIMARY KEY (participant_id, trip_id))');
        $this->addSql('CREATE INDEX IDX_A2E2E7059D1C3019 ON participant_trip (participant_id)');
        $this->addSql('CREATE INDEX IDX_A2E2E705A5BC2E0E ON participant_trip (trip_id)');
        $this->addSql('ALTER TABLE participant_trip ADD CONSTRAINT FK_A2E2E7059D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE participant_trip ADD CONSTRAINT FK_A2E2E705A5BC2E0E FOREIGN KEY (trip_id) REFERENCES trip (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE participant DROP CONSTRAINT fk_participant_trip_id');
        $this->addSql('DROP INDEX idx_d79f6b11a5bc2e0e');
        $this->addSql('ALTER TABLE participant DROP trip_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE participant_trip DROP CONSTRAINT FK_A2E2E7059D1C3019');
        $this->addSql('ALTER TABLE participant_trip DROP CONSTRAINT FK_A2E2E705A5BC2E0E');
        $this->addSql('DROP TABLE participant_trip');
        $this->addSql('ALTER TABLE participant ADD trip_id INT NOT NULL');
        $this->addSql('ALTER TABLE participant ADD CONSTRAINT fk_participant_trip_id FOREIGN KEY (trip_id) REFERENCES trip (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_d79f6b11a5bc2e0e ON participant (trip_id)');
    }
}
