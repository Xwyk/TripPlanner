<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\ParticipantMealRepository;
use App\Repository\ParticipantTripRepository;
use App\Utils\ApiGroups;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ParticipantMealRepository::class)]
#[ORM\UniqueConstraint(columns: ['participant_id', 'meal_id'])]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['participantMeal:read', ApiGroups::GROUP_READ]],
    denormalizationContext: ['groups' => ['participantMeal:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['participant' => 'exact', 'meal' => 'exact'])]
class ParticipantMeal
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['participantMeal:read', 'meal:read', ApiGroups::GROUP_READ])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'participantMeals')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participantMeal:read', 'participantMeal:write', 'meal:read', 'trip:read', ApiGroups::GROUP_READ])]
    private ?Participant $participant = null;

    #[ORM\ManyToOne(inversedBy: 'participantMeals')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participantMeal:read', 'participantMeal:write'])]
    private ?Meal $meal = null;

    #[ORM\Column]
    #[Groups(['participantMeal:read', ApiGroups::GROUP_READ])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getParticipant(): ?Participant
    {
        return $this->participant;
    }

    public function setParticipant(?Participant $participant): static
    {
        $this->participant = $participant;
        return $this;
    }

    public function getMeal(): ?Meal
    {
        return $this->meal;
    }

    public function setMeal(?Meal $meal): static
    {
        $this->meal = $meal;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
