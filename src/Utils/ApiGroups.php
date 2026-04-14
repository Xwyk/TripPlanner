<?php

namespace App\Utils;

class ApiGroups{
    public const string GROUP_READ = "global:read";
    public const string GROUP_READCOLLECTION = "global:readcollection";

    // Trip groups
    public const string GROUP_TRIP_CREATE = "trip:create";
    public const string GROUP_TRIP_UPDATE = "trip:update";
    public const string GROUP_TRIP_READ = "trip:read";
    public const string GROUP_TRIP_READCOLLECTION = "trip:readcollection";

    // Participant groups
    public const string GROUP_PARTICIPANT_CREATE = "participant:create";
    public const string GROUP_PARTICIPANT_UPDATE = "participant:update";
    public const string GROUP_PARTICIPANT_READ = "participant:read";
    public const string GROUP_PARTICIPANT_READCOLLECTION = "participant:readcollection";

    // ParticipantTrip groups
    public const string GROUP_MEAL_CREATE = "meal:create";
    public const string GROUP_MEAL_UPDATE = "meal:update";
    public const string GROUP_MEAL_READ = "meal:read";
    public const string GROUP_MEAL_READCOLLECTION = "meal:readcollection";

}
