<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Trip;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\SerializerInterface;

class TripProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Trip
    {
        // Forcer la réception des données brutes du corps de la requête
        $request = $context['request'] ?? null;
        if ($request && $request->getContent()) {
            $jsonData = json_decode($request->getContent(), true);

            if ($jsonData && is_array($jsonData)) {
                $trip = new Trip();

                if (isset($jsonData['name'])) {
                    $trip->setName($jsonData['name']);
                }
                if (isset($jsonData['nights'])) {
                    $trip->setNights((int) $jsonData['nights']);
                }
                if (isset($jsonData['totalBudget'])) {
                    $trip->setTotalBudget((string) $jsonData['totalBudget']);
                }
                if (isset($jsonData['startDate'])) {
                    $trip->setStartDate(new \DateTime($jsonData['startDate']));
                }
                if (isset($jsonData['description'])) {
                    $trip->setDescription($jsonData['description']);
                }

                $this->entityManager->persist($trip);
                $this->entityManager->flush();

                return $trip;
            }
        }

        // Fallback pour les autres cas
        if ($data instanceof Trip) {
            $this->entityManager->persist($data);
            $this->entityManager->flush();
            return $data;
        }

        throw new \RuntimeException('Unable to process trip data');
    }
}
