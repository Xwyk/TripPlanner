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
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TripRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            provider: TripProvider::class
        ),
        new Post(
            processor: TripProcessor::class
        ),
        new Get(
            provider: TripProvider::class
        ),
        new Put(
            processor: TripProcessor::class
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
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['trip:read', 'trip:write'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['trip:read', 'trip:write'])]
    private ?string $name = null;

    #[ORM\Column]
    #[Groups(['trip:read', 'trip:write'])]
    private ?int $nights = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['trip:read', 'trip:write'])]
    private ?string $totalBudget = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['trip:read', 'trip:write'])]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['trip:read', 'trip:write'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['trip:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\OneToMany(mappedBy: 'trip', targetEntity: Participant::class, cascade: ['persist', 'remove'])]
    #[Groups(['trip:read'])]
    private Collection $participants;

    #[ORM\OneToMany(mappedBy: 'trip', targetEntity: Meal::class, cascade: ['persist', 'remove'])]
    #[Groups(['trip:read'])]
    private Collection $meals;

    public function __construct()
    {
        $this->participants = new ArrayCollection();
        $this->meals = new ArrayCollection();
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

    public function getNights(): ?int
    {
        return $this->nights;
    }

    public function setNights(int $nights): static
    {
        $this->nights = $nights;
        return $this;
    }

    public function getTotalBudget(): ?string
    {
        return $this->totalBudget;
    }

    public function setTotalBudget(string $totalBudget): static
    {
        $this->totalBudget = $totalBudget;
        return $this;
    }

    public function getStartDate(): ?\DateTimeInterface
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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * @return Collection<int, Participant>
     */
    public function getParticipants(): Collection
    {
        return $this->participants;
    }

    public function addParticipant(Participant $participant): static
    {
        if (!$this->participants->contains($participant)) {
            $this->participants->add($participant);
            $participant->setTrip($this);
        }
        return $this;
    }

    public function removeParticipant(Participant $participant): static
    {
        if ($this->participants->removeElement($participant)) {
            if ($participant->getTrip() === $this) {
                $participant->setTrip(null);
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
    #[Groups(['trip:read'])]
    public function getCostPerNight(): ?float
    {
        if ($this->nights === null || $this->nights === 0 || $this->totalBudget === null) {
            return null;
        }
        return (float) $this->totalBudget / $this->nights;
    }

    /**
     * Calcule le coût total pour chaque participant
     * @return array<string, float>
     */
    #[Groups(['trip:read'])]
    public function getParticipantsCosts(): array
    {
        $costs = [];
        $costPerNight = $this->getCostPerNight();

        if ($costPerNight === null) {
            return $costs;
        }

        foreach ($this->participants as $participant) {
            $nightsPresent = $participant->getNightsPresent();
            $participantId = $participant->getId() ?? 'unknown';
            $costs[$participantId] = $nightsPresent * $costPerNight;
        }

        return $costs;
    }
}
