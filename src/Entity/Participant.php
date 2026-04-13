<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use App\Repository\ParticipantRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ParticipantRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['participant:read']],
    denormalizationContext: ['groups' => ['participant:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['name' => 'partial', 'trip' => 'exact'])]
class Participant
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['participant:read', 'participant:write', 'trip:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['participant:read', 'participant:write', 'trip:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['participant:read', 'participant:write', 'trip:read'])]
    private ?string $email = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['participant:read', 'participant:write', 'trip:read'])]
    private ?\DateTimeInterface $arrivalDate = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['participant:read', 'participant:write', 'trip:read'])]
    private ?\DateTimeInterface $departureDate = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['participant:read', 'participant:write', 'trip:read'])]
    private ?array $nightsPresent = [];

    #[ORM\ManyToOne(inversedBy: 'participants')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participant:write'])]
    private ?Trip $trip = null;

    #[ORM\Column]
    #[Groups(['participant:read', 'trip:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getArrivalDate(): ?\DateTimeInterface
    {
        return $this->arrivalDate;
    }

    public function setArrivalDate(?\DateTimeInterface $arrivalDate): static
    {
        $this->arrivalDate = $arrivalDate;
        return $this;
    }

    public function getDepartureDate(): ?\DateTimeInterface
    {
        return $this->departureDate;
    }

    public function setDepartureDate(?\DateTimeInterface $departureDate): static
    {
        $this->departureDate = $departureDate;
        return $this;
    }

    public function getNightsPresent(): ?array
    {
        return $this->nightsPresent;
    }

    public function setNightsPresent(?array $nightsPresent): static
    {
        $this->nightsPresent = $nightsPresent;
        return $this;
    }

    /**
     * Marque une nuit comme présente pour ce participant
     */
    public function addNightPresent(int $nightNumber): static
    {
        if (!in_array($nightNumber, $this->nightsPresent ?? [])) {
            $this->nightsPresent[] = $nightNumber;
        }
        return $this;
    }

    /**
     * Retire une nuit de présence pour ce participant
     */
    public function removeNightPresent(int $nightNumber): static
    {
        if ($this->nightsPresent !== null) {
            $this->nightsPresent = array_filter($this->nightsPresent, function($night) use ($nightNumber) {
                return $night !== $nightNumber;
            });
        }
        return $this;
    }

    /**
     * Compte le nombre de nuits où le participant est présent
     */
    #[Groups(['participant:read', 'trip:read'])]
    public function getNightsCount(): int
    {
        return count($this->nightsPresent ?? []);
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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
