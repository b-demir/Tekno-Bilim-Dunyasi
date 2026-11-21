// İletişim sayfasındaki form doğrulama, karakter sayacı, şifre göster/gizle ve bildirim işlemleri

// Doğrulama kurallarında kullandığımız sabit sınırlar ve e-posta format kontrolü
const MIN_AD_UZUNLUGU = 3; // ad soyad en az 3 karakter olmalı
const MIN_SIFRE_UZUNLUGU = 6; // takip şifresi en az 6 karakter olmalı
const MIN_MESAJ_UZUNLUGU = 15; // mesaj kutusuna en az 15 karakter yazılmalı
const MAX_MESAJ_UZUNLUGU = 500; // mesaj kutusunun maksimum karakter sınırı (sayaç için)
const EPOSTA_DESENI = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basit e-posta kontrolü: ad@domain.uzanti şeklinde olmalı

// İletişim formunun tüm elementlerini, doğrulama kurallarını ve buton olaylarını tek yerde yöneten sınıf
class IletisimFormYoneticisi {

    // Sayfadaki gerekli HTML elementlerini id üzerinden bulup sınıf özelliklerine kaydediyoruz
    constructor() {
        this.form_elemani = document.getElementById("iletisim_formu"); // ana form etiketi
        this.ad_soyad_input = document.getElementById("iletisim_ad_soyad"); // ad soyad metin kutusu
        this.eposta_input = document.getElementById("iletisim_eposta"); // e-posta kutusu
        this.konu_select = document.getElementById("iletisim_konu"); // konu açılır listesi
        this.sifre_input = document.getElementById("iletisim_sifre"); // talep takip şifresi kutusu
        this.sifre_tekrar_input = document.getElementById("iletisim_sifre_tekrar"); // şifre tekrarı kutusu
        this.mesaj_textarea = document.getElementById("iletisim_mesaj"); // çok satırlı mesaj alanı
        this.onay_checkbox = document.getElementById("iletisim_onay"); // iletişim onay kutusu

        this.karakter_sayaci = document.getElementById("mesaj_karakter_sayaci"); // "0 / 500" yazan sayaç alanı
        this.uyari_kutusu = document.getElementById("iletisim_form_uyari"); // form üstündeki Bootstrap alert kutusu
        this.toast_kutusu = document.getElementById("iletisim_bildirim_toast"); // sağ alttaki Bootstrap toast kutusu
        this.toast_metin = document.getElementById("iletisim_toast_metin"); // toast içindeki yazı alanı

        this.sifre_goz_buton = document.getElementById("sifre_goster_btn"); // şifre kutusunun yanındaki göz butonu
        this.sifre_tekrar_goz_buton = document.getElementById("sifre_tekrar_goster_btn"); // tekrar kutusunun yanındaki göz butonu
        this.temizle_buton = document.getElementById("iletisim_temizle_btn"); // formu sıfırlayan Temizle butonu
    }

    // Formdaki tüm olay dinleyicilerini (input, change, click, submit) bağlayıp sistemi çalışır hale getirir
    baslat() {
        // Form sayfada yoksa hata vermemek için direkt çıkıyoruz
        if (!this.form_elemani) {
            return;
        }

        // Mesaj yazıldıkça canlı karakter sayacını güncelliyoruz
        this.mesaj_textarea.addEventListener("input", () => {
            this.karakterSayaciniGuncelle();
            // Eğer mesaj alanı önceden kırmızı (hatalı) işaretlendiyse kullanıcı düzeltirken anlık tekrar kontrol et
            if (this.mesaj_textarea.classList.contains("is-invalid")) {
                this.mesajDogrula();
            }
        });

        // Diğer alanlarda da kullanıcı yazı yazdıkça veya seçim yaptıkça anlık doğrulama çalıştırıyoruz
        this.ad_soyad_input.addEventListener("input", () => this.adSoyadDogrula());
        this.eposta_input.addEventListener("input", () => this.epostaDogrula());
        this.konu_select.addEventListener("change", () => this.konuDogrula());
        this.sifre_input.addEventListener("input", () => {
            this.sifreDogrula();
            // Şifre tekrar kutusu zaten doluysa, ilk şifre değişince eşleşme bozulmuş olabilir diye onu da tekrar kontrol et
            if (this.sifre_tekrar_input.value.length > 0) {
                this.sifreTekrarDogrula();
            }
        });
        this.sifre_tekrar_input.addEventListener("input", () => this.sifreTekrarDogrula());
        this.onay_checkbox.addEventListener("change", () => this.onayDogrula());

        // İki şifre kutusu için de yanındaki göz butonuna göster/gizle özelliğini bağlıyoruz
        this.sifreGorunurluguBagla(this.sifre_goz_buton, this.sifre_input);
        this.sifreGorunurluguBagla(this.sifre_tekrar_goz_buton, this.sifre_tekrar_input);

        // Form gönderilmek istendiğinde sayfa yenilemeyi durdurup kendi kontrolümüzü çalıştırıyoruz
        this.form_elemani.addEventListener("submit", (olay) => {
            olay.preventDefault(); // formun sayfayı yenilemesini engeller
            this.formuGonder();
        });

        // Temizle butonuna basınca önce tarayıcının formu sıfırlamasını bekleyip hemen ardından renkleri ve sayacı sıfırlıyoruz
        if (this.temizle_buton) {
            this.temizle_buton.addEventListener("click", () => {
                // setTimeout(..., 0) ile reset işlemi bittikten hemen sonra çalıştırıyoruz ki sayaç doğru (0 / 500) olsun
                setTimeout(() => this.formGorunumunuSifirla(), 0);
            });
        }
    }

