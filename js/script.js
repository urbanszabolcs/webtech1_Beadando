$(document).ready(function () {
    // 1. Elemek kiválasztása: tag név, osztály, ID alapján
    $("h1").css("letter-spacing", "0.5px"); // Tag név alapján
    $(".kiemelt-span").attr("title", "Coffee House kiemelt elem"); // Osztály alapján
    $("#hero-box").attr("data-loaded", "true"); // ID alapján

    // 2. Meglévő HTML elem módosítása (Főoldal)
    $("#btn-modosit").click(function () {
        $("#modositando-szoveg")
            .text("Frissített napi ajánlat: Flat White + Pisztáciás Sajttorta – 2 490 Ft!")
            .css("color", "#4e342e")
            .css("font-weight", "bold");
    });

    // 3. Új HTML elem létrehozása (Főoldal)
    let jegyzetSzamlalo = 1;
    $("#btn-uj-elem").click(function () {
        let ujElem = $("<div class='alert alert-secondary mt-2 mb-0'></div>")
            .text("Kóstoló jegyzet #" + jegyzetSzamlalo + ": Friss, gyümölcsös pörkölés (dinamikus elem).");
        $("#dinamikus-kontener").append(ujElem);
        jegyzetSzamlalo++;
    });

    // 4. Animáció (Főoldal kupon doboz)
    $("#btn-animacio").click(function () {
        $("#animalt-doboz")
            .animate({ opacity: 0.45, marginLeft: "40px" }, 450)
            .animate({ opacity: 1, marginLeft: "0px" }, 450);
    });

    // 5. Galéria képek jQuery animációja
    $("#btn-galeria-anim").click(function () {
        $(".galeria-elem").hide().each(function (index) {
            $(this).delay(120 * index).fadeIn(400);
        });
    });

    // 6. Asztalfoglalási és értékelési űrlap ellenőrzése
    $("#foglalas-urlap").submit(function (e) {
        e.preventDefault();
        let ervenyes = true;

        // Előző hibák törlése
        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");
        $("#sikeres-visszajelzes").empty();

        // Név ellenőrzés
        if ($("#nev").val().trim().length < 3) {
            $("#nev").addClass("hibas-mezo");
            $("#hiba-nev").text("Kérlek add meg a nevedet (minimum 3 karakter).");
            ervenyes = false;
        }

        // Dátum ellenőrzés
        if ($("#datum").val() === "") {
            $("#datum").addClass("hibas-mezo");
            $("#hiba-datum").text("Kérlek válaszd ki a foglalás dátumát.");
            ervenyes = false;
        }

        // Megjegyzés ellenőrzés
        if ($("#megjegyzes").val().trim().length < 5) {
            $("#megjegyzes").addClass("hibas-mezo");
            $("#hiba-megjegyzes").text("Kérlek írj rövid megjegyzést vagy létszámot (min. 5 karakter).");
            ervenyes = false;
        }

        // Értékelés (radio gomb) ellenőrzés
        if ($("input[name='ertekeles']:checked").length === 0) {
            $("#ertekeles-csoport").addClass("hibas-mezo p-2 rounded");
            $("#hiba-ertekeles").text("Kérlek válassz egy értékelést (1–5 csillag)!");
            ervenyes = false;
        }

        // Checkbox ellenőrzés
        if (!$("#elfogad").is(":checked")) {
            $("#elfogad").addClass("hibas-mezo");
            $("#hiba-elfogad").text("A foglalási feltételek elfogadása kötelező.");
            ervenyes = false;
        }

        if (ervenyes) {
            let vendegNev = $("#nev").val().trim();
            let ertekeles = $("input[name='ertekeles']:checked").val();
            let uzenet = $("<div class='alert alert-success'></div>")
                .text("Köszönjük, " + vendegNev + "! Az asztalfoglalásod rögzítettük, és köszönjük a(z) " + ertekeles + " csillagos értékelést!");
            $("#sikeres-visszajelzes").append(uzenet).hide().fadeIn(400);
        }
    });

    // Alaphelyzet gombnál a hibajelzések törlése
    $("#foglalas-urlap").on("reset", function () {
        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");
        $("#sikeres-visszajelzes").empty();
    });
});
