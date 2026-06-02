<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemoRequest extends Model
{
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'workshop',
        'plan',
        'team_size',
        'message',
    ];
}
