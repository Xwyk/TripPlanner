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
use App\Repository\ParticipantRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

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
#[ApiFilter(SearchFilter::class, properties: ['name' => 'partial'])]
class Participant
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['participant:read', 'participant:write', 'trip:read', 'meal:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['participant:read', 'participant:write', 'trip:read', 'meal:read'])]
    private string $name;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['participant:read', 'participant:write', 'trip:read'])]
    private ?string $email = null;

    /** @var Collection<int, ParticipantTrip> */
    #[ORM\OneToMany(mappedBy: 'participant', targetEntity: ParticipantTrip::class, cascade: ['persist', 'remove'])]
    private Collection $participantTrips;

    /** @var Collection<int, ParticipantMeal> */
    #[ORM\OneToMany(mappedBy: 'participant', targetEntity: ParticipantMeal::class, cascade: ['persist', 'remove'])]
    private Collection $participantMeals;

    #[ORM\Column]
    #[Groups(['participant:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->participantTrips = new ArrayCollection();
        $this->participantMeals = new ArrayCollection();
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
            $participantTrip->setParticipant($this);
        }
        return $this;
    }

    public function removeParticipantTrip(ParticipantTrip $participantTrip): static
    {
        if ($this->participantTrips->removeElement($participantTrip)) {
            if ($participantTrip->getParticipant() === $this) {
                $participantTrip->setParticipant(null);
            }
        }
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getParticipantMeals(): Collection
    {
        return $this->participantMeals;
    }

    public function addParticipantMeal(ParticipantMeal $participantMeal): static
    {
        if (!$this->participantMeals->contains($participantMeal)) {
            $this->participantMeals->add($participantMeal);
            $participantMeal->setParticipant($this);
        }
        return $this;
    }

    public function removeParticipantMeal(ParticipantMeal $participantMeal): static
    {
        if ($this->participantMeals->removeElement($participantMeal)) {
            if ($participantMeal->getParticipant() === $this) {
                $participantMeal->setParticipant(null);
            }
        }
        return $this;
    }
}
