<?php

namespace App\Repository;

use App\Entity\ParticipantMeal;
use App\Entity\ParticipantTrip;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ParticipantMeal>
 */
class ParticipantMealRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ParticipantMeal::class);
    }
}
