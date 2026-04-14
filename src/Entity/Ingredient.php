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
use App\Repository\IngredientRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: IngredientRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['ingredient:read']],
    denormalizationContext: ['groups' => ['ingredient:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['name' => 'partial', 'category' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['name', 'category'])]
class Ingredient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['ingredient:read', 'ingredient:write', 'recipe:read', 'meal:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['ingredient:read', 'ingredient:write', 'recipe:read', 'meal:read'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['ingredient:read', 'ingredient:write'])]
    private ?string $defaultQuantity = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['ingredient:read', 'ingredient:write'])]
    private ?string $averagePrice = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['ingredient:read', 'ingredient:write'])]
    private ?string $category = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['ingredient:read', 'ingredient:write'])]
    private ?string $notes = null;

    #[ORM\Column]
    #[Groups(['ingredient:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\OneToMany(mappedBy: 'ingredient', targetEntity: RecipeIngredient::class, cascade: ['persist', 'remove'])]
    private Collection $recipeIngredients;

    public function __construct()
    {
        $this->recipeIngredients = new ArrayCollection();
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

    public function getDefaultQuantity(): ?string
    {
        return $this->defaultQuantity;
    }

    public function setDefaultQuantity(?string $defaultQuantity): static
    {
        $this->defaultQuantity = $defaultQuantity;
        return $this;
    }

    public function getAveragePrice(): ?string
    {
        return $this->averagePrice;
    }

    public function setAveragePrice(?string $averagePrice): static
    {
        $this->averagePrice = $averagePrice;
        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): static
    {
        $this->category = $category;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * @return Collection<int, RecipeIngredient>
     */
    public function getRecipeIngredients(): Collection
    {
        return $this->recipeIngredients;
    }

    public function addRecipeIngredient(RecipeIngredient $recipeIngredient): static
    {
        if (!$this->recipeIngredients->contains($recipeIngredient)) {
            $this->recipeIngredients->add($recipeIngredient);
            $recipeIngredient->setIngredient($this);
        }
        return $this;
    }

    public function removeRecipeIngredient(RecipeIngredient $recipeIngredient): static
    {
        if ($this->recipeIngredients->removeElement($recipeIngredient)) {
            if ($recipeIngredient->getIngredient() === $this) {
                $recipeIngredient->setIngredient(null);
            }
        }
        return $this;
    }

    /**
     * Calcule le prix par unité de mesure
     */
    #[Groups(['ingredient:read'])]
    public function getPricePerUnit(): ?float
    {
        if ($this->averagePrice === null || $this->defaultQuantity === null || $this->defaultQuantity == 0) {
            return null;
        }
        return (float) $this->averagePrice / (float) $this->defaultQuantity;
    }
}
