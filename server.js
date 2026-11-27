require("dotenv").config();

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const express = require("express");
const nodemailer = require("nodemailer");

const ROOT = __dirname;
const TABLE_PREFERENCES = ["Ablak melletti", "Csendes sarok", "Terasz"];
const RECOMMENDATIONS = ["Igen, biztosan", "Talán", "Nem"];
const FAVORITES = [
  "Specialty kávék",
  "Friss sütemények",
  "Gyors Wi-Fi / munkakörnyezet",
  "Háttérzene és dizájn",
];
const RESERVATION_STATUSES = ["pending", "confirmed", "cancelled"];

function isText(value, minLength, maxLength) {
  return typeof value === "string" &&
    value.trim().length >= minLength &&
    value.trim().length <= maxLength;
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localTimeString(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function validateReservation(body) {
  const errors = {};

  if (!isText(body.name, 3, 100)) errors.name = "A név 3–100 karakter legyen.";
  if (!isValidDate(body.date) || body.date < localDateString()) {
    errors.date = "Adj meg egy érvényes, mai vagy későbbi dátumot.";
  }

  if (isValidDate(body.date)) {
    const [year, month, day] = body.date.split("-").map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    const opening = weekday === 6 ? "09:00" : "08:00";
    const closing = weekday === 6 ? "21:00" : "20:00";

    if (weekday === 0) {
      errors.date = "Vasárnap a kávézó zárva tart.";
    }

    if (typeof body.time !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time) ||
        body.time < opening || body.time > closing) {
      errors.time = `Erre a napra ${opening} és ${closing} között foglalhatsz.`;
    } else if (body.date === localDateString() && body.time < localTimeString()) {
      errors.time = "Múltbeli időpontra nem lehet foglalni.";
    }
  } else if (typeof body.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)) {
    errors.time = "Adj meg érvényes időpontot.";
  }

  if (!Number.isInteger(body.partySize) || body.partySize < 1 || body.partySize > 5) {
    errors.partySize = "A létszám 1 és 5 fő között lehet.";
  }
  if (!TABLE_PREFERENCES.includes(body.tablePreference)) {
    errors.tablePreference = "Válassz érvényes asztaltípust.";
  }
  if (typeof body.decorColor !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.decorColor)) {
    errors.decorColor = "Adj meg érvényes színt.";
  }
  if (body.notes !== undefined && !isText(body.notes, 0, 1000)) {
    errors.notes = "A különleges kérés legfeljebb 1000 karakter lehet.";
  }
  if (body.acceptedTerms !== true) {
    errors.acceptedTerms = "A foglalási feltételek elfogadása kötelező.";
  }

  return errors;
}

function validateReview(body) {
  const errors = {};

  if (body.name !== undefined && !isText(body.name, 0, 100)) {
    errors.name = "A név legfeljebb 100 karakter lehet.";
  }
  if (!isValidDate(body.visitDate) || body.visitDate > localDateString()) {
    errors.visitDate = "Adj meg egy érvényes, mai vagy korábbi látogatási dátumot.";
  }
  for (const [field, label] of [
    ["coffeeRating", "A kávé értékelése"],
    ["serviceRating", "A kiszolgálás értékelése"],
    ["atmosphereRating", "A hangulat értékelése"],
  ]) {
    if (!Number.isInteger(body[field]) || body[field] < 1 || body[field] > 5) {
      errors[field] = `${label} 1 és 5 közötti érték legyen.`;
    }
  }
  if (!RECOMMENDATIONS.includes(body.recommendation)) {
    errors.recommendation = "Válassz érvényes ajánlást.";
  }
  if (!Array.isArray(body.likedItems) ||
      body.likedItems.some((item) => !FAVORITES.includes(item)) ||
      new Set(body.likedItems).size !== body.likedItems.length) {
    errors.likedItems = "A kedvencek listája érvénytelen.";
  }
  if (!isText(body.text, 10, 2000)) {
    errors.text = "A vélemény 10–2000 karakter legyen.";
  }

  return errors;
}