    // Verilen göz butonuna tıklandığında ilgili şifre kutusunu görünür/gizli yapıp ikonu günceller
    sifreGorunurluguBagla(buton_elemani, input_elemani) {
        // Buton veya input eksikse hiçbir şey yapmadan dön
        if (!buton_elemani || !input_elemani) {
            return;
        }

        // Tıklanınca type değerini "text" ile "password" arasında değiştiriyoruz
        buton_elemani.addEventListener("click", () => {
            let acik_mi = input_elemani.type === "text";
            input_elemani.type = acik_mi ? "password" : "text";
            // Açıksa tekrar gizlemek için normal göz, kapalıysa üstü çizili göz ikonuna çeviriyoruz
            buton_elemani.querySelector("i").className = acik_mi ? "bi bi-eye" : "bi bi-eye-slash";
        });
    }

    // Mesaj kutusundaki mevcut karakter sayısını alıp "x / 500" şeklinde yazdırır
    karakterSayaciniGuncelle() {
        let uzunluk = this.mesaj_textarea.value.length;
        this.karakter_sayaci.textContent = `${uzunluk} / ${MAX_MESAJ_UZUNLUGU}`;
    }

    // Bir form alanına geçerlilik durumuna göre yeşil (is-valid) veya kırmızı (is-invalid) sınıfı verip hata yazısını günceller; sonucu geri döndürür
    durumSinifiAyarla(eleman, gecerli_mi, hata_id, hata_mesaji) {
        // Geçerliyse is-valid eklenir, geçersizse is-invalid eklenir
        eleman.classList.toggle("is-valid", gecerli_mi);
        eleman.classList.toggle("is-invalid", !gecerli_mi);

        // Alan hatalıysa ve hata kutusu bilgisi verilmişse altındaki .invalid-feedback metnini güncelliyoruz
        if (!gecerli_mi && hata_id && hata_mesaji) {
            let hata_alani = document.getElementById(hata_id);
            if (hata_alani) {
                hata_alani.textContent = hata_mesaji;
            }
        }
        return gecerli_mi;
    }

    // 1. Ad Soyad alanını kontrol eder (boşlukları kırpıp boş mu ve en az 3 karakter mi diye bakar)
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

    // 2. E-posta alanının boş olup olmadığını ve regex desenine uyup uymadığını kontrol eder
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

    // 3. Konu select kutusunda geçerli bir seçenek seçilmiş mi kontrol eder
    konuDogrula() {
        let secili_mi = this.konu_select.value !== "";
        return this.durumSinifiAyarla(this.konu_select, secili_mi, "hata_konu", "Lütfen bir konu seçiniz.");
    }

    // 4. Talep takip şifresinin boş olmamasını ve en az 6 karakter olmasını kontrol eder (şifrede boşluk olabilir diye trim yapmıyoruz)
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

    // 5. İkinci şifre kutusunun boş olmamasını ve ilk şifreyle birebir aynı olmasını kontrol eder
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

    // 6. Mesaj kutusunun boş olmamasını ve en az 15 karakter yazılmış olmasını kontrol eder
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

    // 7. İletişim onay kutusunun işaretlenip işaretlenmediğini kontrol eder
    onayDogrula() {
        return this.durumSinifiAyarla(this.onay_checkbox, this.onay_checkbox.checked, "hata_onay", "Devam etmek için onay kutusunu işaretlemelisiniz.");
    }

