<?php

namespace App\State;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Trip;
use App\Repository\TripRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;

class TripProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TripRepository $tripRepository
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // Pour une collection (liste des trips)
        if ($operation instanceof GetCollection) {
            return $this->tripRepository->findAll();
        }

        // Pour un item individuel
        $id = $uriVariables['id'] ?? null;
        if ($id) {
            return $this->tripRepository->find($id);
        }

        return null;
    }
}
