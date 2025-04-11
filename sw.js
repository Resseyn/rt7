const CACHE_NAME = 'notes-pwa-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Установка и кэширование
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Стратегия кэширования: сначала кэш, затем сеть
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Если есть в кэше, возвращаем оттуда
                if (response) {
                    return response;
                }
                
                // Если нет в кэше, идем в сеть
                return fetch(event.request)
                    .then(response => {
                        // Пропускаем ответы без контента или не GET-запросы
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Клонируем ответ (т.к. тело ответа можно использовать только раз)
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    });
            })
            .catch(() => {
                // Если и сеть недоступна, показываем офлайн-страницу
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
                
                return new Response('Офлайн-режим', {
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});

// Очистка старых кэшей при активации
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});