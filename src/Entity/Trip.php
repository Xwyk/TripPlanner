<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\TripRepository;
use App\State\TripProcessor;
use App\State\TripProvider;
use App\Utils\ApiGroups;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: TripRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            provider: TripProvider::class,
            normalizationContext: ['groups' => [Trip::GROUP_READCOLLECTION, ApiGroups::GROUP_READCOLLECTION]],
        ),
        new Post(
            processor: TripProcessor::class,
            normalizationContext: ['groups' => [Trip::GROUP_READ, ApiGroups::GROUP_READ]],
            denormalizationContext: ['groups' => [Trip::GROUP_CREATE]],
        ),
        new Get(
            provider: TripProvider::class,
            normalizationContext: ['groups' => [Trip::GROUP_READ, ApiGroups::GROUP_READ]],
        ),
        new Put(
            processor: TripProcessor::class,
            normalizationContext: ['groups' => [Trip::GROUP_READ, ApiGroups::GROUP_READ]],
            denormalizationContext: ['groups' => [Trip::GROUP_UPDATE]],
        ),
        new Delete(),
    ],
    provider: TripProvider::class,
    processor: TripProcessor::class
)]
#[ApiFilter(SearchFilter::class, properties: ['name' => 'partial'])]
#[ApiFilter(OrderFilter::class, properties: ['startDate', 'name'])]
class Trip
{
    private const string GROUP_CREATE = 'trip:create';
    private const string GROUP_UPDATE = 'trip:update';
    private const string GROUP_READCOLLECTION = 'trip:readcollection';
    private const string GROUP_READ = 'trip:read';
    private const string GROUP_DELETE = 'trip:delete';


    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups([
        self::GROUP_READ,
        self::GROUP_READCOLLECTION,
        self::GROUP_CREATE,
        self::GROUP_UPDATE,
        self::GROUP_DELETE,
        ApiGroups::GROUP_READ,
        ApiGroups::GROUP_READCOLLECTION,
    ])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        self::GROUP_READ,
        self::GROUP_READCOLLECTION,
        self::GROUP_CREATE,
        self::GROUP_UPDATE,
        ApiGroups::GROUP_READ,
        ApiGroups::GROUP_READCOLLECTION
    ])]
    private string $name;

    #[ORM\Column]
    #[Groups([
        self::GROUP_READ,
        self::GROUP_READCOLLECTION,
        self::GROUP_CREATE,
        self::GROUP_UPDATE,
        ApiGroups::GROUP_READ,
        ApiGroups::GROUP_READCOLLECTION
    ])]
    private int $nights = 1;

    #[ORM\Column]
    #[Groups([
        self::GROUP_READ,
        self::GROUP_READCOLLECTION,
        self::GROUP_CREATE,
        self::GROUP_UPDATE,
        ApiGroups::GROUP_READ,
        ApiGroups::GROUP_READCOLLECTION
    ])]
    private float $cottageCost = 0;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups([
        self::GROUP_READ,
        self::GROUP_READCOLLECTION,
        self::GROUP_CREATE,
        self::GROUP_UPDATE,
        ApiGroups::GROUP_READ,
        ApiGroups::GROUP_READCOLLECTION
    ])]
    private \DateTimeInterface $startDate;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        self::GROUP_READ,
        self::GROUP_READCOLLECTION,
        self::GROUP_CREATE,
        self::GROUP_UPDATE,
        ApiGroups::GROUP_READ,
        ApiGroups::GROUP_READCOLLECTION
    ])]
    private string $description;

    #[ORM\Column]
    #[Groups([
        self::GROUP_READ,
        self::GROUP_READCOLLECTION,
        ApiGroups::GROUP_READ,
        ApiGroups::GROUP_READCOLLECTION
    ])]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, ParticipantTrip> */
    #[ORM\OneToMany(mappedBy: 'trip', targetEntity: ParticipantTrip::class, cascade: ['persist', 'remove'])]
    #[Groups([
        self::GROUP_READ,
    ])]
    private Collection $participantTrips;

    /** @var Collection<int, Meal> */
    #[ORM\OneToMany(mappedBy: 'trip', targetEntity: Meal::class, cascade: ['persist', 'remove'])]
    #[Groups([
        self::GROUP_READ,
    ])]
    private Collection $meals;

    public function __construct()
    {
        $this->participantTrips = new ArrayCollection();
        $this->meals = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->startDate = new \DateTimeImmutable('now');
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getNights(): int
    {
        return $this->nights;
    }

    public function setNights(int $nights): static
    {
        $this->nights = $nights;
        return $this;
    }

    public function getCottageCost(): float
    {
        return $this->cottageCost;
    }

    public function setCottageCost(float $cottageCost): static
    {
        $this->cottageCost = $cottageCost;
        return $this;
    }

    public function getStartDate(): \DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * @return Collection<int, ParticipantTrip>
     */
    public function getParticipantTrips(): Collection
    {
        return $this->participantTrips;
    }

    public function addParticipantTrip(ParticipantTrip $participantTrip): static
    {
        if (!$this->participantTrips->contains($participantTrip)) {
            $this->participantTrips->add($participantTrip);
            $participantTrip->setTrip($this);
        }
        return $this;
    }

    public function removeParticipantTrip(ParticipantTrip $participantTrip): static
    {
        if ($this->participantTrips->removeElement($participantTrip)) {
            if ($participantTrip->getTrip() === $this) {
                $participantTrip->setTrip(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Meal>
     */
    public function getMeals(): Collection
    {
        return $this->meals;
    }

    public function addMeal(Meal $meal): static
    {
        if (!$this->meals->contains($meal)) {
            $this->meals->add($meal);
            $meal->setTrip($this);
        }
        return $this;
    }

    public function removeMeal(Meal $meal): static
    {
        if ($this->meals->removeElement($meal)) {
            if ($meal->getTrip() === $this) {
                $meal->setTrip(null);
            }
        }
        return $this;
    }

    /**
     * Calcule le coût par nuitée
     */
    #[Groups([self::GROUP_READ])]
    public function getCostPerNight(): ?float
    {
        if ($this->nights === null || $this->nights === 0 || $this->cottageCost === null) {
            return null;
        }
        return (float) $this->cottageCost / $this->nights;
    }

    /**
     * Calcule le coût total pour chaque participant
     * @return array<string, float>
     */
    #[Groups([self::GROUP_READ])]
    public function getParticipantsCosts(): array
    {
        $costs = [];
        $costPerNight = $this->getCostPerNight();

        if ($costPerNight === null) {
            return $costs;
        }

        foreach ($this->participantTrips as $participantTrip) {
            $nightsPresent = $participantTrip->getNightsPresent();
            $participantId = $participantTrip->getParticipant()?->getId() ?? 'unknown';
            $costs[$participantId] = count($nightsPresent ?? []) * $costPerNight;
        }

        return $costs;
    }
}
