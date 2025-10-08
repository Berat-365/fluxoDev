# 📑 Changelog

Bu dosya projede yapılan tüm önemli değişiklikleri takip eder.  
Sürüm numaraları: Fluxo 4 (Part 9'den Part 15'e)

---

## [Unreleased]
- Yeni **Araçlar** eklenecek (Saat, Borsa araçları...)
- Telefonlar için yeni arayüz
- Hesaplar için **Google** desteği
- Hesaplar için yenilikler

---

## [Fluxo 4 Part 15] - 2025-10-08
### Eklendi (Added)
- Duvar kağıdını kaldırma eklendi
- Destek sekmesine sosyal linkler eklendi
- Sistem geneli ikonlu yapı geliştirildi
- Ayarlarda navigasyon barına ikonlar getirildi, arama kısayollarına ikonlar eklendi (ayarlardan düzenlenebilir)
- İkonlar yenilendi
- Temalar düzeltildi (Kutu, Neomorphism, Vanilla)

## ⚠️ Önemli Uyarı
Çeviriler eksik ve yanlış olabilir

### Düzenlendi (Fixed)
- Türkçe harflerin hesap oluşturmada kullanılamaması hatası giderildi
- Hava Durumu Güncelleme Sıklığı ayarı çalışmama hatası giderildi
- Hesaplar butonunun ikonunun hatalı görünümü düzeltildi

### Bilinen Hatalar (Erors)
- Yazı tipleri uygulanmıyor
- Bazı yazılar çevirilemiyor
- Ayarlar uygulanıyor fakat ayarlar sekmesinde görüntülenmiyor
- Firefox tabanlı tarayıcılarda tamamen kullanılmaz durum
- Hava Durumu Güncelleme Sıklığı ayarı çalışmama hatası
- Hava Durumu API sisteminin kullanıcıyı değil kendi varsayılanlarını ilan etmesi hatası
- Duvar kağıdı geçmişi 3 ile sınırlmasına uyulmama hatası
  
### Test Edilen Sistemler (deferred systems)
- Google ile Hesaplar girişi > Hesaplar için büyük bir güncelleme düşünüyoruz ancak önce hatalar giderilmeli
- Optimizasyonlar ve sistem ağırlığı azaltma çabaları > Muhtemelen bir sonraki yamada

---

## [Fluxo 4 Part 14] - 2025-10-07
### Eklendi (Added)
- Duvar kağıdını kaldırma eklendi
- Google Lens eklentisi eklendi
- Havadurumu için dil sistemi eklendi (Sistem daha tamamlanmadı)
- Logo altı isim rengi ayarı kaldırıldı

## ⚠️ Önemli Uyarı
Bu yamada Sistem temaları hatalıdır anlık olarak glassmorph ve neomorph temaları normal temalara göre daha optimize çalışabilir