function validEmailAddress(value) {
  return typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getSmtpSettings(env = process.env) {
  const port = Number(env.SMTP_PORT || 587);
  const configured = Boolean(
    env.SMTP_HOST &&
    env.SMTP_USER &&
    env.SMTP_PASS &&
    (env.SMTP_FROM || env.SMTP_USER) &&
    Number.isInteger(port) &&
    port > 0 &&
    port <= 65535
  );
  return {
    configured,
    port,
    secure: String(env.SMTP_SECURE || "").toLowerCase() === "true",
    host: env.SMTP_HOST,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM || env.SMTP_USER,
  };
}

function createDatabase(databasePath) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 5),
      table_preference TEXT NOT NULL,
      decor_color TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      coffee_rating INTEGER NOT NULL CHECK (coffee_rating BETWEEN 1 AND 5),
      service_rating INTEGER NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
      atmosphere_rating INTEGER NOT NULL CHECK (atmosphere_rating BETWEEN 1 AND 5),
      recommendation TEXT NOT NULL,
      liked_items TEXT NOT NULL DEFAULT '[]',
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notification_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

function createApplication({
  databasePath = process.env.DATABASE_PATH || path.join(ROOT, ".data", "coffee-house.sqlite"),
  adminToken = process.env.ADMIN_TOKEN,
  sendEmail,
  smtpConfigured: smtpConfiguredOverride,
} = {}) {
  if (typeof adminToken !== "string" || adminToken.length < 32) {
    throw new Error("ADMIN_TOKEN must be configured and contain at least 32 characters.");
  }

  const resolvedDatabasePath = path.isAbsolute(databasePath)
    ? databasePath
    : path.resolve(ROOT, databasePath);
  const db = createDatabase(resolvedDatabasePath);
  const smtp = getSmtpSettings();
  const smtpConfigured = smtpConfiguredOverride ?? smtp.configured;
  const transporter = sendEmail
    ? null
    : smtpConfigured
      ? nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      })
      : null;
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  app.use(express.json({ limit: "16kb", strict: true }));

  app.get("/api/health", (_req, res) => {
    db.prepare("SELECT 1").get();
    return res.json({ status: "ok" });
  });

  async function sendAdminNotification(subject, text) {
    if (!smtpConfigured) return { sent: false, reason: "smtp_not_configured" };

    const recipients = db.prepare(
      "SELECT email FROM notification_recipients WHERE enabled = 1 ORDER BY id"
    ).all().map((row) => row.email);
    if (recipients.length === 0) return { sent: false, reason: "no_recipients" };

    try {
      const message = {
        from: smtp.from,
        to: smtp.from,
        bcc: recipients,
        subject,
        text,
      };
      if (sendEmail) {
        await sendEmail(message);
      } else {
        await transporter.sendMail(message);
      }
      return { sent: true };
    } catch (error) {
      console.error("Email notification delivery failed:", error.message);
      return { sent: false, reason: "delivery_failed" };
    }
  }

  app.get("/api/reviews", (_req, res) => {
    const reviews = db.prepare(`
      SELECT id, name, visit_date AS visitDate,
        coffee_rating AS coffeeRating, service_rating AS serviceRating,
        atmosphere_rating AS atmosphereRating, recommendation,
        liked_items AS likedItems, text, created_at AS createdAt
      FROM reviews ORDER BY id DESC LIMIT 100
    `).all().map((review) => ({
      ...review,
      likedItems: JSON.parse(review.likedItems),
    }));
    res.json(reviews);
  });

  app.post("/api/reservations", async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "A foglalás adatai hibásak." });
    }
    const fieldErrors = validateReservation(body);
    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({ error: "Ellenőrizd a foglalás adatait.", fieldErrors });
    }

    const result = db.prepare(`
      INSERT INTO reservations
        (name, date, time, party_size, table_preference, decor_color, notes)
      VALUES
        (@name, @date, @time, @partySize, @tablePreference, @decorColor, @notes)
    `).run({
      name: body.name.trim(),
      date: body.date,
      time: body.time,
      partySize: body.partySize,
      tablePreference: body.tablePreference,
      decorColor: body.decorColor,
      notes: (body.notes || "").trim(),
    });

    const id = Number(result.lastInsertRowid);
    const notification = await sendAdminNotification(
      `Új asztalfoglalás #${id}`,
      [
        `Vendég: ${body.name.trim()}`,
        `Dátum és idő: ${body.date} ${body.time}`,
        `Létszám: ${body.partySize} fő`,
        `Asztal: ${body.tablePreference}`,
        `Megjegyzés: ${(body.notes || "").trim() || "nincs"}`,
      ].join("\n")
    );
    return res.status(201).json({ id, status: "pending", notification });
  });

  app.post("/api/reviews", async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "A vélemény adatai hibásak." });
    }
    const fieldErrors = validateReview(body);
    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({ error: "Ellenőrizd a vélemény adatait.", fieldErrors });
    }

    const result = db.prepare(`
      INSERT INTO reviews
        (name, visit_date, coffee_rating, service_rating, atmosphere_rating,
         recommendation, liked_items, text)
      VALUES
        (@name, @visitDate, @coffeeRating, @serviceRating, @atmosphereRating,
         @recommendation, @likedItems, @text)
    `).run({
      name: (body.name || "").trim() || "Névtelen vendég",
      visitDate: body.visitDate,
      coffeeRating: body.coffeeRating,
      serviceRating: body.serviceRating,
      atmosphereRating: body.atmosphereRating,
      recommendation: body.recommendation,
      likedItems: JSON.stringify(body.likedItems),
      text: body.text.trim(),
    });

    const id = Number(result.lastInsertRowid);
    const notification = await sendAdminNotification(
      `Új vendégvélemény #${id}`,
      [
        `Vendég: ${(body.name || "").trim() || "Névtelen vendég"}`,
        `Látogatás dátuma: ${body.visitDate}`,
        `Kávé: ${body.coffeeRating}/5`,
        `Kiszolgálás: ${body.serviceRating}/5`,
        `Hangulat: ${body.atmosphereRating}/5`,
        `Ajánlás: ${body.recommendation}`,
        `Kedvencek: ${body.likedItems.length ? body.likedItems.join(", ") : "nincs megadva"}`,
        "",
        body.text.trim(),
      ].join("\n")
    );
    return res.status(201).json({ id, notification });
  });

  function requireAdmin(req, res, next) {
    const match = /^Bearer\s+(.+)$/i.exec(req.get("authorization") || "");
    const providedToken = match ? match[1] : "";
    const provided = Buffer.from(providedToken);
    const expected = Buffer.from(adminToken);
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return res.status(401).json({ error: "Érvénytelen admin hitelesítés." });
    }
    return next();
  }

  app.get("/api/admin/notification-recipients", requireAdmin, (_req, res) => {
    const recipients = db.prepare(`
      SELECT id, email, enabled, created_at AS createdAt
      FROM notification_recipients ORDER BY id
    `).all().map((recipient) => ({
      ...recipient,
      enabled: Boolean(recipient.enabled),
    }));
    res.json({ smtpConfigured, recipients });
  });

  app.post("/api/admin/notification-recipients", requireAdmin, (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!validEmailAddress(email)) {
      return res.status(400).json({ error: "Adj meg egy érvényes e-mail-címet." });
    }
    const count = db.prepare("SELECT COUNT(*) AS count FROM notification_recipients").get().count;
    if (count >= 20) {
      return res.status(400).json({ error: "Legfeljebb 20 értesítési cím adható meg." });
    }

    try {
      const result = db.prepare(
        "INSERT INTO notification_recipients (email) VALUES (?)"
      ).run(email);
      return res.status(201).json({
        id: Number(result.lastInsertRowid),
        email,
        enabled: true,
      });
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(409).json({ error: "Ez az e-mail-cím már szerepel a listában." });
      }
      throw error;
    }
  });

  app.patch("/api/admin/notification-recipients/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { enabled } = req.body || {};
    if (!Number.isSafeInteger(id) || id < 1 || typeof enabled !== "boolean") {
      return res.status(400).json({ error: "Adj meg érvényes azonosítót és aktív állapotot." });
    }
    const result = db.prepare(
      "UPDATE notification_recipients SET enabled = ? WHERE id = ?"
    ).run(enabled ? 1 : 0, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Az e-mail-cím nem található." });
    }
    return res.json({ id, enabled });
  });

  app.delete("/api/admin/notification-recipients/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: "Érvénytelen e-mail-cím azonosító." });
    }
    const result = db.prepare("DELETE FROM notification_recipients WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Az e-mail-cím nem található." });
    }
    return res.status(204).end();
  });

  app.get("/api/admin/reservations", requireAdmin, (_req, res) => {
    const reservations = db.prepare(`
      SELECT id, name, date, time, party_size AS partySize,
        table_preference AS tablePreference, decor_color AS decorColor,
        notes, status, created_at AS createdAt
      FROM reservations ORDER BY id DESC LIMIT 500
    `).all();
    res.json(reservations);
  });

  app.patch("/api/admin/reservations/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    if (!Number.isSafeInteger(id) || id < 1 ||
        !RESERVATION_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Érvénytelen foglalásazonosító vagy státusz." });
    }

    const result = db.prepare("UPDATE reservations SET status = ? WHERE id = ?").run(status, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "A foglalás nem található." });
    }
    return res.json({ id, status });
  });

  app.delete("/api/admin/reservations/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: "Érvénytelen foglalásazonosító." });
    }
    const result = db.prepare("DELETE FROM reservations WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "A foglalás nem található." });
    }
    return res.status(204).end();
  });

  app.get("/api/admin/reviews", requireAdmin, (_req, res) => {
    const reviews = db.prepare(`
      SELECT id, name, visit_date AS visitDate,
        coffee_rating AS coffeeRating, service_rating AS serviceRating,
        atmosphere_rating AS atmosphereRating, recommendation,
        liked_items AS likedItems, text, created_at AS createdAt
      FROM reviews ORDER BY id DESC LIMIT 500
    `).all().map((review) => ({
      ...review,
      likedItems: JSON.parse(review.likedItems),
    }));
    res.json(reviews);
  });

  app.delete("/api/admin/reviews/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: "Érvénytelen véleményazonosító." });
    }
    const result = db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "A vélemény nem található." });
    }
    return res.status(204).end();
  });

  app.get("/admin", (_req, res) => res.sendFile(path.join(ROOT, "admin.html")));
  app.get("/admin.html", (_req, res) => res.sendFile(path.join(ROOT, "admin.html")));
  app.get("/index.html", (_req, res) => res.redirect(301, "/"));
  app.get("/", (_req, res) => res.sendFile(path.join(ROOT, "index.html")));
  for (const directory of ["css", "img", "js", "pages"]) {
    app.use(`/${directory}`, express.static(path.join(ROOT, directory), {
      dotfiles: "deny",
      index: false,
    }));
  }

  app.use("/api", (_req, res) => res.status(404).json({ error: "Az API-végpont nem található." }));
  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({ error: "A kérés törzse nem érvényes JSON." });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ error: "A kérés túl nagy." });
    }
    console.error(error);
    return res.status(500).json({ error: "Belső szerverhiba történt." });
  });

  return {
    app,
    close: () => {
      if (transporter) transporter.close();
      db.close();
    },
  };
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  const { app, close } = createApplication();
  const server = app.listen(port, () => {
    console.log(`Coffee House test site listening at http://localhost:${port}`);
  });

  let shuttingDown = false;
  function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received; shutting down.`);
    server.close(() => {
      close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

module.exports = { createApplication };
