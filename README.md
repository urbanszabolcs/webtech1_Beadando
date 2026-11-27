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
│   ├── admin.css
│   └── style.css
├── js/
│   ├── admin.js
│   └── script.js
├── test/
│   └── server.test.js
├── scripts/
│   └── backup-database.js
├── admin.html
├── server.js
├── package.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── deploy/
│   └── nginx-coffee-house.conf
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
3. A `.env` fájlban cseréld le az `ADMIN_TOKEN` értékét egy legalább 32 karakteres, véletlenszerű titokra. A tokent ne illeszd a forráskódba vagy a dokumentációba.
4. Add meg a levélküldő szolgáltatód SMTP-adatait a `.env` fájlban (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, opcionálisan `SMTP_FROM`). A jelszó/app-jelszó maradjon a `.env` fájlban. A `TZ` alapértelmezett értéke `Europe/Budapest`, mert a foglalási nyitvatartás ehhez igazodik.
5. Indítsd el a szervert: `npm start`.
6. Nyisd meg a `http://localhost:3000` címet. Ez a kezdőlap; a régi `/index.html` útvonal automatikusan a `/` címre irányít át. A HTML-fájl közvetlen megnyitása (`file://`) nem indítja el az API-t.
7. Az admin felületet a `http://localhost:3000/admin` címen éred el; jelentkezz be a `.env` fájlban megadott `ADMIN_TOKEN` értékkel. Az **E-mail értesítések** fülön adj hozzá címzetteket, válaszd ki a listából a címeket, majd mentsd a kiválasztást.

## AWS EC2 telepítés

A projekt Docker Compose-os telepítésre van előkészítve, például Ubuntu 24.04 LTS-t futtató EC2 példányra. A konténer Node.js 22 alatt, nem root felhasználóval fut. Az alkalmazás `127.0.0.1:3000`-on érhető el csak az EC2 gépen; a nyilvános forgalmat Nginx kezeli. Az adatbázis az EC2 gazdagép `DATA_DIR` könyvtárába kerül, nem a konténer fájlrendszerébe.

1. Hozz létre egy EC2 példányt, állíts be DNS A rekordot a példány nyilvános IP-jére, és AWS security groupban engedélyezd:
   - SSH (22) csak a saját IP-címedről;
   - HTTP (80) és HTTPS (443) a látogatók felől.
   A 3000-es portot ne tedd nyilvánosan elérhetővé.
2. SSH-val lépj be az Ubuntu példányra, telepítsd az eszközöket:

   ```sh
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git
   sudo systemctl enable --now docker nginx
   ```

3. Klónozd a repót az EC2 gépre, és töltsd ki a szerver helyi `.env` fájlját:

   ```sh
   git clone <repository-url> coffee-house
   cd coffee-house
   cp .env.example .env
   chmod 600 .env
   openssl rand -hex 32
   nano .env
   ```

   Állítsd be az `ADMIN_TOKEN`-t a generált véletlen értékre, valamint SMTP szolgáltatód adatait. Ne commitold vagy küldd el a `.env` fájlt. SMTP-hez jellemzően a szolgáltatói 587-es TLS portot használd. A `.env` fájlban állítsd a `DATA_DIR` értékét `/opt/coffee-house/data`-ra, majd hozd létre az adatkönyvtárat a konténer nem-root felhasználójának:

   ```sh
   sudo install -d -o 1000 -g 1000 -m 750 /opt/coffee-house/data
   ```

   Ha a korábbi szervered adatbázisát is át akarod vinni, először a fejlesztői gépeden készíts konzisztens SQLite-mentést:

   ```powershell
   npm run backup -- .\coffee-house-backup.sqlite
   scp .\coffee-house-backup.sqlite ubuntu@<EC2_PUBLIC_IP>:/tmp/coffee-house-backup.sqlite
   ```

   Ezután az EC2 gépen, még az alkalmazás első indítása előtt másold a mentést a megadott adatkönyvtárba:

   ```sh
   sudo install -o 1000 -g 1000 -m 600 /tmp/coffee-house-backup.sqlite /opt/coffee-house/data/coffee-house.sqlite
   ```

   Ezt az adatmigrációt csak akkor hagyd ki, ha új, üres adatbázissal szeretnél kezdeni.
