// Tüm sayfalarda ortak çalışan JS kodları (arama kutusu, açık/koyu tema yönetimi ve yukarı çık butonu)

// Sabit değerler: localStorage anahtarı, tema isimleri ve yukarı çık butonunun görünme sınırı
const TEMA_ANAHTARI = "tekno_bilim_tema"; // kullanıcının seçtiği temayı tarayıcı hafızasında tuttuğumuz anahtar
const ACIK_TEMA = "light"; // açık tema değeri (Bootstrap data-bs-theme için)
const KOYU_TEMA = "dark"; // koyu tema değeri (Bootstrap data-bs-theme için)
const KAYDIRMA_ESIGI = 300; // sayfa kaç piksel aşağı kayınca yukarı çık butonunun görüneceği (px)

// Büyüteç ikonuna basınca sol tarafındaki masaüstü arama kutusunu açıp kapatır
function aramaKutusunuHazirla() {
    // HTML'den masaüstü büyüteç butonunu ve gizli arama inputunu seçiyoruz
    let arama_butonu = document.getElementById("masaustu_arama_butonu");
    let arama_input = document.getElementById("masaustu_arama_input");

    // Eğer sayfada bu elemanlardan biri yoksa hata vermeden fonksiyondan çıkıyoruz
    if (!arama_butonu || !arama_input) {
        return;
    }

    // Büyüteç butonuna tıklama olayı ekliyoruz
    arama_butonu.addEventListener("click", function () {
        // toggle ile "Acik" sınıfı varsa siler yoksa ekler, sonucunu da boolean olarak acik_mi'ye alırız
        let acik_mi = arama_input.classList.toggle("Acik");

        // Arama kutusu açıldıysa kullanıcı tekrar tıklamak zorunda kalmasın diye imleci içine odaklıyoruz
        if (acik_mi) {
            arama_input.focus();
        }
    });
}

// Açık / koyu tema geçişini, ikon değişimini ve seçimin localStorage'a kaydedilmesini yöneten sınıf
class TemaYoneticisi {

    // Nesne oluşturulduğunda html etiketini, tüm tema butonlarını ve ikonlarını seçip saklar
    constructor() {
        this.html_etiketi = document.documentElement; // <html> etiketine data-bs-theme yazmak için
        // Sayfada hem masaüstü hem de mobil görünüm için ayrı tema butonu olduğundan querySelectorAll kullandık
        this.tema_butonlari = document.querySelectorAll(".TemaDegistirBtn");
        this.tema_ikonlari = document.querySelectorAll(".TemaIkonu");
    }

    // Kayıtlı temayı yükleyip uygular ve tüm tema butonlarına tıklama olayı bağlar
    baslat() {
        // Tarayıcı daha önce bir tema kaydetmiş mi diye localStorage'dan okuyoruz
        let kayitli_tema = localStorage.getItem(TEMA_ANAHTARI);
        // Kayıtlı tema varsa onu kullan, ilk kez giriyorsa varsayılan olarak açık temayı seç
        let aktif_tema = kayitli_tema ? kayitli_tema : ACIK_TEMA;

        // Seçilen temayı sayfaya uygula
        this.temayiUygula(aktif_tema);

        // Bulunan tüm tema butonları (masaüstü + mobil) için tıklama dinleyicisi ekliyoruz
        this.tema_butonlari.forEach((buton) => {
            buton.addEventListener("click", () => {
                this.temaDegistir();
            });
        });
    }

    // Mevcut temanın tersine geçiş yapar ve yeni seçimi localStorage'a kaydeder
    temaDegistir() {
        // Şu an html etiketinde hangi tema aktif diye bakıyoruz
        let mevcut_tema = this.html_etiketi.getAttribute("data-bs-theme");
        // Koyuysa açık, açıksa koyu temaya çeviriyoruz
        let yeni_tema = (mevcut_tema === KOYU_TEMA) ? ACIK_TEMA : KOYU_TEMA;

        // Yeni temayı sayfaya ve ikonlara uygula
        this.temayiUygula(yeni_tema);
        // Sayfa yenilenince de hatırlansın diye tarayıcıya kaydet
        localStorage.setItem(TEMA_ANAHTARI, yeni_tema);
    }

    // Verilen tema adını (light veya dark) html etiketine yazar ve butonlardaki güneş/ay ikonunu günceller
    temayiUygula(secilen_tema) {
        // Bootstrap'in tema sisteminin çalışması için <html data-bs-theme="..."> özniteliğini değiştiriyoruz
        this.html_etiketi.setAttribute("data-bs-theme", secilen_tema);

        // Koyu moddayken geçilebilecek seçenek olarak güneş ikonu, açık moddayken ay ikonu gösteriyoruz
        this.tema_ikonlari.forEach((ikon) => {
            if (secilen_tema === KOYU_TEMA) {
                ikon.className = "bi bi-sun-fill TemaIkonu";
            } else {
                ikon.className = "bi bi-moon-stars-fill TemaIkonu";
            }
        });
    }
}

// Sayfa aşağı kaydırıldığında sağ alttaki "Yukarı Çık" butonunu gösterir ve tıklanınca en üste kaydırır
function yukariCikButonunuHazirla() {
    // HTML'deki yukarı çık butonunu id ile alıyoruz
    let yukari_butonu = document.getElementById("yukari_cik_butonu");

    // Sayfada bu buton yoksa devam etmeyip çıkıyoruz
    if (!yukari_butonu) {
        return;
    }

    // Kullanıcı sayfayı her kaydırdığında dikey kaydırma miktarını kontrol ediyoruz
    window.addEventListener("scroll", function () {
        // Belirlediğimiz eşik (300px) geçildiyse CSS'te tanımladığımız "Gorunur" sınıfını ekliyoruz
        if (window.scrollY > KAYDIRMA_ESIGI) {
            yukari_butonu.classList.add("Gorunur");
        } else {
            yukari_butonu.classList.remove("Gorunur");
        }
    });

    // Butona tıklanınca sayfanın en tepesine (top: 0) yumuşak animasyonla çıkıyoruz
    yukari_butonu.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// Sayfadaki tüm HTML etiketleri yüklendikten sonra ortak bileşenleri başlatıyoruz
document.addEventListener("DOMContentLoaded", function () {
    aramaKutusunuHazirla(); // masaüstü arama kutusu aç/kapat
    yukariCikButonunuHazirla(); // sağ alttaki yukarı çık butonu

    // Tema yöneticisinden bir nesne oluşturup başlatıyoruz
    let tema_yoneticisi = new TemaYoneticisi();
    tema_yoneticisi.baslat();
});