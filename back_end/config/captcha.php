<?php

return [

    'challenge_ttl_seconds' => (int) env('CAPTCHA_CHALLENGE_TTL', 300),

    'result_ttl_seconds' => (int) env('CAPTCHA_RESULT_TTL', 120),

    'scenes' => [
        'scene_001_pets' => [
            'subscene_dog' => 'water_bowl',
            'subscene_cat' => 'petting',
        ],
        'scene_002_student_room' => [
            'subscene_student_exam' => 'text_book',
            'subscene_student_dark' => 'desk_lamp',
        ],
        'scene_003_space_station' => [
            'subscene_astronaut_air' => 'oxygen_tanks',
            'subscene_robot_bolts' => 'wrench',
        ],
    ],

];
