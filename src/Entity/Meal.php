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
use App\Repository\MealRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: MealRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['meal:read']],
    denormalizationContext: ['groups' => ['meal:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['trip' => 'exact', 'mealType' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['date'])]
class Meal
{
    public const MEAL_TYPE_BREAKFAST = 'breakfast';
    public const MEAL_TYPE_LUNCH = 'lunch';
    public const MEAL_TYPE_DINNER = 'dinner';
    public const MEAL_TYPE_SNACK = 'snack';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['meal:read', 'meal:write', 'trip:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['meal:read', 'meal:write', 'trip:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 50)]
    #[Groups(['meal:read', 'meal:write', 'trip:read'])]
    private ?string $mealType = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['meal:read', 'meal:write', 'trip:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['meal:read', 'meal:write'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['meal:read', 'meal:write'])]
    private ?int $numberOfPortions = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['meal:read', 'meal:write'])]
    private ?string $estimatedCost = null;

    #[ORM\ManyToOne(inversedBy: 'meals')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['meal:write'])]
    private ?Trip $trip = null;

    #[ORM\ManyToMany(targetEntity: Recipe::class, inversedBy: 'meals')]
    #[Groups(['meal:read', 'meal:write', 'trip:read'])]
    private Collection $recipes;

    #[ORM\ManyToMany(targetEntity: Participant::class)]
    #[Groups(['meal:read', 'meal:write'])]
    private Collection $participants;

    #[ORM\Column]
    #[Groups(['meal:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->recipes = new ArrayCollection();
        $this->participants = new ArrayCollection();
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

    public function getMealType(): ?string
    {
        return $this->mealType;
    }

    public function setMealType(string $mealType): static
    {
        $this->mealType = $mealType;
        return $this;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): static
    {
        $this->date = $date;
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

    public function getNumberOfPortions(): ?int
    {
        return $this->numberOfPortions;
    }

    public function setNumberOfPortions(int $numberOfPortions): static
    {
        $this->numberOfPortions = $numberOfPortions;
        return $this;
    }

    public function getEstimatedCost(): ?string
    {
        return $this->estimatedCost;
    }

    public function setEstimatedCost(?string $estimatedCost): static
    {
        $this->estimatedCost = $estimatedCost;
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

    /**
     * @return Collection<int, Recipe>
     */
    public function getRecipes(): Collection
    {
        return $this->recipes;
    }

    public function addRecipe(Recipe $recipe): static
    {
        if (!$this->recipes->contains($recipe)) {
            $this->recipes->add($recipe);
        }
        return $this;
    }

    public function removeRecipe(Recipe $recipe): static
    {
        $this->recipes->removeElement($recipe);
        return $this;
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
        }
        return $this;
    }

    public function removeParticipant(Participant $participant): static
    {
        $this->participants->removeElement($participant);
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * Calcule le coût par portion pour ce repas
     */
    #[Groups(['meal:read'])]
    public function getCostPerPortion(): ?float
    {
        if ($this->numberOfPortions === null || $this->numberOfPortions === 0 || $this->estimatedCost === null) {
            return null;
        }
        return (float) $this->estimatedCost / $this->numberOfPortions;
    }

    /**
     * Récupère tous les ingrédients nécessaires pour ce repas
     * @return array<string, array{name: string, quantity: float, unit: string}>
     */
    #[Groups(['meal:read'])]
    public function getAllIngredients(): array
    {
        $ingredients = [];

        foreach ($this->recipes as $recipe) {
            foreach ($recipe->getRecipeIngredients() as $recipeIngredient) {
                $ingredient = $recipeIngredient->getIngredient();
                if ($ingredient === null) {
                    continue;
                }

                $ingredientId = $ingredient->getId() ?? 'unknown';
                $baseQuantity = $recipeIngredient->getQuantity();
                $baseUnit = $recipeIngredient->getUnit();

                // Ajuster la quantité selon le nombre de portions
                $ratio = $this->numberOfPortions / $recipe->getDefaultPortions();
                $adjustedQuantity = $baseQuantity * $ratio;

                if (isset($ingredients[$ingredientId])) {
                    $ingredients[$ingredientId]['quantity'] += $adjustedQuantity;
                } else {
                    $ingredients[$ingredientId] = [
                        'name' => $ingredient->getName(),
                        'quantity' => $adjustedQuantity,
                        'unit' => $baseUnit,
                    ];
                }
            }
        }

        return array_values($ingredients);
    }
}
