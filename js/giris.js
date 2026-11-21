// Giriş sayfasındaki form doğrulama, şifre göster/gizle ve e-posta hatırlama işlemleri (gerçek sunucu girişi yok)
document.addEventListener("DOMContentLoaded", function () {
    // HTML'deki form, inputlar, butonlar ve bildirim kutusu elemanlarını id ile seçiyoruz
    const form = document.getElementById("girisFormu"); // giriş formunun kendisi
    const eposta = document.getElementById("girisEposta"); // e-posta input kutusu
    const sifre = document.getElementById("girisSifre"); // şifre input kutusu
    const goster = document.getElementById("sifreGosterButon"); // şifrenin yanındaki göz butonu
    const hatirla = document.getElementById("beniHatirla"); // "E-postamı hatırla" onay kutusu
    const toastEl = document.getElementById("girisBildirim"); // sağ altta çıkacak Bootstrap toast kutusu
    const toastText = document.getElementById("girisBildirimMetni"); // toast içindeki mesaj yazısı alanı

    // Güvenlik için sadece e-posta adresini localStorage'da tutuyoruz, şifreyi kesinlikle kaydetmiyoruz
    const kayitliEposta = localStorage.getItem("tbd_hatirlanan_eposta");
    // Eğer daha önceden kayıtlı e-posta varsa kutuyu otomatik doldurup onay kutusunu işaretliyoruz
    if (kayitliEposta) { eposta.value = kayitliEposta; hatirla.checked = true; }

    // Göz butonuna basınca şifreyi açık metin ve yıldızlı şifre modu arasında çeviriyoruz
    goster.addEventListener("click", function () {
        // Şu an type="text" ise şifre görünür durumda demektir
        const gorunur = sifre.type === "text";
        // Görünürse tekrar password yapıp gizle, gizliyse text yapıp göster
        sifre.type = gorunur ? "password" : "text";
        // Ekran okuyucular için butonun basılı durumunu ve açıklamasını güncelliyoruz
        goster.setAttribute("aria-pressed", String(!gorunur));
        goster.setAttribute("aria-label", gorunur ? "Şifreyi göster" : "Şifreyi gizle");
        // Butonun içindeki ikonu açık göz veya üstü çizili göz olarak değiştiriyoruz
        goster.querySelector("i").className = gorunur ? "bi bi-eye" : "bi bi-eye-slash";
    });

    // Verilen form alanını HTML5 kurallarına göre kontrol eder, Bootstrap is-valid/is-invalid sınıflarını ve hata mesajını ayarlar
    function alaniDenetle(alan) {
        // Tarayıcının yerleşik checkValidity() metoduyla required, type="email" ve minlength gibi kuralları test ediyoruz
        let gecerli = alan.checkValidity();
        // Kontrol edilen alan e-posta kutusuysa, boş mu yoksa formatı mı bozuk diye bakıp uygun hata mesajını yazıyoruz
        if (alan === eposta) {
            const hata = document.getElementById("epostaHata");
            hata.textContent = alan.validity.valueMissing
                ? "E-posta adresini gir."
                : "Geçerli bir e-posta adresi gir.";
        }
        // Kontrol edilen alan şifre kutusuysa boş mu yoksa 6 karakterden kısa mı diye mesajı güncelliyoruz
        if (alan === sifre) {
            const hata = document.getElementById("sifreHata");
            hata.textContent = alan.validity.valueMissing
                ? "Şifreni gir."
                : "Şifre en az 6 karakter olmalıdır.";
        }
        // Geçersizse kırmızı (is-invalid), geçerliyse yeşil (is-valid) Bootstrap sınıfını açıp kapatıyoruz
        alan.classList.toggle("is-invalid", !gecerli);
        alan.classList.toggle("is-valid", gecerli);
        // Sonucu form gönderme adımında kullanmak için geri döndürüyoruz
        return gecerli;
    }

    // E-posta veya şifre alanı bir kez denetlenmişse, kullanıcı yazı yazdıkça anlık olarak tekrar kontrol ediyoruz
    [eposta, sifre].forEach(alan => {
        alan.addEventListener("input", () => {
            // İlk yazmaya başlarken hemen kırmızı göstermemek için sadece önceden sınıf almış alanları anlık günceller
            if (alan.classList.contains("is-invalid") || alan.classList.contains("is-valid")) alaniDenetle(alan);
        });
    });

    // Giriş formu gönderilmeye çalışıldığında çalışır
    form.addEventListener("submit", function (event) {
        // Formun sayfayı yenileyip sunucuya göndermesini engelliyoruz
        event.preventDefault();
        // İki alanı da ayrı ayrı denetliyoruz
        const epostaGecerli = alaniDenetle(eposta);
        const sifreGecerli = alaniDenetle(sifre);
        // Herhangi biri geçersizse ilk hatalı kutuya odaklanıp işlemi durduruyoruz
        if (!epostaGecerli || !sifreGecerli) {
            (epostaGecerli ? sifre : eposta).focus();
            return;
        }
        // "E-postamı hatırla" işaretliyse e-postayı boşlukları kırparak kaydet, değilse eski kaydı sil
        if (hatirla.checked) localStorage.setItem("tbd_hatirlanan_eposta", eposta.value.trim());
        else localStorage.removeItem("tbd_hatirlanan_eposta");
        // Bildirim metnini yazıp Bootstrap Toast bileşeniyle 5 saniyeliğine ekranda gösteriyoruz
        toastText.textContent = "Form bilgileri geçerli. Bu ödevde gerçek hesap doğrulaması ve oturum açma yapılmaz.";
        bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 }).show();
    });

    // Kullanıcı "E-postamı hatırla" kutusunun işaretini kaldırırsa kayıtlı e-postayı hemen tarayıcıdan temizliyoruz
    hatirla.addEventListener("change", function () {
        if (!hatirla.checked) localStorage.removeItem("tbd_hatirlanan_eposta");
    });
});