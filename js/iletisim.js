/* ============================================================================
   İLETİŞİM SAYFASI FORM DOĞRULAMA VE ETKİLEŞİM (js/iletisim.js)
   ============================================================================
   İsimlendirme Kuralları:
   - Sabitler (Constants)    : UPPER_CASE
   - Değişkenler (Variables) : snake_case
   - Fonksiyonlar / Metotlar : camelCase
   - Sınıflar (Classes)      : PascalCase
============================================================================ */

const MIN_AD_UZUNLUGU = 3;
const MIN_SIFRE_UZUNLUGU = 6;
const MIN_MESAJ_UZUNLUGU = 15;
const MAX_MESAJ_UZUNLUGU = 500;
const EPOSTA_DESENI = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class IletisimFormYoneticisi {

    constructor() {
        this.form_elemani = document.getElementById("iletisim_formu");
        this.ad_soyad_input = document.getElementById("iletisim_ad_soyad");
        this.eposta_input = document.getElementById("iletisim_eposta");
        this.konu_select = document.getElementById("iletisim_konu");
        this.sifre_input = document.getElementById("iletisim_sifre");
        this.sifre_tekrar_input = document.getElementById("iletisim_sifre_tekrar");
        this.mesaj_textarea = document.getElementById("iletisim_mesaj");
        this.onay_checkbox = document.getElementById("iletisim_onay");

        this.karakter_sayaci = document.getElementById("mesaj_karakter_sayaci");
        this.uyari_kutusu = document.getElementById("iletisim_form_uyari");
        this.toast_kutusu = document.getElementById("iletisim_bildirim_toast");
        this.toast_metin = document.getElementById("iletisim_toast_metin");

        this.sifre_goz_buton = document.getElementById("sifre_goster_btn");
        this.sifre_tekrar_goz_buton = document.getElementById("sifre_tekrar_goster_btn");
        this.temizle_buton = document.getElementById("iletisim_temizle_btn");
    }

    // Tüm olay dinleyicilerini başlatır
    baslat() {
        if (!this.form_elemani) {
            return;
        }

        // Mesaj yazdıkça canlı karakter sayacını güncelle
        this.mesaj_textarea.addEventListener("input", () => {
            this.karakterSayaciniGuncelle();
            if (this.mesaj_textarea.classList.contains("is-invalid")) {
                this.mesajDogrula();
            }
        });

        // Hatalı işaretlenen alanlar kullanıcı düzelttikçe anlık kontrol edilsin
        this.ad_soyad_input.addEventListener("input", () => this.adSoyadDogrula());
        this.eposta_input.addEventListener("input", () => this.epostaDogrula());
        this.konu_select.addEventListener("change", () => this.konuDogrula());
        this.sifre_input.addEventListener("input", () => {
            this.sifreDogrula();
            if (this.sifre_tekrar_input.value.length > 0) {
                this.sifreTekrarDogrula();
            }
        });
        this.sifre_tekrar_input.addEventListener("input", () => this.sifreTekrarDogrula());
        this.onay_checkbox.addEventListener("change", () => this.onayDogrula());

        // Şifre göster/gizle butonları
        this.sifreGorunurluguBagla(this.sifre_goz_buton, this.sifre_input);
        this.sifreGorunurluguBagla(this.sifre_tekrar_goz_buton, this.sifre_tekrar_input);

        // Form gönderme olayı
        this.form_elemani.addEventListener("submit", (olay) => {
            olay.preventDefault(); // Sayfanın yenilenmesini engeller
            this.formuGonder();
        });

        // Temizle butonuna basınca doğrulama renklerini ve sayacı sıfırla
        if (this.temizle_buton) {
            this.temizle_buton.addEventListener("click", () => {
                setTimeout(() => this.formGorunumunuSifirla(), 0);
            });
        }
    }

    // Şifre alanının yanındaki göz butonuna tıklayınca şifreyi gösterir/gizler
    sifreGorunurluguBagla(buton_elemani, input_elemani) {
        if (!buton_elemani || !input_elemani) {
            return;
        }

        buton_elemani.addEventListener("click", () => {
            let acik_mi = input_elemani.type === "text";
            input_elemani.type = acik_mi ? "password" : "text";
            buton_elemani.querySelector("i").className = acik_mi ? "bi bi-eye" : "bi bi-eye-slash";
        });
    }

    // Textarea altındaki 0 / 500 sayacını günceller
    karakterSayaciniGuncelle() {
        let uzunluk = this.mesaj_textarea.value.length;
        this.karakter_sayaci.textContent = `${uzunluk} / ${MAX_MESAJ_UZUNLUGU}`;
    }

    // Bir alana geçerli (yeşil) veya geçersiz (kırmızı) Bootstrap sınıfı uygular
    durumSinifiAyarla(eleman, gecerli_mi, hata_id, hata_mesaji) {
        eleman.classList.toggle("is-valid", gecerli_mi);
        eleman.classList.toggle("is-invalid", !gecerli_mi);

        if (!gecerli_mi && hata_id && hata_mesaji) {
            let hata_alani = document.getElementById(hata_id);
            if (hata_alani) {
                hata_alani.textContent = hata_mesaji;
            }
        }
        return gecerli_mi;
    }

    // 1. Ad Soyad kontrolü (boş alan + uzunluk)
    adSoyadDogrula() {
        let deger = this.ad_soyad_input.value.trim();
        if (deger.length === 0) {
            return this.durumSinifiAyarla(this.ad_soyad_input, false, "hata_ad_soyad", "Ad Soyad alanı boş bırakılamaz.");
        }
        if (deger.length < MIN_AD_UZUNLUGU) {
            return this.durumSinifiAyarla(this.ad_soyad_input, false, "hata_ad_soyad", `Ad Soyad en az ${MIN_AD_UZUNLUGU} karakter olmalıdır.`);
        }
        return this.durumSinifiAyarla(this.ad_soyad_input, true);
    }

    // 2. E-posta kontrolü (boş alan + format)
    epostaDogrula() {
        let deger = this.eposta_input.value.trim();
        if (deger.length === 0) {
            return this.durumSinifiAyarla(this.eposta_input, false, "hata_eposta", "E-posta adresi boş bırakılamaz.");
        }
        if (!EPOSTA_DESENI.test(deger)) {
            return this.durumSinifiAyarla(this.eposta_input, false, "hata_eposta", "Geçerli bir e-posta formatı girin (örn: ad@site.com).");
        }
        return this.durumSinifiAyarla(this.eposta_input, true);
    }

    // 3. Konu seçimi kontrolü
    konuDogrula() {
        let secili_mi = this.konu_select.value !== "";
        return this.durumSinifiAyarla(this.konu_select, secili_mi, "hata_konu", "Lütfen bir konu seçiniz.");
    }

    // 4. Şifre uzunluğu kontrolü
    sifreDogrula() {
        let deger = this.sifre_input.value;
        if (deger.length === 0) {
            return this.durumSinifiAyarla(this.sifre_input, false, "hata_sifre", "Talep takip şifresi boş bırakılamaz.");
        }
        if (deger.length < MIN_SIFRE_UZUNLUGU) {
            return this.durumSinifiAyarla(this.sifre_input, false, "hata_sifre", `Şifre en az ${MIN_SIFRE_UZUNLUGU} karakter olmalıdır.`);
        }
        return this.durumSinifiAyarla(this.sifre_input, true);
    }

    // 5. Şifre tekrarı eşleşme kontrolü
    sifreTekrarDogrula() {
        let ilk_sifre = this.sifre_input.value;
        let tekrar_sifre = this.sifre_tekrar_input.value;

        if (tekrar_sifre.length === 0) {
            return this.durumSinifiAyarla(this.sifre_tekrar_input, false, "hata_sifre_tekrar", "Lütfen şifrenizi tekrar girin.");
        }
        if (ilk_sifre !== tekrar_sifre) {
            return this.durumSinifiAyarla(this.sifre_tekrar_input, false, "hata_sifre_tekrar", "Girdiğiniz şifreler birbiriyle eşleşmiyor.");
        }
        return this.durumSinifiAyarla(this.sifre_tekrar_input, true);
    }

    // 6. Mesaj uzunluğu kontrolü
    mesajDogrula() {
        let deger = this.mesaj_textarea.value.trim();
        if (deger.length === 0) {
            return this.durumSinifiAyarla(this.mesaj_textarea, false, "hata_mesaj", "Mesaj alanı boş bırakılamaz.");
        }
        if (deger.length < MIN_MESAJ_UZUNLUGU) {
            return this.durumSinifiAyarla(this.mesaj_textarea, false, "hata_mesaj", `Mesajınız en az ${MIN_MESAJ_UZUNLUGU} karakter olmalıdır.`);
        }
        return this.durumSinifiAyarla(this.mesaj_textarea, true);
    }

    // 7. Onay kutusu kontrolü
    onayDogrula() {
        return this.durumSinifiAyarla(this.onay_checkbox, this.onay_checkbox.checked, "hata_onay", "Devam etmek için onay kutusunu işaretlemelisiniz.");
    }

    // Form gönderildiğinde tüm alanları sırayla denetler
    formuGonder() {
        let ad_gecerli = this.adSoyadDogrula();
        let eposta_gecerli = this.epostaDogrula();
        let konu_gecerli = this.konuDogrula();
        let sifre_gecerli = this.sifreDogrula();
        let sifre_tekrar_gecerli = this.sifreTekrarDogrula();
        let mesaj_gecerli = this.mesajDogrula();
        let onay_gecerli = this.onayDogrula();

        let tumu_gecerli = ad_gecerli && eposta_gecerli && konu_gecerli &&
            sifre_gecerli && sifre_tekrar_gecerli && mesaj_gecerli && onay_gecerli;

        if (!tumu_gecerli) {
            this.uyariGoster("danger", "Lütfen kırmızı ile işaretlenen eksik veya hatalı alanları düzeltin.");
            // İlk hatalı alana odaklan
            let ilk_hatali = this.form_elemani.querySelector(".is-invalid");
            if (ilk_hatali) {
                ilk_hatali.focus();
            }
            return;
        }

        // Tüm kontroller geçerse başarılı geri bildirim göster (Alert + Toast)
        let kullanici_adi = this.ad_soyad_input.value.trim();
        this.uyariGoster("success", `Teşekkürler ${kullanici_adi}! Mesajınız başarıyla alındı. En kısa sürede e-posta adresinize dönüş yapılacaktır.`);
        this.toastGoster("İletişim formunuz başarıyla gönderildi.");

        // Formu temizle
        this.form_elemani.reset();
        this.formGorunumunuSifirla(false);
    }

    // Formun üstündeki Bootstrap Alert kutusunu günceller
    uyariGoster(tur, mesaj_metni) {
        this.uyari_kutusu.className = `alert alert-${tur} mb-4`;
        this.uyari_kutusu.textContent = mesaj_metni;
    }

    // Sağ alttaki Bootstrap Toast bildirimini gösterir
    toastGoster(mesaj_metni) {
        if (!this.toast_kutusu || !this.toast_metin || typeof bootstrap === "undefined") {
            return;
        }
        this.toast_metin.textContent = mesaj_metni;
        bootstrap.Toast.getOrCreateInstance(this.toast_kutusu, { delay: 4500 }).show();
    }

    // Yeşil/kırmızı doğrulama sınıflarını ve sayacı temizler
    formGorunumunuSifirla(uyariyi_gizle = true) {
        let tum_alanlar = this.form_elemani.querySelectorAll(".is-valid, .is-invalid");
        tum_alanlar.forEach((alan) => {
            alan.classList.remove("is-valid", "is-invalid");
        });

        this.karakterSayaciniGuncelle();

        if (uyariyi_gizle && this.uyari_kutusu) {
            this.uyari_kutusu.className = "alert d-none mb-4";
            this.uyari_kutusu.textContent = "";
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let iletisim_yoneticisi = new IletisimFormYoneticisi();
    iletisim_yoneticisi.baslat();
});