### Düzenlendi (Fixed)
- Ayarları kaydetme sistemi düzeltildi (Bazı hatalar mevcut)
- Vanilla UI konum hataları giderildi
- Görünüm hataları ve DOM bulunamadı hataları giderildi
- Geçersiz API hataları giderildi (Weather sisteminde bazı hatalar devam ediyor olabilir
- MultiSearch fonksiyonu açıkken AISearch çalışmama hatası giderildi
- Vanilla harici temalarda görünüm hataları giderildi (Temalar baştan oluşturulacak)
- Sistem temaları uygulanmama hatası giderildi
- Aşırı bellek kullanımı hafifletildi
- Aydınlık temanın çalışmaması hatası giderildi
- Aydınlık temada karanlık obje hatası giderildi
- havadurumu widgetinde hatalı ikon görünümleri düzeltildi (hatalı görünüm gözükürse bize ulaşın)
- Duvar kağıtlarını tamamen kaldırınca gelen hata giderildi
- Bilgi barındaki görüntü hatası giderildi

### Bilinen Hatalar (Erors)
- Türkçe harflerin hesap oluşturmada kullanılamaması
- Yazı tipleri uygulanmıyor
- Bazı yazılar çevirilemiyor
- Ayarlar uygulanıyor fakat ayarlar sekmesinde görüntülenmiyor
- Firefox tabanlı tarayıcılarda tamamen kullanılmaz durum
- Hava Durumu Güncelleme Sıklığı ayarı çalışmama hatası
- Hava Durumu API sisteminin kullanıcıyı değil kendi varsayılanlarını ilan etmesi hatası
- Duvar kağıdı geçmişi 3 ile sınırlmasına uyulmama hatası
  
### Test Edilen Sistemler (deferred systems)
- Google ile Hesaplar girişi > Hesaplar için büyük bir güncelleme düşünüyoruz ancak önce hatalar giderilmeli
- Destek sekmesine sosyal linkler eklenecek > Bir sonraki yamada eklenecek

### İptal Edilen Sistemler (Canceled systems)
- Bölünmüş görünümde aç > iframe ve arama motorlarının katı kuralları nedeniyle iptal edildi

---

## [Fluxo 4 Part 13] - 2025-10-03
### Eklendi (Added)
- Script tamamen modüler hale getirildi (index.html %70 küçültüldü)
- kaydetme sistemi local storge yerine IndexedDB'ye geçirildi
- Havadurumu widgeti için daha sade tasarım
- Yeni FluxoSecureMax: Artık sistem daha güvenlikli
- 404 Sayfası eklendi
- Language.js daha kapsamlı hale getirildi
- Duvar kağıdı geçmişi 3 ile sınırlandırıldı
- Multisearch özelliği eklendi

### Düzenlendi (Fixed)
- Hava durumunun çalışmama hatası giderildi
- Sayfa çökme hatası giderildi
- logo görüntüleme ayarları düzeltildi

### Bilinen Hatalar (Erors)
- Kaydetme sorunları
- Vanilla UI konum hataları
- Görünüm hataları ve DOM bulunamadı hataları
- Geçersiz API hataları
- Türkçe harflerin hesap oluşturmada kullanılamaması
- MultiSearch fonksiyonu açıkken AISearch çalışmama hatası
- Vanilla harici temalarda görünüm hataları
- Yazı tipleri uygulanmıyor
- Sistem temaları uygulanmama hatası
- Aşırı bellek kullanımı
- Aydınlık temanın çalışmaması
- Aydınlık temada karanlık obje hatası
- havadurumu widgetinde hatalı ikon görünümleri
- Duvar kağıtlarını tamamen kaldırınca gelen hata
- Firefox tabanlı tarayıcılarda tamamen kullanılmaz durum
  
### Test Edilen Sistemler (deferred systems)
- Bölünmüş görünümde aç > Yeniden gündeme alınabilir html üzerinde çalışıyorum hataları giderdikten sonra eklenebilir
- 5 Günlük hava tahmini ve detaylı görünüm > Hava durumu widgeti için sadeleştirmeden sonra eklenmesi planlanıyor
- Google ile Hesaplar girişi > Hatalar giderildikten sonra eklenecek

### Ertelenen Sistemler (Tested systems)
- Duvar kağıdını kaldırma > Mevcut hatalar yüzünden yakın bir yamaya ertelendi
- Google Lens eklentisi > Mevcut hatalar yüzünden yakın bir yamaya ertelendi

---

## [Fluxo 4 Part 12] - 2025-09-27
### Eklendi (Added)
- Yeni Tema "Box" Eklendi
- Vanilla teması güncellendi
- Yeni favoriler görünümü ve animasyonları eklendi
- Yeni çeviriler eklendi
- Ayarlar sayfasındaki düzen yenilendi

### Düzenlendi (Fixed)
- Hava durumunun çalışmama hatası giderildi
- Artık Export/İmport sistemi çalışıyor
- Çeviri hataları giderildi
- (Failed to load resource: the server responded with a status of 404 ()) hatası giderildi (bazı sistemlerde görünebiliyor lütfen gördüğünüzde bize ulaşın)
- Değişikliklerin kayıt edilememe hatası giderildi

### Bilinen Hatalar (Erors)
- Vurgu rengi seçiminde sorunlar
- Firefox tabanlı tarayıcılarda sistem çökmesi
- AI butonunu göster ayarındaki hata

### Test Edilen Sistemler (Tested systems)
- Duvar kağıdını kaldırma > 13 yamasında getirilecek
- FluxoSecureMax > 13 yamasında devreye alınacak
- Google Lens eklentisi > 13 yamasında eklenecek

---

## [Fluxo 4 Part 11] - 2025-09-26
### Eklendi (Added)
- Yeni Temalar Eklendi!
-   Neomorphism
-   Transparent

### Düzenlendi (Fixed)
- Bazı işlevsiz ayarlar kaldırıldı

### Bilinen Hatalar (Erors)
- Vurgu rengi seçiminde sorunlar
- Firefox tabanlı tarayıcılarda sistem çökmesi
- Bazı hatalı çeviriler
- (Failed to load resource: the server responded with a status of 404 ()) hatası
- Çeviri hataları
- Hava Durumu çalışmama hatası

---

## [Fluxo 4 Part 10] - 2025-09-17
### Eklendi (Added)
- Tüm diller güncellendi ve optimize edildi
- Gagavuzca yeniden eklendi
- Logomuzu yeniledik artık daha keskin ve ince
- Favoriler için sağ tık menüsü eklendi
- Görünüm güncellemeleri ve hata giderme
- Varsayılan vurgu rengi değiştirildi #6F958D
- Arama önerilerindeki alt scrollbar kaldırıldı (Bir hataydı)
- Ayarlara yeni seçenekler eklendi (Bazı seçenekler işlevsiz)
- Script Optimize edildi

### Düzenlendi (Fixed)
- Hesap ikonunun hatalı pozisyonu düzeltildi
- Duvar kağıtlarının yeniden başlatma sırasında kaybolması hatası giderildi
- Duvar kağıtlarının kayıt edilmeme hatası giderildi
- Aydınlık temada favorilerin hatalı görünümü giderildi
- Hover animasyonları sırasında titreme sorunu giderildi

### Test Edilen Sistemler (Tested systems)
- Favori klasörleme sistemi test edildi --Sonuç > İşlevsiz kullanım nedeniyle erteleme
- MultiSearch --Sonuç > Sistemi test ediyorum

---

## [Fluxo 4 Part 9] - 2025-09-14
### Added
- Moğolca, İtalyanca, İbranice, Hintçe, Yunanca eklendi
- Gagavuzca kısa süre için kullanmdan kaldırıldı
- Diller güncellendi (Yanlızca tr,en)
- Ayarları aktarma sistemi entegre edildi (Hatalar mevcut)
- Ayarlardaki Scrollbar düzenlendi
- Yeni buton seçme ve seçili buton görünümleri
- Kapatma tuşları düzenlendi (Favoriler hariç onlar için farklı planımız var :D)
- Arayüzde yenilikler;
-  Açık tema'da karanlık tema itemlerinin görünme hataları giderildi.

### Fixed
- Dosya seç alanındaki görsel kirlilik düzenlendi (Edge, safari...)
- suggestions tanımlanmadı hatası giderildi
- çeviri bulunamadı hatası giderildi
- "e" tanımlanmadı hatası giderildi

---

## [Fluxo 4 Part 8] - 2025-09-12
### Added
- Github'da yayımlandı.
- Ayarlar>Görünüm sekmesi ayarları artık çalışıyor


### Fixed
- Yok 

---

