const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Database = require("better-sqlite3");
const { createApplication } = require("../server");
const { backupDatabase } = require("../scripts/backup-database");

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextOpenDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0) date.setDate(date.getDate() + 1);
  return localDateString(date);
}

test("public submissions persist and admin endpoints require a token", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "coffee-house-test-"));
  const adminToken = "test-admin-token-with-at-least-32-characters";
  const sentEmails = [];
  let failEmailDelivery = false;
  const { app, close } = createApplication({
    databasePath: path.join(directory, "test.sqlite"),
    adminToken,
    smtpConfigured: true,
    sendEmail: async (message) => {
      if (failEmailDelivery) throw new Error("SMTP unavailable");
      sentEmails.push(message);
    },
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
    close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });

  const privateRecipients = await fetch(`${baseUrl}/api/admin/notification-recipients`);
  assert.equal(privateRecipients.status, 401);

  const addRecipient = await fetch(`${baseUrl}/api/admin/notification-recipients`, {
    method: "POST",
    headers: { ...adminHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com" }),
  });
  assert.equal(addRecipient.status, 201);
  const savedRecipient = await addRecipient.json();
  assert.equal(savedRecipient.enabled, true);

  const invalidRecipient = await fetch(`${baseUrl}/api/admin/notification-recipients`, {
    method: "POST",
    headers: { ...adminHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assert.equal(invalidRecipient.status, 400);

  const addSecondRecipient = await fetch(`${baseUrl}/api/admin/notification-recipients`, {
    method: "POST",
    headers: { ...adminHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "backup@example.com" }),
  });
  assert.equal(addSecondRecipient.status, 201);
  const secondRecipient = await addSecondRecipient.json();

  const duplicateRecipient = await fetch(`${baseUrl}/api/admin/notification-recipients`, {
    method: "POST",
    headers: { ...adminHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ADMIN@example.com" }),
  });
  assert.equal(duplicateRecipient.status, 409);

  const disableRecipient = await fetch(
    `${baseUrl}/api/admin/notification-recipients/${savedRecipient.id}`,
    {
      method: "PATCH",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: false }),
    }
  );
  assert.equal(disableRecipient.status, 200);
  assert.equal((await disableRecipient.json()).enabled, false);

  const enableRecipient = await fetch(
    `${baseUrl}/api/admin/notification-recipients/${savedRecipient.id}`,
    {
      method: "PATCH",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true }),
    }
  );
  assert.equal(enableRecipient.status, 200);
  assert.equal((await enableRecipient.json()).enabled, true);

  const recipientsResponse = await fetch(`${baseUrl}/api/admin/notification-recipients`, {
    headers: adminHeaders,
  });
  const recipientSettings = await recipientsResponse.json();
  assert.equal(recipientSettings.smtpConfigured, true);
  assert.equal(recipientSettings.recipients[0].email, "admin@example.com");
  assert.equal(recipientSettings.recipients.length, 2);

  const disableSecondRecipient = await fetch(
    `${baseUrl}/api/admin/notification-recipients/${secondRecipient.id}`,
    {
      method: "PATCH",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: false }),
    }
  );
  assert.equal(disableSecondRecipient.status, 200);

  const reservationResponse = await fetch(`${baseUrl}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Teszt Vendég",
      date: nextOpenDate(),
      time: "10:00",
      partySize: 2,
      tablePreference: "Ablak melletti",
      decorColor: "#6d4c41",
      notes: "",
      acceptedTerms: true,
    }),
  });
  assert.equal(reservationResponse.status, 201);
  const reservation = await reservationResponse.json();
  assert.equal(reservation.notification.sent, true);
  assert.deepEqual(sentEmails[0].bcc, ["admin@example.com"]);
  assert.match(sentEmails[0].subject, /asztalfoglalás/);

  const enableSecondRecipient = await fetch(
    `${baseUrl}/api/admin/notification-recipients/${secondRecipient.id}`,
    {
      method: "PATCH",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true }),
    }
  );
  assert.equal(enableSecondRecipient.status, 200);

  const unauthorized = await fetch(`${baseUrl}/api/admin/reservations`);
  assert.equal(unauthorized.status, 401);

  const reservationsResponse = await fetch(`${baseUrl}/api/admin/reservations`, {
    headers: adminHeaders,
  });
  assert.equal(reservationsResponse.status, 200);
  assert.equal((await reservationsResponse.json())[0].id, reservation.id);

  const statusResponse = await fetch(
    `${baseUrl}/api/admin/reservations/${reservation.id}`,
    {
      method: "PATCH",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    }
  );
  assert.equal(statusResponse.status, 200);
  assert.equal((await statusResponse.json()).status, "confirmed");

  const reviewResponse = await fetch(`${baseUrl}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitDate: localDateString(new Date()),
      coffeeRating: 5,
      serviceRating: 4,
      atmosphereRating: 5,
      recommendation: "Igen, biztosan",
      likedItems: ["Specialty kávék"],
      text: "Nagyon finom volt a kávé!",
    }),
  });
  assert.equal(reviewResponse.status, 201);
  const review = await reviewResponse.json();
  assert.equal(review.notification.sent, true);
  assert.match(sentEmails[1].subject, /vendégvélemény/);
  assert.deepEqual(sentEmails[1].bcc, ["admin@example.com", "backup@example.com"]);

  failEmailDelivery = true;
  const failedNotificationReservation = await fetch(`${baseUrl}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Teszt vendég SMTP hiba",
      date: nextOpenDate(),
      time: "11:00",
      partySize: 1,
      tablePreference: "Terasz",
      decorColor: "#6d4c41",
      notes: "",
      acceptedTerms: true,
    }),
  });
  assert.equal(failedNotificationReservation.status, 201);
  const savedDespiteMailFailure = await failedNotificationReservation.json();
  assert.equal(savedDespiteMailFailure.notification.sent, false);
  assert.equal(savedDespiteMailFailure.notification.reason, "delivery_failed");
  failEmailDelivery = false;
  const publicReviews = await fetch(`${baseUrl}/api/reviews`);
  const savedReviews = await publicReviews.json();
  assert.equal(savedReviews[0].id, review.id);
  assert.equal(savedReviews[0].name, "Névtelen vendég");

  const invalidReview = await fetch(`${baseUrl}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coffeeRating: 9 }),
  });
  assert.equal(invalidReview.status, 400);

  const deleteReview = await fetch(`${baseUrl}/api/admin/reviews/${review.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert.equal(deleteReview.status, 204);
  const deleteRecipient = await fetch(
    `${baseUrl}/api/admin/notification-recipients/${secondRecipient.id}`,
    { method: "DELETE", headers: adminHeaders }
  );
  assert.equal(deleteRecipient.status, 204);

  const sourceFile = await fetch(`${baseUrl}/server.js`);
  assert.equal(sourceFile.status, 404);
  const adminPage = await fetch(`${baseUrl}/admin`);
  assert.equal(adminPage.status, 200);
  assert.match(await adminPage.text(), /Foglalások és vélemények/);

  const homepage = await fetch(`${baseUrl}/`);
  assert.equal(homepage.status, 200);
  assert.match(await homepage.text(), /Üdvözlünk a Coffee House-ban/);
  const legacyHomepage = await fetch(`${baseUrl}/index.html`, { redirect: "manual" });
  assert.equal(legacyHomepage.status, 301);
  assert.equal(legacyHomepage.headers.get("location"), "/");
});

test("reviews are stored and report missing SMTP settings", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "coffee-house-no-smtp-"));
  const { app, close } = createApplication({
    databasePath: path.join(directory, "test.sqlite"),
    adminToken: "test-admin-token-with-at-least-32-characters",
    smtpConfigured: false,
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
    close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  const response = await fetch(`${baseUrl}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitDate: localDateString(new Date()),
      coffeeRating: 4,
      serviceRating: 4,
      atmosphereRating: 4,
      recommendation: "Talán",
      likedItems: [],
      text: "Tesztvélemény SMTP konfiguráció nélkül.",
    }),
  });
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.deepEqual(result.notification, { sent: false, reason: "smtp_not_configured" });

  const savedReviews = await fetch(`${baseUrl}/api/reviews`);
  assert.equal((await savedReviews.json()).length, 1);
});

test("database backups contain saved data and reject overwriting the source", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "coffee-house-backup-"));
  const sourcePath = path.join(directory, "source.sqlite");
  const backupPath = path.join(directory, "backup", "copy.sqlite");
  const db = new Database(sourcePath);
  db.exec("CREATE TABLE sample (value TEXT NOT NULL); INSERT INTO sample VALUES ('persisted');");
  db.close();

  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  await backupDatabase(sourcePath, backupPath);
  const backup = new Database(backupPath, { readonly: true });
  assert.equal(backup.prepare("SELECT value FROM sample").get().value, "persisted");
  backup.close();
  await assert.rejects(backupDatabase(sourcePath, sourcePath), /must differ/);
});
