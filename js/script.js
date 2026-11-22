$(document).ready(function () {
    // 1. Elemek kiválasztása: tag név, osztály, ID alapján
    $("h1").css("letter-spacing", "0.5px"); // Tag név alapján
    $(".kiemelt-span").attr("title", "Osztály alapján kiválasztott elem"); // Osztály alapján
    $("#hero-box").attr("data-loaded", "true"); // ID alapján

    // 2. Meglévő HTML elem módosítása
    $("#btn-modosit").click(function () {
        $("#modositando-szoveg")
            .text("A szöveg sikeresen módosult jQuery segítségével!")
            .css("color", "#0d6efd")
            .css("font-weight", "bold");
    });

    // 3. Új HTML elem létrehozása
    let szamlalo = 1;
    $("#btn-uj-elem").click(function () {
        let ujElem = $("<div class='alert alert-secondary mt-2'></div>")
            .text("Dinamikusan létrehozott placeholder elem #" + szamlalo);
        $("#dinamikus-kontener").append(ujElem);
        szamlalo++;
    });

    // 4. Animáció
    $("#btn-animacio").click(function () {
        $("#animalt-doboz")
            .animate({ opacity: 0.4, marginLeft: "40px" }, 500)
            .animate({ opacity: 1, marginLeft: "0px" }, 500);
    });

    // 5. Űrlap ellenőrzés
    $("#kapcsolat-urlap").submit(function (e) {
        let ervenyes = true;

        // Előző hibák törlése
        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");

        // Név ellenőrzés
        if ($("#nev").val().trim().length < 3) {
            $("#nev").addClass("hibas-mezo");
            $("#hiba-nev").text("A név megadása kötelező (min. 3 karakter).");
            ervenyes = false;
        }

        // Üzenet ellenőrzés
        if ($("#uzenet").val().trim().length < 10) {
            $("#uzenet").addClass("hibas-mezo");
            $("#hiba-uzenet").text("Az üzenet legalább 10 karakter legyen.");
            ervenyes = false;
        }

        // Dátum ellenőrzés
        if ($("#datum").val() === "") {
            $("#datum").addClass("hibas-mezo");
            $("#hiba-datum").text("Kérlek válassz egy dátumot.");
            ervenyes = false;
        }

        // Radio gomb ellenőrzés
        if ($("input[name='opcio']:checked").length === 0) {
            $("#radio-csoport").addClass("hibas-mezo p-2 rounded");
            $("#hiba-radio").text("Válassz egy opciót!");
            ervenyes = false;
        }

        // Checkbox ellenőrzés
        if (!$("#elfogad").is(":checked")) {
            $("#elfogad").addClass("hibas-mezo");
            $("#hiba-elfogad").text("A feltételek elfogadása kötelező.");
            ervenyes = false;
        }

        if (!ervenyes) {
            e.preventDefault();
        } else {
            e.preventDefault(); // Demo célból ne töltse újra az oldalt
            alert("Az űrlap minden mezője érvényes!");
        }
    });

    // Alaphelyzet gombnál a hibajelzések törlése
    $("#kapcsolat-urlap").on("reset", function () {
        $(".hibas-mezo").removeClass("hibas-mezo");
        $(".hiba-uzenet").text("");
    });
});
