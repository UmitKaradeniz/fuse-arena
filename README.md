# Fuse Arena

Modern, Bomberman tarzı bir arena oyunu. Telefonda **Expo Go** ile oynanır: 3 bota karşı son ayakta kalan turu alır, süre bitince arena duvarlarla kapanır.

## Kontroller

- **Sol taraf – joystick:** parmağını ekranın sol yarısına koy ve sürükle, karakter o yöne yürür.
- **Sağ taraf – BOMBA:** dokun, bulunduğun kareye bomba bırakır. Tuşta kalan bomba sayın yazar.
- Güçlendirmeler: Bomba +1, Menzil +1, Hız, Tekme (bombayı itersin).

## Çalıştırma

```bash
npm install
npm start
```

Terminalde çıkan QR kodunu telefondaki Expo Go ile okut. Telefon ve bilgisayar aynı Wi‑Fi ağında olmalı; olmuyorsa `npx expo start --tunnel` dene.

## Yapı

- `game/game.html` – oyunun tamamı (canvas, bot yapay zekası, sesler, dokunmatik kontroller).
- `game/gameHtml.js` – `game.html`'den üretilir, elle düzenleme. `npm start` bunu otomatik yeniler; elle yenilemek için `npm run build:game`.
- `App.js` – Expo kabuğu: oyunu WebView içinde açar, ekranı yataya çevirir, titreşim geri bildirimi verir.