4. Építsd és indítsd el az alkalmazást:

   ```sh
   sudo docker compose up --build -d
   sudo docker compose ps
   curl --fail http://127.0.0.1:3000/api/health
   ```

5. Állítsd be az Nginxet a saját domain neveddel:

   ```sh
   sudo cp deploy/nginx-coffee-house.conf /etc/nginx/sites-available/coffee-house
   sudo nano /etc/nginx/sites-available/coffee-house
   sudo ln -s /etc/nginx/sites-available/coffee-house /etc/nginx/sites-enabled/coffee-house
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d example.com -d www.example.com
   ```

   Cseréld le az `example.com` értékeket a saját domainedre, és csak azokat a neveket add meg, amelyek DNS-e a példányra mutat. A Certbot Nginx plugin beállítja a HTTPS tanúsítványt és a megújítást.
6. Nyisd meg a `https://<domain>` és `https://<domain>/admin` címeket. Az admin felülethez használd a `.env`-ben beállított tokent.

Frissítés: a repó könyvtárában futtasd a `git pull` és `sudo docker compose up --build -d` parancsokat. Naplókat a `sudo docker compose logs -f app` paranccsal lehet megtekinteni. A health check állapota a `sudo docker compose ps` kimenetében látszik. SQLite-mentés készíthető futó példányon is a `sudo docker compose exec -T app npm run backup -- /data/coffee-house-backup.sqlite` paranccsal; az elkészült fájlt másold le külön EBS kötetre vagy tárold off-site.

Az SQLite adatbázis az EC2 `DATA_DIR` könyvtárában van, ezért a konténer törlése/újraépítése önmagában nem törli. Éles használathoz a `/opt/coffee-house/data` könyvtárat külön EBS kötetre csatold, vagy gondoskodj róla, hogy az azt tartalmazó EBS kötet példánytörléskor megmaradjon. Ez az egyszerű telepítés egyetlen EC2 példányhoz készült: SQLite adatbázist ne ossz meg több alkalmazáspéldány vagy EFS között. Állíts be rendszeres EBS snapshotot/mentést. A Compose automatikus alkalmazás-újraindítása nem helyettesíti az adatbázis-mentést. Ne használd a `docker compose down -v` parancsot, mert az adatkönyvtárat is törölhet.

Az AWS SES használatához állítsd be az SES SMTP hitelesítő adatokat az `.env` fájlban, és szükség esetén kérj SES sandboxból kilépést. Az alkalmazás nem telepít AWS hitelesítő adatot vagy SES beállítást automatikusan.

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
| `GET` | `/api/admin/notification-recipients` | Admin | SMTP állapot és értesítési címzettek lekérése |
| `POST` | `/api/admin/notification-recipients` | Admin | Értesítési cím hozzáadása |
| `PATCH` | `/api/admin/notification-recipients/:id` | Admin | Címzett értesítési célként való be- vagy kikapcsolása |
| `DELETE` | `/api/admin/notification-recipients/:id` | Admin | Értesítési cím törlése |

Az admin API-k a `.env` fájlban beállított titkot `Authorization: Bearer <ADMIN_TOKEN>` fejlécben várják. A titkot soha ne tedd a böngészőkódba vagy nyilvános forráskódba. A backend tesztjei az `npm test` paranccsal futtathatók.

SMTP-beállítás hiányában a foglalások és vélemények továbbra is mentésre kerülnek, de az API és az űrlap jelzi, hogy értesítő e-mail nem ment ki. SMTP-hiba esetén a backend naplózza a hibát, és az űrlap szintén visszajelzést ad.

Bootstrap és jQuery továbbra is CDN-ről töltődik be, ezért ezekhez internetkapcsolat szükséges.

## Dokumentáció

A projekt részletes dokumentációja a [dokumentacio.docx](dokumentacio.docx) fájlban található. A dokumentum a projektet, a forráskódot és a felhasználói felületet mutatja be.
