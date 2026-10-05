<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class NotificationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notification:manage 
                            {action=list : Action: list, add, toggle, delete}
                            {--id= : ID or identifier for toggle/delete}
                            {--title= : Title of notification}
                            {--message= : Message body}
                            {--link=/ : Target link}
                            {--category=Fitur Baru : Category label}
                            {--section=new : Section (new or earlier)}
                            {--badge-icon=book : Icon (book, sparkles, bookmark, check, speaker, prayer, target, mobile)}
                            {--badge-color=bg-emerald-600 : Tailwind badge color}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kelola notifikasi website tanpa perlu rebuild frontend atau backend';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $action = strtolower($this->argument('action'));

        return match ($action) {
            'list' => $this->listNotifications(),
            'add' => $this->addNotification(),
            'toggle' => $this->toggleNotification(),
            'delete' => $this->deleteNotification(),
            default => $this->errorAction($action),
        };
    }

    protected function listNotifications(): int
    {
        $notifications = Notification::ordered()->get();

        if ($notifications->isEmpty()) {
            $this->warn('Belum ada notifikasi di database.');
            return self::SUCCESS;
        }

        $headers = ['ID', 'Identifier', 'Title', 'Category', 'Section', 'Active', 'Published'];
        $rows = $notifications->map(fn($item) => [
            $item->id,
            $item->identifier,
            \Illuminate\Support\Str::limit($item->title, 40),
            $item->category,
            $item->section,
            $item->is_active ? '✅ Ya' : '❌ Tidak',
            $item->published_at ? $item->published_at->format('d M Y H:i') : '-',
        ])->all();

        $this->table($headers, $rows);
        $this->info("Total: {$notifications->count()} notifikasi terdaftar di database.");

        return self::SUCCESS;
    }

    protected function addNotification(): int
    {
        $title = $this->option('title') ?: $this->ask('Judul Notifikasi');
        if (empty($title)) {
            $this->error('Judul notifikasi tidak boleh kosong.');
            return self::FAILURE;
        }

        $message = $this->option('message') ?: $this->ask('Pesan / Deskripsi Notifikasi');
        if (empty($message)) {
            $this->error('Pesan notifikasi tidak boleh kosong.');
            return self::FAILURE;
        }

        $link = $this->option('link') ?: $this->ask('Tautan Tujuan (misal: /hadits atau /surah)', '/');
        $category = $this->option('category') ?: $this->ask('Kategori (misal: Fitur Baru, SEO & Schema, Doa & Dzikir)', 'Fitur Baru');
        $section = $this->choice('Section', ['new', 'earlier'], 0);
        $badgeIcon = $this->choice('Ikon Badge', ['book', 'sparkles', 'bookmark', 'check', 'speaker', 'prayer', 'target', 'mobile'], 0);
        $badgeColor = $this->choice('Warna Badge', ['bg-emerald-600', 'bg-blue-600', 'bg-amber-600', 'bg-teal-600', 'bg-indigo-600', 'bg-rose-600', 'bg-purple-600'], 0);

        $identifier = 'notif-' . \Illuminate\Support\Str::slug(\Illuminate\Support\Str::limit($title, 30, '')) . '-' . time();

        $notification = Notification::create([
            'identifier' => $identifier,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'category' => $category,
            'section' => $section,
            'badge_icon' => $badgeIcon,
            'badge_color' => $badgeColor,
            'is_active' => true,
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now(),
        ]);

        $this->info("✅ Notifikasi baru berhasil disimpan ke database (ID: {$notification->id}, Identifier: {$notification->identifier})!");
        $this->line("Notifikasi langsung aktif dan tampil di website tanpa perlu re-build frontend maupun backend.");

        return self::SUCCESS;
    }

    protected function toggleNotification(): int
    {
        $id = $this->option('id') ?: $this->ask('Masukkan ID notifikasi');
        $notification = Notification::where('id', $id)->orWhere('identifier', $id)->first();

        if (!$notification) {
            $this->error("Notifikasi dengan ID/Identifier '{$id}' tidak ditemukan.");
            return self::FAILURE;
        }

        $notification->is_active = !$notification->is_active;
        $notification->save();

        $status = $notification->is_active ? 'diaktifkan' : 'dinonaktifkan';
        $this->info("✅ Notifikasi '{$notification->title}' berhasil {$status}.");

        return self::SUCCESS;
    }

    protected function deleteNotification(): int
    {
        $id = $this->option('id') ?: $this->ask('Masukkan ID notifikasi yang ingin dihapus');
        $notification = Notification::where('id', $id)->orWhere('identifier', $id)->first();

        if (!$notification) {
            $this->error("Notifikasi dengan ID/Identifier '{$id}' tidak ditemukan.");
            return self::FAILURE;
        }

        if ($this->confirm("Yakin ingin menghapus notifikasi '{$notification->title}'?")) {
            $notification->delete();
            $this->info("✅ Notifikasi berhasil dihapus dari database.");
        }

        return self::SUCCESS;
    }

    protected function errorAction(string $action): int
    {
        $this->error("Action '{$action}' tidak dikenal. Pilihan: list, add, toggle, delete.");
        return self::FAILURE;
    }
}
