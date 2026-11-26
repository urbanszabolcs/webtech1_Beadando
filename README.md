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
├── img/
│   └── képek és ikonok
├── dokumentacio.docx
└── README.md
```

## Futtatás

Nyisd meg az `index.html` fájlt egy modern böngészőben, majd használd a navigációs menüt az aloldalak megtekintéséhez. A Bootstrap és a jQuery CDN-ről töltődik be, ezért ezek használatához internetkapcsolat szükséges.

Az űrlapok kliensoldali bemutatóként működnek: a foglalás sikerességét az oldal jelzi, a beküldött véleményt pedig az aktuális oldalon jeleníti meg. A projekt nem tartalmaz szerveroldali feldolgozást vagy tartós adattárolást.

## Dokumentáció

A projekt részletes dokumentációja a [dokumentacio.docx](dokumentacio.docx) fájlban található. A dokumentum a projektet, a forráskódot és a felhasználói felületet mutatja be.
