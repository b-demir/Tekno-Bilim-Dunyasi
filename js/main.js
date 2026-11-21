/* ============================================================================
   SABİTLER (UPPER_CASE)
============================================================================ */
const TEMA_ANAHTARI = "tekno_bilim_tema";
const ACIK_TEMA = "light";
const KOYU_TEMA = "dark";
const KAYDIRMA_ESIGI = 300; // Butonun çıkması için aşağı inilmesi gereken mesafe (px)

/* ============================================================================
   1. FONKSİYON: aramaKutusunuHazirla (camelCase)
   Büyüteç ikonuna tıklandığında solundaki input kutusunu açar/kapatır.
============================================================================ */
function aramaKutusunuHazirla() {
    let arama_butonu = document.getElementById("masaustu_arama_butonu");
    let arama_input = document.getElementById("masaustu_arama_input");

    if (!arama_butonu || !arama_input) {
        return;
    }

    arama_butonu.addEventListener("click", function () {
        // "Acik" sınıfı varsa kaldırır, yoksa ekler
        let acik_mi = arama_input.classList.toggle("Acik");

        // Kutu açıldıysa kullanıcının direkt yazabilmesi için imleci içine odaklar
        if (acik_mi) {
            arama_input.focus();
        }
    });
}

/* ============================================================================
   2. SINIF: TemaYoneticisi (PascalCase)
   Hem masaüstü hem mobil tema butonlarını aynı anda yönetir.
============================================================================ */
class TemaYoneticisi {

    constructor() {
        this.html_etiketi = document.documentElement;
        // Sayfada hem masaüstü hem mobil tema butonu olduğu için tümünü seçiyoruz
        this.tema_butonlari = document.querySelectorAll(".TemaDegistirBtn");
        this.tema_ikonlari = document.querySelectorAll(".TemaIkonu");
    }

    baslat() {
        let kayitli_tema = localStorage.getItem(TEMA_ANAHTARI);
        let aktif_tema = kayitli_tema ? kayitli_tema : ACIK_TEMA;

        this.temayiUygula(aktif_tema);

        this.tema_butonlari.forEach((buton) => {
            buton.addEventListener("click", () => {
                this.temaDegistir();
            });
        });
    }

    temaDegistir() {
        let mevcut_tema = this.html_etiketi.getAttribute("data-bs-theme");
        let yeni_tema = (mevcut_tema === KOYU_TEMA) ? ACIK_TEMA : KOYU_TEMA;

        this.temayiUygula(yeni_tema);
        localStorage.setItem(TEMA_ANAHTARI, yeni_tema);
    }

    temayiUygula(secilen_tema) {
        this.html_etiketi.setAttribute("data-bs-theme", secilen_tema);

        // İkonları güncelle: Koyu temada güneş, açık temada ay ikonu göster
        this.tema_ikonlari.forEach((ikon) => {
            if (secilen_tema === KOYU_TEMA) {
                ikon.className = "bi bi-sun-fill TemaIkonu";
            } else {
                ikon.className = "bi bi-moon-stars-fill TemaIkonu";
            }
        });
    }
}

/* ============================================================================
   3. FONKSİYON: yukariCikButonunuHazirla (camelCase)
   Sayfa aşağı kaydırıldıkça butonu gösterir, tıklanınca en üste çıkarır.
============================================================================ */
function yukariCikButonunuHazirla() {
    let yukari_butonu = document.getElementById("yukari_cik_butonu");

    if (!yukari_butonu) {
        return;
    }

    // Kullanıcı sayfayı her kaydırdığında konumu kontrol et
    window.addEventListener("scroll", function () {
        if (window.scrollY > KAYDIRMA_ESIGI) {
            yukari_butonu.classList.add("Gorunur");
        } else {
            yukari_butonu.classList.remove("Gorunur");
        }
    });

    // Butona basınca sayfanın en tepesine yumuşakça çık
    yukari_butonu.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* ============================================================================
   SAYFA YÜKLENİNCE BAŞLAT
============================================================================ */
document.addEventListener("DOMContentLoaded", function () {
    aramaKutusunuHazirla();

    let tema_yoneticisi = new TemaYoneticisi();
    tema_yoneticisi.baslat();

    document.addEventListener("DOMContentLoaded", function () {
        aramaKutusunuHazirla();
        yukariCikButonunuHazirla();

        let tema_yoneticisi = new TemaYoneticisi();
        tema_yoneticisi.baslat();
    });
});