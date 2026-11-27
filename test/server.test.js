const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createApplication } = require("../server");

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
  const { app, close } = createApplication({
    databasePath: path.join(directory, "test.sqlite"),
    adminToken,
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
    close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

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

  const unauthorized = await fetch(`${baseUrl}/api/admin/reservations`);
  assert.equal(unauthorized.status, 401);

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
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

  const sourceFile = await fetch(`${baseUrl}/server.js`);
  assert.equal(sourceFile.status, 404);
});
