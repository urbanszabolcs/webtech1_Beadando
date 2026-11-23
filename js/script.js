/* =========================================================
   Coffee House – Interaktív funkciók és validáció (js/script.js)
   Használt könyvtár: jQuery 3.7.1 + Bootstrap 5 Modal API
   ========================================================= */

$(document).ready(function () {
    // ---------------------------------------------------------
    // 1. ELEMEK KIVÁLASZTÁSA (tag név, osztály, azonosító alapján)
    // ---------------------------------------------------------
    $("h1").css("letter-spacing", "0.4px");                         // HTML tag név alapján
    $(".kiemelt-span").attr("title", "Coffee House kiemelt minőség"); // Osztály (class) alapján
    $("#hero-box").attr("data-loaded", "true");                     // Azonosító (ID) alapján

    // ---------------------------------------------------------
    // 2. AUTOMATIKUS NAPI AJÁNLAT ÉS DOM MANIPULÁCIÓ (Főoldal)
    // ---------------------------------------------------------
    const napiAjanlatok = [
        { nap: "Vasárnapi ajánlat", szoveg: "Cappuccino + Pisztáciás Sajttorta – 2 590 Ft" },
        { nap: "Hétfői ajánlat", szoveg: "Dupla Espresso + Vajas Croissant – 1 690 Ft" },
        { nap: "Keddi ajánlat", szoveg: "Flat White + Vegán Csokoládés Brownie – 2 450 Ft" },
        { nap: "Szerdai ajánlat", szoveg: "Cold Brew Tonic + Citromos Pite – 2 390 Ft" },
        { nap: "Csütörtöki ajánlat", szoveg: "Cappuccino + Friss Vajas Croissant – 1 950 Ft" },
        { nap: "Pénteki ajánlat", szoveg: "Flat White + Pisztáciás Sajttorta – 2 690 Ft" },
        { nap: "Szombati ajánlat", szoveg: "Cold Brew Tonic + Vegán Brownie – 2 550 Ft" }
    ];

    // A hét aktuális napjának lekérése (0 = vasárnap ... 6 = szombat)
    let aktualisIndex = new Date().getDay();

    // Oldalbetöltéskor automatikusan megjelenik az aktuális napi ajánlat
    if ($("#napi-ajanlat-doboz").length) {
        const mai = napiAjanlatok[aktualisIndex];
        $("#napi-ajanlat-nap").text(mai.nap);
        $("#modositando-szoveg").text(mai.szoveg);
        $("#napi-ajanlat-doboz").hide().fadeIn(650);
    }

    // Meglévő HTML elem módosítása gombnyomásra (következő napi ajánlat)
    $("#btn-modosit").click(function () {
        aktualisIndex = (aktualisIndex + 1) % napiAjanlatok.length;
        const kovetkezo = napiAjanlatok[aktualisIndex];
        $("#napi-ajanlat-nap").text(kovetkezo.nap);
        $("#modositando-szoveg").fadeOut(150, function () {
            $(this).text(kovetkezo.szoveg).fadeIn(250);
        });
    });

    // Új HTML elem dinamikus létrehozása (kóstoló jegyzet + törlő X gomb)
    let jegyzetSzamlalo = 1;
    $("#btn-uj-elem").click(function () {
        const ujElem = $("<div class='alert alert-light text-dark mt-2 mb-0 py-2 px-3 d-flex justify-content-between align-items-center gap-2'></div>");
        const szovegSpan = $("<span></span>").text("Kóstoló jegyzet #" + jegyzetSzamlalo + ": Friss, csokoládés-mogyorós pörkölési profil.");
        const torlesGomb = $("<button type='button' class='jegyzet-torles-btn' title='Jegyzet törlése' aria-label='Jegyzet törlése'>&times;</button>");

        ujElem.append(szovegSpan, torlesGomb);
        $("#dinamikus-kontener").append(ujElem.hide().fadeIn(300));
        jegyzetSzamlalo++;
    });

    // Eseménydelegálás: a dinamikusan hozzáadott jegyzetek törlése az X gombra kattintva
    $("#dinamikus-kontener").on("click", ".jegyzet-torles-btn", function () {
        $(this).closest(".alert").fadeOut(250, function () {
            $(this).remove();
        });
    });

    // ---------------------------------------------------------
    // 3. VENDÉG KUPON QR-KÓD ANIMÁCIÓ (Főoldal alján)
    // ---------------------------------------------------------
    $("#btn-vendeg-kupon").click(function () {
        const doboz = $("#qr-kupon-doboz");
        if (doboz.is(":visible")) {
            doboz.slideUp(350);
            $(this).text("Vendég kupon megjelenítése");
        } else {
            doboz.slideDown(450);
            $(this).text("Vendég kupon elrejtése");
            // Finom görgetés a kupon szekcióhoz
            $("html, body").animate({
                scrollTop: $("#kupon-szekcio").offset().top - 80
            }, 450);
        }
    });

    // ---------------------------------------------------------
    // 4. ÉTLAP: KÉPEK BELÉPŐ ANIMÁCIÓJA ÉS NAGYÍTÁS (Modal)
    // ---------------------------------------------------------
    if ($(".etlap-kartya-elem").length) {
        $(".etlap-kartya-elem").hide().each(function (index) {
            $(this).delay(110 * index).fadeIn(420);
        });
    }

    // Termékkártyára kattintva a data-* attribútumokból feltölti és megnyitja a nagyított nézetet
    $(".etlap-kep-kartya").click(function () {
        const nev = $(this).data("nev");
        const ar = $(this).data("ar");
        const leiras = $(this).data("leiras");
        const imgSrc = $(this).data("img");

        $("#modalTermekCim").text(nev);
        $("#modalTermekKep").attr("src", imgSrc).attr("alt", nev);
        $("#modalTermekNev").text(nev);
        $("#modalTermekAr").text(ar);
        $("#modalTermekLeiras").text(leiras);

        const modalElem = document.getElementById("termekModal");
        const bsModal = new bootstrap.Modal(modalElem);
        bsModal.show();
    });

    // ---------------------------------------------------------
    // 5. GALÉRIA KÉPEK SOROZATOS BEÚSZÓ ANIMÁCIÓJA
    // ---------------------------------------------------------
    if ($(".galeria-elem").length) {
        $(".galeria-elem").hide().each(function (index) {
            $(this).delay(100 * index).fadeIn(400);
        });
    }

    $("#btn-galeria-anim").click(function () {
        $(".galeria-elem").hide().each(function (index) {
            $(this).delay(110 * index).fadeIn(400);
        });
    });

    // ---------------------------------------------------------
    // 6. ASZTALFOGLALÁS ŰRLAP & NYITVATARTÁS ELLENŐRZÉS (pages/foglalas.html)
    // ---------------------------------------------------------
    // Nyitvatartási szabályok lekérdezése egy adott YYYY-MM-DD dátumra
    function nyitvatartasAdottNapra(datumStr) {
        if (!datumStr) return null;
        const reszek = datumStr.split("-");
        const datumObj = new Date(Number(reszek[0]), Number(reszek[1]) - 1, Number(reszek[2]));
        const hetNapja = datumObj.getDay(); // 0 = vasárnap, 1-5 = H-P, 6 = szombat

        if (hetNapja === 0) {
            return { nyitva: false, szoveg: "Vasárnap zárva tartunk!" };
        }
        if (hetNapja === 6) {
            return { nyitva: true, nyitas: "09:00", zaras: "21:00", szoveg: "Szombati nyitvatartás: 09:00 – 21:00" };
        }
        return { nyitva: true, nyitas: "08:00", zaras: "20:00", szoveg: "Hétköznapi nyitvatartás: 08:00 – 20:00" };
    }

    // Múltbeli dátumok letiltása a dátumválasztón
    if ($("#datum").length) {
        const ma = new Date();
        const yyyy = ma.getFullYear();
        const mm = String(ma.getMonth() + 1).padStart(2, "0");
        const dd = String(ma.getDate()).padStart(2, "0");
        $("#datum").attr("min", yyyy + "-" + mm + "-" + dd);
    }

    // Dátum módosításakor azonnal frissíti az időpontválasztó határait, vasárnap pedig letiltja
    $("#datum").on("change", function () {
        const datumStr = $(this).val();
        const info = nyitvatartasAdottNapra(datumStr);

        $("#datum").removeClass("hibas-mezo");
        $("#hiba-datum").text("");
        $("#idopont").removeClass("hibas-mezo");
        $("#hiba-idopont").text("");

        if (!info) {
            $("#idopont").prop("disabled", false).attr("min", "08:00").attr("max", "20:00");
            $("#idopont-segitseg").text("Először válassz dátumot a nyitvatartási időhöz.");
            return;
        }

        if (!info.nyitva) {
            // Vasárnap zárva: időpont mező letiltása és azonnali figyelmeztetés
            $("#datum").addClass("hibas-mezo");
            $("#hiba-datum").text("Vasárnap zárva tartunk, erre a napra nem lehet asztalt foglalni.");
            $("#idopont").val("").prop("disabled", true);
            $("#idopont-segitseg").text("Zárva tartás miatt nem választható időpont.");
        } else {
            $("#idopont").prop("disabled", false).attr("min", info.nyitas).attr("max", info.zaras);
            $("#idopont-segitseg").text(info.szoveg);

            // Ha már volt beírva időpont és kívül esik az új nap nyitvatartásán, jelezzük
            const aktualisIdo = $("#idopont").val();
            if (aktualisIdo && (aktualisIdo < info.nyitas || aktualisIdo > info.zaras)) {
                $("#idopont").addClass("hibas-mezo");
                $("#hiba-idopont").text("Ezen a napon csak " + info.nyitas + " és " + info.zaras + " között foglalhatsz!");
            }
        }
    });

    // Időpont megadásakor azonnali nyitvatartási ellenőrzés
    $("#idopont").on("change input", function () {
        const datumStr = $("#datum").val();
        const idopont = $(this).val();
        const info = nyitvatartasAdottNapra(datumStr);

        $("#idopont").removeClass("hibas-mezo");
        $("#hiba-idopont").text("");

        if (info && info.nyitva && idopont) {
            if (idopont < info.nyitas || idopont > info.zaras) {
                $("#idopont").addClass("hibas-mezo");
                $("#hiba-idopont").text("A kávézó ekkor nincs nyitva! (" + info.szoveg + ")");
            }
        }
    });

    $("#foglalas-urlap").submit(function (e) {
        e.preventDefault();
        let ervenyes = true;

        // Korábbi hibaállapotok visszaállítása
        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");
        $("#sikeres-foglalas").empty();

        // Név ellenőrzése (min. 3 karakter)
        if ($("#nev").val().trim().length < 3) {
            $("#nev").addClass("hibas-mezo");
            $("#hiba-nev").text("Kérlek add meg a nevedet (min. 3 karakter).");
            ervenyes = false;
        }

        // Dátum és nyitvatartási nap ellenőrzése
        const datumStr = $("#datum").val();
        const nyitvaInfo = nyitvatartasAdottNapra(datumStr);
        const minDatum = $("#datum").attr("min");

        if (datumStr === "") {
            $("#datum").addClass("hibas-mezo");
            $("#hiba-datum").text("Kérlek válassz foglalási dátumot.");
            ervenyes = false;
        } else if (minDatum && datumStr < minDatum) {
            $("#datum").addClass("hibas-mezo");
            $("#hiba-datum").text("Múltbeli dátumra nem lehet asztalt foglalni.");
            ervenyes = false;
        } else if (nyitvaInfo && !nyitvaInfo.nyitva) {
            $("#datum").addClass("hibas-mezo");
            $("#hiba-datum").text("Vasárnap zárva tartunk, válassz másik napot!");
            ervenyes = false;
        }

        // Időpont (óra:perc) ellenőrzése az adott nap nyitvatartása alapján
        const idopont = $("#idopont").val();
        if (nyitvaInfo && !nyitvaInfo.nyitva) {
            $("#idopont").addClass("hibas-mezo");
            $("#hiba-idopont").text("Zárva tartás alatt nem foglalható időpont.");
            ervenyes = false;
        } else if (idopont === "") {
            $("#idopont").addClass("hibas-mezo");
            $("#hiba-idopont").text("Kérlek válassz egy időpontot nyitvatartási időn belül!");
            ervenyes = false;
        } else if (nyitvaInfo && (idopont < nyitvaInfo.nyitas || idopont > nyitvaInfo.zaras)) {
            $("#idopont").addClass("hibas-mezo");
            $("#hiba-idopont").text("A kávézó ekkor nincs nyitva! (" + nyitvaInfo.szoveg + ")");
            ervenyes = false;
        }

        // Létszám ellenőrzése (kötelező, 1 és 5 fő között)
        const letszam = parseInt($("#letszam").val(), 10);
        if (isNaN(letszam) || letszam < 1 || letszam > 5) {
            $("#letszam").addClass("hibas-mezo");
            $("#hiba-letszam").text("Kérlek válaszd ki a létszámot (1–5 fő)!");
            ervenyes = false;
        }

        // Rádiógomb csoport (asztaltípus) ellenőrzése
        if ($("input[name='asztalTipus']:checked").length === 0) {
            $("#asztal-csoport").addClass("hibas-mezo p-2 rounded");
            $("#hiba-asztal").text("Kérlek válaszd ki a preferált asztaltípust!");
            ervenyes = false;
        }

        // A különleges kérés (megjegyzés) mező opcionális, nem kötelező kitölteni

        // Kötelező checkbox ellenőrzése
        if (!$("#elfogad").is(":checked")) {
            $("#elfogad").addClass("hibas-mezo");
            $("#hiba-elfogad").text("A foglalási feltételek elfogadása kötelező.");
            ervenyes = false;
        }

        // Sikeres foglalás visszajelzés létrehozása
        if (ervenyes) {
            const nev = $("#nev").val().trim();
            const valasztottLetszam = $("#letszam").val();
            const asztal = $("input[name='asztalTipus']:checked").val();
            const uzenet = $("<div class='alert alert-success'></div>")
                .text("Köszönjük, " + nev + "! Az asztalfoglalásodat (" + datumStr + " " + idopont + ", " + valasztottLetszam + " fő, " + asztal + ") sikeresen rögzítettük.");
            $("#sikeres-foglalas").append(uzenet).hide().fadeIn(350);
        }
    });

    // Alaphelyzet gombnál a hibajelzések és a letiltott időpont mező visszaállítása
    $("#foglalas-urlap").on("reset", function () {
        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");
        $("#sikeres-foglalas").empty();
        $("#idopont").prop("disabled", false).attr("min", "08:00").attr("max", "20:00");
        $("#idopont-segitseg").text("Először válassz dátumot a nyitvatartási időhöz.");
    });

    // ---------------------------------------------------------
    // 7. VÉLEMÉNY ÉS ÉRTÉKELÉS VALIDÁCIÓ (pages/velemeny.html)
    // ---------------------------------------------------------
    $("#velemeny-urlap").submit(function (e) {
        e.preventDefault();
        let ervenyes = true;

        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");

        // A név mező opcionális; a látogatás dátuma és az értékelések kötelezők
        if ($("#vel-datum").val() === "") {
            $("#vel-datum").addClass("hibas-mezo");
            $("#hiba-vel-datum").text("Kérlek add meg a látogatás dátumát.");
            ervenyes = false;
        }

        if ($("input[name='kaveErt']:checked").length === 0) {
            $("#kave-ert-csoport").addClass("hibas-mezo");
            $("#hiba-kave-ert").text("Kérlek értékeld a kávé minőségét (1–5)!");
            ervenyes = false;
        }

        if ($("input[name='kiszolgalasErt']:checked").length === 0) {
            $("#kiszolgalas-ert-csoport").addClass("hibas-mezo");
            $("#hiba-kiszolgalas-ert").text("Kérlek értékeld a kiszolgálást (1–5)!");
            ervenyes = false;
        }

        if ($("input[name='hangulatErt']:checked").length === 0) {
            $("#hangulat-ert-csoport").addClass("hibas-mezo");
            $("#hiba-hangulat-ert").text("Kérlek értékeld a hangulatot (1–5)!");
            ervenyes = false;
        }

        if ($("input[name='ajanlas']:checked").length === 0) {
            $("#ajanlas-csoport").addClass("hibas-mezo");
            $("#hiba-ajanlas").text("Kérlek jelöld be, hogy ajánlanád-e a kávézót!");
            ervenyes = false;
        }

        if ($("#vel-szoveg").val().trim().length < 10) {
            $("#vel-szoveg").addClass("hibas-mezo");
            $("#hiba-vel-szoveg").text("Kérlek írj legalább 10 karakteres véleményt.");
            ervenyes = false;
        }

        // Sikeres beküldés: új véleménykártya dinamikus létrehozása és beszúrása
        if (ervenyes) {
            const nev = $("#vel-nev").val().trim() || "Névtelen vendég";
            const kave = $("input[name='kaveErt']:checked").val();
            const kisz = $("input[name='kiszolgalasErt']:checked").val();
            const hang = $("input[name='hangulatErt']:checked").val();
            const ajanlas = $("input[name='ajanlas']:checked").val();
            const szoveg = $("#vel-szoveg").val().trim();

            // Összes bejelölt checkbox értékének összegyűjtése
            const tetszettLista = [];
            $("input[name='tetszett']:checked").each(function () {
                tetszettLista.push($(this).val());
            });
            const kedvencSzoveg = tetszettLista.length > 0 ? tetszettLista.join(", ") : "Nincs megadva";

            // Új Bootstrap kártya összeállítása biztonságos .text() beillesztéssel
            const ujKartya = $(`
                <div class="col-md-6">
                    <div class="p-3 bg-white rounded-4 shadow-sm h-100 border border-warning">
                        <div class="d-flex justify-content-between flex-wrap gap-1">
                            <strong></strong>
                            <span class="badge badge-roast"></span>
                        </div>
                        <p class="mt-2 mb-1 text-muted small"></p>
                        <p class="mb-0"></p>
                    </div>
                </div>
            `);
            ujKartya.find("strong").text(nev);
            ujKartya.find(".badge").text("Kávé: " + kave + "/5 • Kiszolgálás: " + kisz + "/5 • Hangulat: " + hang + "/5");
            ujKartya.find("p.small").text("Ajánlás: " + ajanlas + " • Kedvenc: " + kedvencSzoveg);
            ujKartya.find("p.mb-0").text(szoveg);

            $("#velemenyek-lista").prepend(ujKartya.hide().fadeIn(400));
            this.reset();
        }
    });

    $("#velemeny-urlap").on("reset", function () {
        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");
    });
});
