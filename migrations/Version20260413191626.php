<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Initial migration for TripPlanner entities - PostgreSQL compatible
 */
final class Version20260413191626 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create tables for Trip, Participant, Meal, Recipe, Ingredient and their relationships (PostgreSQL)';
    }

    public function up(Schema $schema): void
    {
        // Create trip table
        $this->addSql('CREATE TABLE trip (
            id SERIAL NOT NULL,
            name VARCHAR(255) NOT NULL,
            nights INT NOT NULL,
            total_budget NUMERIC(10, 2) NOT NULL,
            start_date DATE NOT NULL,
            description TEXT DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');

        // Create participant table
        $this->addSql('CREATE TABLE participant (
            id SERIAL NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) DEFAULT NULL,
            arrival_date DATE DEFAULT NULL,
            departure_date DATE DEFAULT NULL,
            nights_present JSONB DEFAULT NULL,
            trip_id INT NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_PARTICIPANT_TRIP ON participant (trip_id)');

        // Create ingredient table
        $this->addSql('CREATE TABLE ingredient (
            id SERIAL NOT NULL,
            name VARCHAR(255) NOT NULL,
            default_unit VARCHAR(50) DEFAULT NULL,
            default_quantity NUMERIC(10, 2) DEFAULT NULL,
            average_price NUMERIC(10, 2) DEFAULT NULL,
            category VARCHAR(255) DEFAULT NULL,
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');

        // Create recipe table
        $this->addSql('CREATE TABLE recipe (
            id SERIAL NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            default_portions INT NOT NULL,
            instructions TEXT DEFAULT NULL,
            estimated_cost NUMERIC(10, 2) DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');

        // Create recipe_ingredient table (join table)
        $this->addSql('CREATE TABLE recipe_ingredient (
            id SERIAL NOT NULL,
            quantity NUMERIC(10, 2) NOT NULL,
            unit VARCHAR(50) DEFAULT NULL,
            preparation_notes TEXT DEFAULT NULL,
            recipe_id INT NOT NULL,
            ingredient_id INT NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_RECIPE_INGREDIENT_RECIPE ON recipe_ingredient (recipe_id)');
        $this->addSql('CREATE INDEX IDX_RECIPE_INGREDIENT_INGREDIENT ON recipe_ingredient (ingredient_id)');

        // Create meal table
        $this->addSql('CREATE TABLE meal (
            id SERIAL NOT NULL,
            name VARCHAR(255) NOT NULL,
            meal_type VARCHAR(50) NOT NULL,
            date DATE NOT NULL,
            description TEXT DEFAULT NULL,
            number_of_portions INT NOT NULL,
            estimated_cost NUMERIC(10, 2) DEFAULT NULL,
            trip_id INT NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_MEAL_TRIP ON meal (trip_id)');

        // Create meal_recipe table (many-to-many)
        $this->addSql('CREATE TABLE meal_recipe (
            meal_id INT NOT NULL,
            recipe_id INT NOT NULL,
            PRIMARY KEY(meal_id, recipe_id)
        )');
        $this->addSql('CREATE INDEX IDX_MEAL_RECIPE_MEAL ON meal_recipe (meal_id)');
        $this->addSql('CREATE INDEX IDX_MEAL_RECIPE_RECIPE ON meal_recipe (recipe_id)');

        // Create meal_participant table (many-to-many)
        $this->addSql('CREATE TABLE meal_participant (
            meal_id INT NOT NULL,
            participant_id INT NOT NULL,
            PRIMARY KEY(meal_id, participant_id)
        )');
        $this->addSql('CREATE INDEX IDX_MEAL_PARTICIPANT_MEAL ON meal_participant (meal_id)');
        $this->addSql('CREATE INDEX IDX_MEAL_PARTICIPANT_PARTICIPANT ON meal_participant (participant_id)');

        // Add foreign keys
        $this->addSql('ALTER TABLE participant ADD CONSTRAINT FK_PARTICIPANT_TRIP_ID FOREIGN KEY (trip_id) REFERENCES trip (id)');
        $this->addSql('ALTER TABLE recipe_ingredient ADD CONSTRAINT FK_RECIPE_INGREDIENT_RECIPE_ID FOREIGN KEY (recipe_id) REFERENCES recipe (id)');
        $this->addSql('ALTER TABLE recipe_ingredient ADD CONSTRAINT FK_RECIPE_INGREDIENT_INGREDIENT_ID FOREIGN KEY (ingredient_id) REFERENCES ingredient (id)');
        $this->addSql('ALTER TABLE meal ADD CONSTRAINT FK_MEAL_TRIP_ID FOREIGN KEY (trip_id) REFERENCES trip (id)');
        $this->addSql('ALTER TABLE meal_recipe ADD CONSTRAINT FK_MEAL_RECIPE_MEAL_ID FOREIGN KEY (meal_id) REFERENCES meal (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE meal_recipe ADD CONSTRAINT FK_MEAL_RECIPE_RECIPE_ID FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE meal_participant ADD CONSTRAINT FK_MEAL_PARTICIPANT_MEAL_ID FOREIGN KEY (meal_id) REFERENCES meal (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE meal_participant ADD CONSTRAINT FK_MEAL_PARTICIPANT_PARTICIPANT_ID FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Drop tables in reverse order due to foreign keys
        $this->addSql('ALTER TABLE meal_participant DROP CONSTRAINT IF EXISTS FK_MEAL_PARTICIPANT_PARTICIPANT_ID');
        $this->addSql('ALTER TABLE meal_participant DROP CONSTRAINT IF EXISTS FK_MEAL_PARTICIPANT_MEAL_ID');
        $this->addSql('ALTER TABLE meal_recipe DROP CONSTRAINT IF EXISTS FK_MEAL_RECIPE_RECIPE_ID');
        $this->addSql('ALTER TABLE meal_recipe DROP CONSTRAINT IF EXISTS FK_MEAL_RECIPE_MEAL_ID');
        $this->addSql('ALTER TABLE meal DROP CONSTRAINT IF EXISTS FK_MEAL_TRIP_ID');
        $this->addSql('ALTER TABLE recipe_ingredient DROP CONSTRAINT IF EXISTS FK_RECIPE_INGREDIENT_INGREDIENT_ID');
        $this->addSql('ALTER TABLE recipe_ingredient DROP CONSTRAINT IF EXISTS FK_RECIPE_INGREDIENT_RECIPE_ID');
        $this->addSql('ALTER TABLE participant DROP CONSTRAINT IF EXISTS FK_PARTICIPANT_TRIP_ID');

        $this->addSql('DROP TABLE IF EXISTS meal_participant CASCADE');
        $this->addSql('DROP TABLE IF EXISTS meal_recipe CASCADE');
        $this->addSql('DROP TABLE IF EXISTS meal CASCADE');
        $this->addSql('DROP TABLE IF EXISTS recipe_ingredient CASCADE');
        $this->addSql('DROP TABLE IF EXISTS recipe CASCADE');
        $this->addSql('DROP TABLE IF EXISTS ingredient CASCADE');
        $this->addSql('DROP TABLE IF EXISTS participant CASCADE');
        $this->addSql('DROP TABLE IF EXISTS trip CASCADE');
    }
}
