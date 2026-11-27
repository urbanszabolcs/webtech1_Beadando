# Coffee House – statikus HTML-kiadás

Ez az ág a Coffee House bemutató weboldalának egyszerű, statikus változata. HTML5, CSS3 és böngészőoldali JavaScript/jQuery használatával működik; nincs benne Node.js backend, admin felület vagy szerveroldali adattárolás.

## Megnyitás

Nyisd meg az `index.html` fájlt egy modern böngészőben, vagy szolgálj ki minden fájlt egy statikus webszerverről. A Bootstrap és jQuery CDN-ről töltődik be, ezért ezekhez internetkapcsolat szükséges.

## Oldalak

| Oldal | Fájl |
|---|---|
| Főoldal | `index.html` |
| Kínálat | `pages/kinalat.html` |
| Étlap | `pages/etlap.html` |
| Galéria | `pages/galeria.html` |
| Asztalfoglalás | `pages/foglalas.html` |
| Vélemény | `pages/velemeny.html` |
| Elérhetőségek | `pages/kapcsolat.html` |

## Űrlapok

Az asztalfoglalás űrlapja a böngészőben ellenőrzi a kötelező adatokat, a nyitvatartást és az időpontot, majd csak egy helyi visszajelzést mutat. A véleményűrlap a beküldött kártyát az aktuális oldal tartalmához adja hozzá. Az adatok nem kerülnek szerverre, nem maradnak meg az oldal újratöltése után, és nem küld e-mailes értesítést.

Ez egy tesztcélú, kitalált kávéház weboldala, nem valódi vállalkozás.
