# Coffee House – Node.js kiadás

Ez az ág a teljes Coffee House weboldalt, Node.js/Express backendjét, SQLite adattárolását és tokennel védett admin felületét tartalmazza. A foglalási és véleményűrlapok az API-n keresztül mentenek, az admin felület pedig a beküldött adatokat kezeli.

## Követelmények

- Node.js 20 vagy újabb
- npm

## Helyi indítás

```powershell
npm install
Copy-Item .env.example .env
```

Szerkeszd a `.env` fájlt:

- Az `ADMIN_TOKEN` értékét cseréld le véletlenszerű, legalább 32 karakteres titokra.
- SMTP értesítéshez állítsd be az `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER` és `SMTP_PASS` mezőket. Az `SMTP_FROM` opcionális.
- Hagyd meg a `TZ=Europe/Budapest` értéket, hogy a foglalási időszabályok a kávézó helyi időzónáját használják.

Indítsd el az alkalmazást:

```powershell
npm start
```

- Weboldal: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>
- Health check: <http://localhost:3000/api/health>

Az admin belépéshez a `.env` fájlban beállított tokent használd. A token ne kerüljön a forráskódba vagy a GitHubra.

## API

| Metódus | Útvonal | Leírás |
|---|---|---|
| `POST` | `/api/reservations` | Foglalás létrehozása és értesítési e-mail |
| `GET` | `/api/reviews` | Legutóbbi 100 nyilvános vélemény |
| `POST` | `/api/reviews` | Vélemény létrehozása és értesítési e-mail |
| `GET` | `/api/admin/reservations` | Foglalások listázása |
| `PATCH` | `/api/admin/reservations/:id` | Foglalás státuszának módosítása |
| `DELETE` | `/api/admin/reservations/:id` | Foglalás törlése |
| `GET` | `/api/admin/reviews` | Vélemények listázása |
| `DELETE` | `/api/admin/reviews/:id` | Vélemény törlése |
| `GET` | `/api/admin/notification-recipients` | SMTP állapot és címzettek lekérése |
| `POST` | `/api/admin/notification-recipients` | E-mail-cím hozzáadása |
| `PATCH` | `/api/admin/notification-recipients/:id` | Címzett engedélyezése vagy letiltása |
| `DELETE` | `/api/admin/notification-recipients/:id` | E-mail-cím törlése |

Az admin végpontok `Authorization: Bearer <ADMIN_TOKEN>` hitelesítést igényelnek. Az admin felület **E-mail értesítések** fülén több cím vehető fel, majd kiválaszthatók az értesítések címzettjei. SMTP nélkül az adatok elmentődnek, és az űrlap jelzi, hogy értesítő e-mail nem ment ki.

## Adatok és tesztek

Alapértelmezésben az SQLite adatbázis a `.data/coffee-house.sqlite` fájlban van. A `DATABASE_PATH` környezeti változóval másik hely adható meg.

```powershell
npm test
npm run backup -- .\coffee-house-backup.sqlite
```

A backup parancs futó SQLite-adatbázisból is konzisztens másolatot készít. A célfájl nem lehet az adatbázis-fájl maga.

Ez a kiadás egyetlen alkalmazáspéldányhoz készült; több párhuzamos szerverpéldányhoz az SQLite helyett központi adatbázis szükséges.
