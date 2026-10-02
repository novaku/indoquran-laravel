<?php

namespace Tests\Unit\Helpers;

use App\Helpers\RedisHelper;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class RedisHelperTest extends TestCase
{
    public function test_is_using_socket_when_configured(): void
    {
        config(['database.redis.default.socket' => '/var/run/redis/redis.sock']);
        $this->assertTrue(RedisHelper::isUsingSocket());

        config(['database.redis.default.socket' => null]);
        $this->assertFalse(RedisHelper::isUsingSocket());
    }

    public function test_get_connection_info(): void
    {
        config([
            'database.redis.default.socket' => null,
            'database.redis.default.host' => '127.0.0.1',
            'database.redis.default.port' => '6379',
            'database.redis.client' => 'phpredis',
        ]);

        $info = RedisHelper::getConnectionInfo();

        $this->assertNull($info['socket']);
        $this->assertEquals('127.0.0.1', $info['host']);
        $this->assertEquals('6379', $info['port']);
        $this->assertFalse($info['using_socket']);
        $this->assertEquals('phpredis', $info['client']);
    }

    public function test_test_connection_success(): void
    {
        Redis::shouldReceive('ping')->once()->andReturn('PONG');

        $result = RedisHelper::testConnection();
        $this->assertTrue($result);
    }

    public function test_test_connection_failure(): void
    {
        Redis::shouldReceive('ping')->once()->andThrow(new \Exception('Connection refused'));

        $result = RedisHelper::testConnection();
        $this->assertFalse($result);
    }
}