    // Form gönderildiğinde tüm alanları kontrol eder; hata varsa uyarır, hepsi doğruysa başarı mesajı gösterip formu temizler
    formuGonder() {
        // && kısa devresi yüzünden bazı alanlar kontrol edilmeden kalmasın diye önce hepsini ayrı ayrı çalıştırıp sonuçlarını saklıyoruz
        let ad_gecerli = this.adSoyadDogrula();
        let eposta_gecerli = this.epostaDogrula();
        let konu_gecerli = this.konuDogrula();
        let sifre_gecerli = this.sifreDogrula();
        let sifre_tekrar_gecerli = this.sifreTekrarDogrula();
        let mesaj_gecerli = this.mesajDogrula();
        let onay_gecerli = this.onayDogrula();

        // Bütün alanların geçerli olup olmadığını tek değişkende topluyoruz
        let tumu_gecerli = ad_gecerli && eposta_gecerli && konu_gecerli &&
            sifre_gecerli && sifre_tekrar_gecerli && mesaj_gecerli && onay_gecerli;

        // Eğer en az bir alan hatalıysa uyarı kutusunu açıp imleci ilk hatalı kutuya gönderiyoruz
        if (!tumu_gecerli) {
            this.uyariGoster("danger", "Lütfen kırmızı ile işaretlenen eksik veya hatalı alanları düzeltin.");
            // Hatalı olan ilk elementi bulup odaklanıyoruz
            let ilk_hatali = this.form_elemani.querySelector(".is-invalid");
            if (ilk_hatali) {
                ilk_hatali.focus();
            }
            return;
        }

        // Tüm alanlar doğru doldurulduysa kullanıcının adını alıp kişiselleştirilmiş başarı mesajı ve toast bildirimi gösteriyoruz
        let kullanici_adi = this.ad_soyad_input.value.trim();
        this.uyariGoster("success", `Teşekkürler ${kullanici_adi}! Mesajınız başarıyla alındı. En kısa sürede e-posta adresinize dönüş yapılacaktır.`);
        this.toastGoster("İletişim formunuz başarıyla gönderildi.");

        // Formdaki inputları boşaltıp yeşil doğrulama çerçevelerini kaldırıyoruz (false veriyoruz ki başarı mesajı ekranda kalsın)
        this.form_elemani.reset();
        this.formGorunumunuSifirla(false);
    }

    // Formun üstündeki Bootstrap Alert kutusunu istenen tür ("success" veya "danger") ve metinle görünür yapar
    uyariGoster(tur, mesaj_metni) {
        this.uyari_kutusu.className = `alert alert-${tur} mb-4`;
        this.uyari_kutusu.textContent = mesaj_metni;
    }

    // Sağ alttaki Bootstrap Toast bildirimini verilen mesajla 4.5 saniyeliğine ekrana çıkarır
    toastGoster(mesaj_metni) {
        // Gerekli HTML elementleri veya Bootstrap JS yüklenmemişse hata vermeden çık
        if (!this.toast_kutusu || !this.toast_metin || typeof bootstrap === "undefined") {
            return;
        }
        this.toast_metin.textContent = mesaj_metni;
        bootstrap.Toast.getOrCreateInstance(this.toast_kutusu, { delay: 4500 }).show();
    }

    // Formdaki tüm yeşil/kırmızı sınıfları ve karakter sayacını temizler; uyariyi_gizle true ise üstteki alert kutusunu da saklar
    formGorunumunuSifirla(uyariyi_gizle = true) {
        // Üzerinde is-valid veya is-invalid sınıfı kalmış bütün form elemanlarını topluyoruz
        let tum_alanlar = this.form_elemani.querySelectorAll(".is-valid, .is-invalid");
        tum_alanlar.forEach((alan) => {
            alan.classList.remove("is-valid", "is-invalid");
        });

        // Mesaj boşaldığı için sayacı 0 / 500 olarak güncelliyoruz
        this.karakterSayaciniGuncelle();

        // Eğer Temizle butonuna basılmışsa başarı/hata uyarı kutusunu da tekrar d-none ile gizliyoruz
        if (uyariyi_gizle && this.uyari_kutusu) {
            this.uyari_kutusu.className = "alert d-none mb-4";
            this.uyari_kutusu.textContent = "";
        }
    }
}

// HTML belgesi tamamen yüklendiğinde IletisimFormYoneticisi sınıfından bir nesne üretip başlatıyoruz
document.addEventListener("DOMContentLoaded", function () {
    let iletisim_yoneticisi = new IletisimFormYoneticisi();
    iletisim_yoneticisi.baslat();
});