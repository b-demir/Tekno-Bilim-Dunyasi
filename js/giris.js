/* Giriş formuna özel davranışlar. Gerçek sunucu doğrulaması yapılmaz. */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("girisFormu");
    const eposta = document.getElementById("girisEposta");
    const sifre = document.getElementById("girisSifre");
    const goster = document.getElementById("sifreGosterButon");
    const hatirla = document.getElementById("beniHatirla");
    const toastEl = document.getElementById("girisBildirim");
    const toastText = document.getElementById("girisBildirimMetni");

    // Yalnızca e-posta adresini sakla. Şifreyi asla depolama.
    const kayitliEposta = localStorage.getItem("tbd_hatirlanan_eposta");
    if (kayitliEposta) { eposta.value = kayitliEposta; hatirla.checked = true; }

    goster.addEventListener("click", function () {
        const gorunur = sifre.type === "text";
        sifre.type = gorunur ? "password" : "text";
        goster.setAttribute("aria-pressed", String(!gorunur));
        goster.setAttribute("aria-label", gorunur ? "Şifreyi göster" : "Şifreyi gizle");
        goster.querySelector("i").className = gorunur ? "bi bi-eye" : "bi bi-eye-slash";
    });

    function alaniDenetle(alan) {
        let gecerli = alan.checkValidity();
        if (alan === eposta) {
            const hata = document.getElementById("epostaHata");
            hata.textContent = alan.validity.valueMissing
                ? "E-posta adresini gir."
                : "Geçerli bir e-posta adresi gir.";
        }
        if (alan === sifre) {
            const hata = document.getElementById("sifreHata");
            hata.textContent = alan.validity.valueMissing
                ? "Şifreni gir."
                : "Şifre en az 6 karakter olmalıdır.";
        }
        alan.classList.toggle("is-invalid", !gecerli);
        alan.classList.toggle("is-valid", gecerli);
        return gecerli;
    }

    [eposta, sifre].forEach(alan => {
        alan.addEventListener("input", () => {
            if (alan.classList.contains("is-invalid") || alan.classList.contains("is-valid")) alaniDenetle(alan);
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const epostaGecerli = alaniDenetle(eposta);
        const sifreGecerli = alaniDenetle(sifre);
        if (!epostaGecerli || !sifreGecerli) {
            (epostaGecerli ? sifre : eposta).focus();
            return;
        }
        if (hatirla.checked) localStorage.setItem("tbd_hatirlanan_eposta", eposta.value.trim());
        else localStorage.removeItem("tbd_hatirlanan_eposta");
        toastText.textContent = "Form bilgileri geçerli. Bu ödevde gerçek hesap doğrulaması ve oturum açma yapılmaz.";
        bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 }).show();
    });

    hatirla.addEventListener("change", function () {
        if (!hatirla.checked) localStorage.removeItem("tbd_hatirlanan_eposta");
    });
});
