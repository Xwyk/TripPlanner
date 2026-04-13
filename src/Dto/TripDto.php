<?php

namespace App\Dto;

use Symfony\Component\Serializer\Annotation\Groups;

class TripDto
{
    #[Groups(['trip:write'])]
    public ?string $name = null;

    #[Groups(['trip:write'])]
    public ?int $nights = null;

    #[Groups(['trip:write'])]
    public ?string $totalBudget = null;

    #[Groups(['trip:write'])]
    public ?string $startDate = null;

    #[Groups(['trip:write'])]
    public ?string $description = null;
}
