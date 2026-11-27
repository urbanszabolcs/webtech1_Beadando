$(function () {
    const tokenKey = "coffeeHouseAdminToken";
    let adminToken = sessionStorage.getItem(tokenKey) || "";
    let reservations = [];
    let reviews = [];
    let recipients = [];
    let smtpConfigured = false;

    function showMessage(message, type) {
        $("#admin-message")
            .removeClass("d-none alert-success alert-danger alert-info")
            .addClass("alert-" + type)
            .text(message);
    }

    function hideMessage() {
        $("#admin-message")
            .addClass("d-none")
            .removeClass("alert-success alert-danger alert-info")
            .empty();
    }

    function showLogin(message) {
        adminToken = "";
        sessionStorage.removeItem(tokenKey);
        $("#admin-token").val("");
        $("#dashboard, #admin-actions").addClass("d-none");
        $("#login-panel").removeClass("d-none");
        if (message) showMessage(message, "danger");
    }

    async function adminFetch(url, options) {
        const requestOptions = options || {};
        requestOptions.headers = {
            ...(requestOptions.headers || {}),
            Authorization: "Bearer " + adminToken
        };
        const response = await fetch(url, requestOptions);
        if (response.status === 401) {
            showLogin("A munkamenet lejárt vagy az admin token hibás. Jelentkezz be újra.");
            throw new Error("Nincs admin jogosultság.");
        }
        if (response.status === 204) return null;
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "A kérés nem sikerült.");
        return result;
    }

    function updateCounts() {
        $("#reservation-count").text(reservations.length);
        $("#pending-count").text(reservations.filter((item) => item.status === "pending").length);
        $("#review-count").text(reviews.length);
        $("#reservation-tab-count").text(reservations.length);
        $("#review-tab-count").text(reviews.length);
    }

    function renderRecipients() {
        const list = $("#recipients-list").empty();
        const select = $("#recipient-target-select").empty();
        $("#recipients-empty").toggleClass("d-none", recipients.length > 0);

        recipients.forEach((recipient) => {
            const option = $("<option></option>")
                .val(recipient.id)
                .text(recipient.email)
                .prop("selected", recipient.enabled);
            select.append(option);

            const row = $("<div class='recipient-row'></div>");
            const label = $("<span class='text-break'></span>").text(recipient.email);
            const deleteButton = $("<button type='button' class='btn btn-sm btn-outline-danger'>Eltávolítás</button>");
            deleteButton.on("click", () => deleteEntry(
                "/api/admin/notification-recipients/" + recipient.id,
                "Biztosan eltávolítod ezt az értesítési címet?",
                loadDashboard
            ));
            row.append(label, deleteButton);
            list.append(row);
        });

        $("#smtp-status")
            .toggleClass("text-bg-success", smtpConfigured)
            .toggleClass("text-bg-danger", !smtpConfigured)
            .text(smtpConfigured ? "SMTP beállítva" : "SMTP nincs beállítva");
        $("#smtp-help")
            .toggleClass("d-none", smtpConfigured)
            .text("Add meg az SMTP_HOST, SMTP_USER és SMTP_PASS beállításokat a szerver .env fájljában. Az SMTP_FROM opcionális. A módosítások után indítsd újra a szervert. Beállítás nélkül az adatok mentése működik, de e-mail nem küldhető.");
    }

    function renderReservations() {
        const query = $("#reservation-filter").val().trim().toLocaleLowerCase("hu");
        const filtered = reservations.filter((reservation) =>
            [reservation.name, reservation.date, reservation.time, reservation.tablePreference]
                .join(" ")
                .toLocaleLowerCase("hu")
                .includes(query)
        );
        const list = $("#reservations-list").empty();
        $("#reservations-empty")
            .toggleClass("d-none", filtered.length > 0)
            .text(reservations.length ? "Nincs a keresésnek megfelelő foglalás." : "Még nincs foglalás.");

        filtered.forEach((reservation) => {
            const row = $("<tr></tr>");
            const dateCell = $("<td></td>").append(
                $("<strong></strong>").text(reservation.date),
                $("<div class='small text-muted'></div>").text(reservation.time)
            );
            const guestCell = $("<td></td>").append(
                $("<strong></strong>").text(reservation.name),
                $("<div class='small text-muted'></div>").text("Foglalás #" + reservation.id)
            );
            const detailsCell = $("<td></td>").append(
                $("<div></div>").text(reservation.tablePreference),
                $("<div class='small text-muted'></div>").text(reservation.partySize + " fő")
            );
            const notesCell = $("<td class='admin-note'></td>").text(reservation.notes || "–");
            const statusCell = $("<td></td>");
            const status = $("<select class='form-select form-select-sm' aria-label='Foglalás státusza'></select>");
            [
                ["pending", "Függőben"],
                ["confirmed", "Megerősítve"],
                ["cancelled", "Lemondva"]
            ].forEach(([value, label]) => {
                status.append($("<option></option>").val(value).text(label));
            });
            status.val(reservation.status);
            status.on("change", () => updateReservationStatus(reservation, status));
            statusCell.append(status);

            const actionCell = $("<td class='text-end'></td>");
            const deleteButton = $("<button type='button' class='btn btn-sm btn-outline-danger'>Törlés</button>");
            deleteButton.on("click", () => deleteEntry(
                "/api/admin/reservations/" + reservation.id,
                "Biztosan törlöd ezt a foglalást?",
                loadDashboard
            ));
            actionCell.append(deleteButton);
            row.append(dateCell, guestCell, detailsCell, notesCell, statusCell, actionCell);
            list.append(row);
        });
    }

    function renderReviews() {
        const query = $("#review-filter").val().trim().toLocaleLowerCase("hu");
        const filtered = reviews.filter((review) =>
            [review.name, review.visitDate, review.text, review.recommendation]
                .join(" ")
                .toLocaleLowerCase("hu")
                .includes(query)
        );
        const list = $("#reviews-list").empty();
        $("#reviews-empty")
            .toggleClass("d-none", filtered.length > 0)
            .text(reviews.length ? "Nincs a keresésnek megfelelő vélemény." : "Még nincs vélemény.");

        filtered.forEach((review) => {
            const card = $("<article class='admin-review-card'></article>");
            const header = $("<div class='d-flex justify-content-between align-items-start gap-2 mb-2'></div>");
            const identity = $("<div></div>").append(
                $("<h3 class='h6 mb-1'></h3>").text(review.name || "Névtelen vendég"),
                $("<div class='small text-muted'></div>").text(review.visitDate)
            );
            const deleteButton = $("<button type='button' class='btn btn-sm btn-outline-danger'>Törlés</button>");
            deleteButton.attr("aria-label", "Vélemény törlése");
            deleteButton.on("click", () => deleteEntry(
                "/api/admin/reviews/" + review.id,
                "Biztosan törlöd ezt a véleményt?",
                loadDashboard
            ));
            header.append(identity, deleteButton);

            const ratings = $("<div class='badge badge-roast mb-2'></div>").text(
                "Kávé " + review.coffeeRating + "/5 · Kiszolgálás " +
                review.serviceRating + "/5 · Hangulat " + review.atmosphereRating + "/5"
            );
            const recommendation = $("<p class='small text-muted mb-2'></p>").text(
                "Ajánlás: " + review.recommendation +
                " · Kedvencek: " + (review.likedItems.length ? review.likedItems.join(", ") : "nincs megadva")
            );
            card.append(header, ratings, recommendation, $("<p class='mb-0'></p>").text(review.text));
            list.append(card);
        });
    }

    async function loadDashboard() {
        hideMessage();
        $("#refresh-button").prop("disabled", true);
        try {
            const [reservationData, reviewData, notificationSettings] = await Promise.all([
                adminFetch("/api/admin/reservations"),
                adminFetch("/api/admin/reviews"),
                adminFetch("/api/admin/notification-recipients")
            ]);
            reservations = reservationData;
            reviews = reviewData;
            recipients = notificationSettings.recipients;
            smtpConfigured = notificationSettings.smtpConfigured;
            updateCounts();
            renderReservations();
            renderReviews();
            renderRecipients();
            $("#login-panel").addClass("d-none");
            $("#dashboard, #admin-actions").removeClass("d-none");
            return true;
        } catch (error) {
            if (adminToken) {
                console.error("Admin adatok betöltése sikertelen:", error);
                if (!$("#admin-message").hasClass("alert-danger")) {
                    showMessage("Nem sikerült betölteni az admin adatokat. Ellenőrizd, hogy a szerver fut-e.", "danger");
                }
            }
            return false;
        } finally {
            $("#refresh-button").prop("disabled", false);
        }
    }

    async function updateReservationStatus(reservation, select) {
        const previousStatus = reservation.status;
        select.prop("disabled", true);
        try {
            await adminFetch("/api/admin/reservations/" + reservation.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: select.val() })
            });
            reservation.status = select.val();
            updateCounts();
            showMessage("A foglalás státusza frissült.", "success");
        } catch (error) {
            select.val(previousStatus);
            if (adminToken) {
                console.error("Foglalás státuszának mentése sikertelen:", error);
                showMessage(error.message, "danger");
            }
        } finally {
            select.prop("disabled", false);
        }
    }

    async function saveRecipients() {
        const selectedIds = new Set(
            $("#recipient-target-select option:selected").map(function () {
                return Number($(this).val());
            }).get()
        );
        const changedRecipients = recipients.filter(
            (recipient) => recipient.enabled !== selectedIds.has(recipient.id)
        );
        const button = $("#save-recipients-button");
        button.prop("disabled", true);
        try {
            await Promise.all(changedRecipients.map((recipient) =>
                adminFetch("/api/admin/notification-recipients/" + recipient.id, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ enabled: selectedIds.has(recipient.id) })
                })
            ));
            await loadDashboard();
            showMessage("Az értesítési cím beállítása elmentve.", "success");
        } catch (error) {
            if (adminToken) {
                console.error("Értesítési cím beállításának mentése sikertelen:", error);
                showMessage(error.message, "danger");
            }
        } finally {
            button.prop("disabled", false);
        }
    }

    async function deleteEntry(url, confirmation, onSuccess) {
        if (!window.confirm(confirmation)) return;
        try {
            await adminFetch(url, { method: "DELETE" });
            await onSuccess();
            showMessage("A bejegyzés törölve.", "success");
        } catch (error) {
            if (adminToken) {
                console.error("Bejegyzés törlése sikertelen:", error);
                showMessage(error.message, "danger");
            }
        }
    }

    $("#login-form").on("submit", async function (event) {
        event.preventDefault();
        const submitButton = $(this).find("button[type='submit']");
        adminToken = $("#admin-token").val().trim();
        submitButton.prop("disabled", true);
        hideMessage();
        try {
            const loaded = await loadDashboard();
            if (loaded && adminToken) {
                sessionStorage.setItem(tokenKey, adminToken);
                $("#admin-token").val("");
                showMessage("Sikeres admin belépés.", "success");
            }
        } finally {
            submitButton.prop("disabled", false);
        }
    });

    $("#refresh-button").on("click", loadDashboard);
    $("#save-recipients-button").on("click", saveRecipients);
    $("#recipient-form").on("submit", async function (event) {
        event.preventDefault();
        const input = $("#recipient-email");
        const submitButton = $(this).find("button[type='submit']");
        submitButton.prop("disabled", true);
        try {
            await adminFetch("/api/admin/notification-recipients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: input.val().trim() })
            });
            input.val("");
            await loadDashboard();
            showMessage("Az értesítési cím hozzáadva.", "success");
        } catch (error) {
            if (adminToken) {
                console.error("Értesítési cím hozzáadása sikertelen:", error);
                showMessage(error.message, "danger");
            }
        } finally {
            submitButton.prop("disabled", false);
        }
    });
    $("#logout-button").on("click", () => {
        showLogin("");
        hideMessage();
        $("#admin-token").trigger("focus");
    });
    $("#reservation-filter").on("input", renderReservations);
    $("#review-filter").on("input", renderReviews);

    if (adminToken) loadDashboard();
});
