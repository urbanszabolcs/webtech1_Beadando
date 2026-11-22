$(document).ready(function () {
    // 1. Elemek kiválasztása: tag név, osztály, ID alapján
    $("h1").css("letter-spacing", "0.4px"); // Tag név alapján
    $(".kiemelt-span").attr("title", "Coffee House kiemelt minőség"); // Osztály alapján
    $("#hero-box").attr("data-loaded", "true"); // ID alapján

    // 2. Automatikusan megjelenő Napi Ajánlat a főoldalon
    const napiAjanlatok = [
        { nap: "Vasárnapi ajánlat", szoveg: "Cappuccino + Pisztáciás Sajttorta – 2 590 Ft" },
        { nap: "Hétfői ajánlat", szoveg: "Dupla Espresso + Vajas Croissant – 1 690 Ft" },
        { nap: "Keddi ajánlat", szoveg: "Flat White + Vegán Csokoládés Brownie – 2 450 Ft" },
        { nap: "Szerdai ajánlat", szoveg: "Cold Brew Tonic + Citromos Pite – 2 390 Ft" },
        { nap: "Csütörtöki ajánlat", szoveg: "Cappuccino + Friss Vajas Croissant – 1 950 Ft" },
        { nap: "Pénteki ajánlat", szoveg: "Flat White + Pisztáciás Sajttorta – 2 690 Ft" },
        { nap: "Szombati ajánlat", szoveg: "Cold Brew Tonic + Vegán Brownie – 2 550 Ft" }
    ];

    let aktualisIndex = new Date().getDay();

    if ($("#napi-ajanlat-doboz").length) {
        const mai = napiAjanlatok[aktualisIndex];
        $("#napi-ajanlat-nap").text(mai.nap);
        $("#modositando-szoveg").text(mai.szoveg);
        // Automatikus beúszó megjelenés betöltéskor
        $("#napi-ajanlat-doboz").hide().fadeIn(650);
    }

    // Meglévő HTML elem módosítása (másik napi ajánlat kérése)
    $("#btn-modosit").click(function () {
        aktualisIndex = (aktualisIndex + 1) % napiAjanlatok.length;
        const kovetkezo = napiAjanlatok[aktualisIndex];
        $("#napi-ajanlat-nap").text(kovetkezo.nap);
        $("#modositando-szoveg")
            .fadeOut(150, function () {
                $(this).text(kovetkezo.szoveg).fadeIn(250);
            });
    });

    // Új HTML elem létrehozása (kóstoló jegyzet hozzáadása)
    let jegyzetSzamlalo = 1;
    $("#btn-uj-elem").click(function () {
        const ujElem = $("<div class='alert alert-light text-dark mt-2 mb-0 py-2'></div>")
            .text("Kóstoló jegyzet #" + jegyzetSzamlalo + ": Friss, csokoládés-mogyorós pörkölési profil.");
        $("#dinamikus-kontener").append(ujElem.hide().fadeIn(300));
        jegyzetSzamlalo++;
    });

    // 3. Vendég Kupon QR-kód megjelenítése animációval a főoldalon
    $("#btn-vendeg-kupon").click(function () {
        const doboz = $("#qr-kupon-doboz");
        if (doboz.is(":visible")) {
            doboz.slideUp(350);
            $(this).text("Vendég kupon megjelenítése");
        } else {
            doboz.slideDown(450);
            $(this).text("Vendég kupon elrejtése");
            $("html, body").animate({
                scrollTop: $("#kupon-szekcio").offset().top - 80
            }, 450);
        }
    });

    // 4. Étlap: képek belépő animációja oldalbetöltéskor + kattintásra nagyítás (névvel és árral)
    if ($(".etlap-kartya-elem").length) {
        $(".etlap-kartya-elem").hide().each(function (index) {
            $(this).delay(110 * index).fadeIn(420);
        });
    }

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

    // 5. Galéria képek animációja
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

    // 6. Asztalfoglalás űrlap ellenőrzése (pages/foglalas.html)
    $("#foglalas-urlap").submit(function (e) {
        e.preventDefault();
        let ervenyes = true;

        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");
        $("#sikeres-foglalas").empty();

        if ($("#nev").val().trim().length < 3) {
            $("#nev").addClass("hibas-mezo");
            $("#hiba-nev").text("Kérlek add meg a nevedet (min. 3 karakter).");
            ervenyes = false;
        }

        if ($("#datum").val() === "") {
            $("#datum").addClass("hibas-mezo");
            $("#hiba-datum").text("Kérlek válassz foglalási dátumot.");
            ervenyes = false;
        }

        if ($("input[name='asztalTipus']:checked").length === 0) {
            $("#asztal-csoport").addClass("hibas-mezo p-2 rounded");
            $("#hiba-asztal").text("Kérlek válaszd ki a preferált asztaltípust!");
            ervenyes = false;
        }

        if ($("#megjegyzes").val().trim().length < 5) {
            $("#megjegyzes").addClass("hibas-mezo");
            $("#hiba-megjegyzes").text("Kérlek add meg a létszámot vagy megjegyzést (min. 5 karakter).");
            ervenyes = false;
        }

        if (!$("#elfogad").is(":checked")) {
            $("#elfogad").addClass("hibas-mezo");
            $("#hiba-elfogad").text("A foglalási feltételek elfogadása kötelező.");
            ervenyes = false;
        }

        if (ervenyes) {
            const nev = $("#nev").val().trim();
            const datum = $("#datum").val();
            const asztal = $("input[name='asztalTipus']:checked").val();
            const uzenet = $("<div class='alert alert-success'></div>")
                .text("Köszönjük, " + nev + "! Az asztalfoglalásodat (" + datum + ", " + asztal + ") sikeresen rögzítettük.");
            $("#sikeres-foglalas").append(uzenet).hide().fadeIn(350);
        }
    });

    $("#foglalas-urlap").on("reset", function () {
        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");
        $("#sikeres-foglalas").empty();
    });

    // 7. Vélemény és Értékelés űrlap ellenőrzése (pages/velemeny.html)
    $("#velemeny-urlap").submit(function (e) {
        e.preventDefault();
        let ervenyes = true;

        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");

        if ($("#vel-nev").val().trim().length < 2) {
            $("#vel-nev").addClass("hibas-mezo");
            $("#hiba-vel-nev").text("Kérlek add meg a nevedet vagy becenevedet (min. 2 karakter).");
            ervenyes = false;
        }

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

        if (ervenyes) {
            const nev = $("#vel-nev").val().trim();
            const kave = $("input[name='kaveErt']:checked").val();
            const kisz = $("input[name='kiszolgalasErt']:checked").val();
            const hang = $("input[name='hangulatErt']:checked").val();
            const ajanlas = $("input[name='ajanlas']:checked").val();
            const szoveg = $("#vel-szoveg").val().trim();

            const tetszettLista = [];
            $("input[name='tetszett']:checked").each(function () {
                tetszettLista.push($(this).val());
            });
            const kedvencSzoveg = tetszettLista.length > 0 ? tetszettLista.join(", ") : "Nincs megadva";

            // Új HTML elem létrehozása és beszúrása a vélemények listájába
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
