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
use App\Repository\ParticipantTripRepository;
use App\Utils\ApiGroups;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ParticipantTripRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['participantTrip:read', ApiGroups::GROUP_READ]],
    denormalizationContext: ['groups' => ['participantTrip:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['participant' => 'exact', 'trip' => 'exact'])]
class ParticipantTrip
{

    public const string NIGHT_FORMAT = 'Y-m-d';
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['participantTrip:read', 'trip:read', ApiGroups::GROUP_READ])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'participantTrips')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participantTrip:read', 'participantTrip:write', 'trip:read', ApiGroups::GROUP_READ])]
    private ?Participant $participant = null;

    #[ORM\ManyToOne(inversedBy: 'participantTrips')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participantTrip:read', 'participantTrip:write'])]
    private ?Trip $trip = null;

    /** @var array<int, string>|null */
    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['participantTrip:read', 'participantTrip:write', 'trip:read', ApiGroups::GROUP_READ])]
    private ?array $nightsPresent = null;

    #[ORM\Column]
    #[Groups(['participantTrip:read', ApiGroups::GROUP_READ])]
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

    public function getTrip(): ?Trip
    {
        return $this->trip;
    }

    public function setTrip(?Trip $trip): static
    {
        $this->trip = $trip;
        return $this;
    }

    public function getNightsPresent(): ?array
    {
        return $this->nightsPresent;
    }

    public function setNightsPresent(?array $nightsPresent): static
    {
        $this->nightsPresent = $nightsPresent !== null
            ? array_values(array_map(strval(...), $nightsPresent))
            : null;
        return $this;
    }

    public function addNightPresent(string $date): static
    {
        if (!in_array($date, $this->nightsPresent ?? [], true)) {
            $this->nightsPresent[] = $date;
        }
        return $this;
    }

    public function removeNightPresent(string $date): static
    {
        if ($this->nightsPresent !== null) {
            $this->nightsPresent = array_values(array_filter($this->nightsPresent, fn(string $night) => $night !== $date));
        }
        return $this;
    }

    /**
     * Compte le nombre de nuits où le participant est présent
     */
    #[Groups(['participantTrip:read', 'trip:read'])]
    public function getNightsCount(): int
    {
        return count($this->nightsPresent ?? []);
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
