# Coffee House – Webtechnológiák 1 beadandó

## A projekt bemutatása

A projekt egy reszponzív, magyar nyelvű, hét HTML-oldalból álló Coffee House-kávézó weboldal. A látogatók megismerhetik a kávézó kínálatát, megtekinthetik az étlapot és a galériát, asztalt foglalhatnak, valamint véleményt küldhetnek be.

Az oldal HTML5, CSS3 és JavaScript technológiákat használ. A felület Bootstrap 5-tel, az interaktív funkciók jQuery 3.7.1-gyel készültek.

## Oldalak

| Oldal | Fájl | Tartalom |
|---|---|---|
| Főoldal | [index.html](index.html) | Bemutatkozás, napi ajánlat, dinamikus kóstolójegyzetek és vendégkupon |
| Kínálat | [pages/kinalat.html](pages/kinalat.html) | Kávék és sütemények, számozott és pontozott lista |
| Étlap | [pages/etlap.html](pages/etlap.html) | Kattintható termékkártyák, részletes termékablak és árakat összefoglaló táblázat |
| Galéria | [pages/galeria.html](pages/galeria.html) | Kávéházi képek és újrajátszható animáció |
| Asztalfoglalás | [pages/foglalas.html](pages/foglalas.html) | Foglalási űrlap és nyitvatartás szerinti ellenőrzés |
| Vélemény | [pages/velemeny.html](pages/velemeny.html) | Értékelő űrlap és dinamikusan bővülő vendégvélemények |
| Elérhetőségek | [pages/kapcsolat.html](pages/kapcsolat.html) | Kapcsolati adatok, nyitvatartási táblázat és foglalási hivatkozás |

## Követelmények és megvalósításuk

### HTML

- Az oldalakon szerepelnek `div`, `span`, `p` elemek, címsorok, képek, hivatkozások és táblázatok.
- A [pages/kinalat.html](pages/kinalat.html) oldalon számozott (`ol`) és pontozott (`ul`) lista található.
- A navigáció hét különálló HTML-fájlt kapcsol össze, így teljesül a legalább négy HTML-oldalra vonatkozó követelmény.
- Az [asztalfoglalási űrlapban](pages/foglalas.html) egysoros szövegmező, többsoros szövegmező, jelölőnégyzet, választógombok, színválasztó, dátum- és időpontválasztó, legördülő lista és gombok találhatók.
- A [véleményűrlapban](pages/velemeny.html) egysoros szövegmező, többsoros szövegmező, dátumválasztó, választógombok, jelölőnégyzetek és beküldő/törlő gombok szerepelnek.

### CSS

- A közös stílusokat a [css/style.css](css/style.css) tartalmazza; a [főoldalon](index.html) belső `<style>` blokk és néhány elemnél inline `style` attribútum is van.
- Azonosító- és osztályszelektorok formázzák többek között a főoldali szekciókat, a navigációt, a kártyákat és az űrlapokat.
- A stíluslap formázza az oldal hátterét, a menüt, a hivatkozásokat, a táblázatokat, az űrlapmezőket és a gombokat.
- A képekhez, kártyákhoz és menüpontokhoz hover- és átmeneti animációk tartoznak.

### JavaScript és jQuery

A közös interaktív kód a [js/script.js](js/script.js) fájlban található.

- Az űrlapok beküldés előtt ellenőrzik a kötelező adatokat, és az érintett mező mellett megjelenítik a hibaüzenetet. A hibás mezők piros keretet és háttérszínt kapnak.
- A foglalási űrlap ellenőrzi a dátumot, a kiválasztott nap nyitvatartását és az időpontot; vasárnapra nem enged foglalást.
- A jQuery elemeket HTML-tag (`h1`), osztály (`.kiemelt-span`) és azonosító (`#hero-box`) alapján választ ki.
- A kód módosít meglévő elemeket, és új HTML-elemeket hoz létre a napi ajánlatnál, a kóstolójegyzeteknél és a beküldött véleményeknél.
- jQuery-animációk jelenítik meg többek között a kupondobozt, a termékkártyákat, a galériát és a beküldött visszajelzéseket.

## Mappaszerkezet

```text
.
├── index.html
├── pages/
│   ├── etlap.html
│   ├── foglalas.html
│   ├── galeria.html
│   ├── kapcsolat.html
│   ├── kinalat.html
│   └── velemeny.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── test/
│   └── server.test.js
├── server.js
├── package.json
├── img/
│   └── képek és ikonok
├── dokumentacio.docx
└── README.md
```

## Backend és futtatás

A weboldal Node.js alapú Express API-t és SQLite adatbázist használ. A foglalások és a vélemények szerveroldali validálás után, a `.data/coffee-house.sqlite` fájlban tárolódnak. A Coffee House kitalált hely; a főoldal jelzi, hogy ez a weboldal tesztcélú, a beküldött adatok pedig csak bemutató adatok.

Szükséges: Node.js 20 vagy újabb és npm.

1. Telepítsd a függőségeket: `npm install`.
2. Másold le a környezeti változók mintáját: `Copy-Item .env.example .env`.
3. A `.env` fájlban cseréld le az `ADMIN_TOKEN` értékét egy legalább 32 karakteres, véletlenszerű titokra.
4. Indítsd el a szervert: `npm start`.
5. Nyisd meg a `http://localhost:3000` címet. A HTML-fájl közvetlen megnyitása (`file://`) nem indítja el az API-t.

Az API-végpontok:

| Metódus | Útvonal | Hozzáférés | Leírás |
|---|---|---|---|
| `GET` | `/api/health` | Nyilvános | Szerver állapotának ellenőrzése |
| `POST` | `/api/reservations` | Nyilvános | Foglalás létrehozása |
| `GET` | `/api/reviews` | Nyilvános | Legutóbbi 100 vélemény lekérése |
| `POST` | `/api/reviews` | Nyilvános | Vélemény létrehozása |
| `GET` | `/api/admin/reservations` | Admin | Foglalások listázása (Bearer token) |
| `PATCH` | `/api/admin/reservations/:id` | Admin | Foglalás státuszának módosítása |
| `DELETE` | `/api/admin/reservations/:id` | Admin | Foglalás törlése |
| `GET` | `/api/admin/reviews` | Admin | Vélemények listázása (Bearer token) |
| `DELETE` | `/api/admin/reviews/:id` | Admin | Vélemény törlése |

Az admin API-k a `.env` fájlban beállított titkot `Authorization: Bearer <ADMIN_TOKEN>` fejlécben várják. A titkot soha ne tedd a böngészőkódba vagy nyilvános forráskódba. A backend tesztjei az `npm test` paranccsal futtathatók.

Bootstrap és jQuery továbbra is CDN-ről töltődik be, ezért ezekhez internetkapcsolat szükséges.

## Dokumentáció

A projekt részletes dokumentációja a [dokumentacio.docx](dokumentacio.docx) fájlban található. A dokumentum a projektet, a forráskódot és a felhasználói felületet mutatja be.
