export interface LegalPageItem {
  id: string; // 'kunye' | 'kvkk-aydinlatma' | 'cerez-politikasi' | 'imha-politikasi' | 'kamera-aydinlatma' | 'kvkk-basvuru'
  title: string;
  slug: string;
  content: string; // Rich Text HTML
  updatedAt: string;
  description?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export const DEFAULT_LEGAL_PAGES: LegalPageItem[] = [
  {
    id: "kunye",
    title: "Gündem360 Künye & Yayın İlkeleri",
    slug: "/kunye",
    description: "Gündem360 dijital haber portalı imtiyaz sahibi, yayın kurulu ve yasal künye bilgileri.",
    updatedAt: "2026-09-20T12:00:00.000Z",
    content: `<h2>GÜNDEM360 MEDYA VE YAYINCILIK A.Ş.</h2>
<p class="lead">5187 sayılı Basın Kanunu ve 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun uyarınca hazırlanan resmi künyedir.</p>

<h3>YÖNETİM VE İMTİYAZ BİLGİLERİ</h3>
<ul>
  <li><strong>İmtiyaz Sahibi (Tüzel Kişi):</strong> Gündem360 Medya ve Yayıncılık Anonim Şirketi</li>
  <li><strong>Yönetim Kurulu Başkanı:</strong> Kerem Demirtaş</li>
  <li><strong>Genel Yayın Yönetmeni (Sorumlu Müdür):</strong> Zeynep Kaya</li>
  <li><strong>Yazı İşleri Müdürü:</strong> Murat Arslan</li>
  <li><strong>Haber Koordinatörü:</strong> Deniz Çelik</li>
  <li><strong>Ekonomi Masası Editörü:</strong> Selin Yılmaz</li>
  <li><strong>Teknoloji & Bilim Editörü:</strong> Can Barış Aydın</li>
</ul>

<h3>HUKUK VE TEKNİK DANIŞMANLIK</h3>
<ul>
  <li><strong>Hukuk Müşaviri:</strong> Av. Alperen Çetin (İstanbul Barosu)</li>
  <li><strong>Bilişim ve Altyapı Direktörü:</strong> Alper Kaan Öztürk</li>
  <li><strong>Veri Güvenliği Sorumlusu (DPO):</strong> kvkk@gundem360.com</li>
</ul>

<h3>İLETİŞİM VE ŞİRKET BİLGİLERİ</h3>
<ul>
  <li><strong>Merkez Ofis Adresi:</strong> Büyükdere Caddesi No:190, Maslak / Sarıyer / İstanbul</li>
  <li><strong>Telefon Santrali:</strong> +90 (212) 555 36 00</li>
  <li><strong>Haber İhbar Hattı (WhatsApp):</strong> +90 (532) 555 36 36</li>
  <li><strong>Kurumsal E-posta:</strong> iletisim@gundem360.com</li>
  <li><strong>Basın Bülteni & İhbar:</strong> haber@gundem360.com</li>
  <li><strong>Vergi Dairesi & No:</strong> Maslak Vergi Dairesi - 4820194829</li>
  <li><strong>Ticaret Sicil No:</strong> 984512-5</li>
  <li><strong>MERSİS No:</strong> 0482019482900018</li>
</ul>

<h3>YER SAĞLAYICI (HOSTING) VE ALTYAPI</h3>
<p>Gündem360 haber portalı kendi yüksek güvenlikli bulut sunucu altyapısında barındırılmaktadır. Yer sağlayıcı bildirimleri Bilgi Teknolojileri ve İletişim Kurumu'na (BTK) usulüne uygun olarak iletilmiştir.</p>

<blockquote>Gündem360, Basın Ahlak Yasası'na uymayı taahhüt eder. Sitede yayımlanan köşe yazılarından yazarların kendileri sorumludur. Kaynak gösterilmeden yapılan alıntılar hakkında 5846 sayılı FSEK uyarınca yasal işlem başlatılır.</blockquote>`
  },
  {
    id: "kvkk-aydinlatma",
    title: "KVKK Müşteri ve Okur Aydınlatma Metni",
    slug: "/kvkk/aydinlatma-metni",
    description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
    updatedAt: "2026-09-20T12:00:00.000Z",
    content: `<h2>6698 SAYILI KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ</h2>
<p class="lead">Gündem360 Medya ve Yayıncılık A.Ş. ("Gündem360" veya "Şirket") olarak, okurlarımızın, ziyaretçilerimizin ve iş ortaklarımızın kişisel verilerinin gizliliğine ve güvenliğine büyük önem veriyoruz.</p>

<h3>1. Veri Sorumlusunun Kimliği</h3>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("Kanun") uyarınca, veri sorumlusu sıfatıyla İstanbul Ticaret Sicil Müdürlüğü'ne 984512-5 sicil numarası ile kayıtlı Büyükdere Cad. No:190 Maslak / İstanbul adresinde mukim <strong>Gündem360 Medya ve Yayıncılık A.Ş.</strong>'dir.</p>

<h3>2. İşlenen Kişisel Verileriniz ve Toplanma Amaçları</h3>
<p>Haber portalımızı ziyaretiniz, bülten aboneliğiniz veya yorum yapmanız esnasında aşağıdaki kişisel verileriniz toplanabilir ve işlenebilir:</p>
<ul>
  <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, e-posta adresi (bülten aboneliği veya iletişim formu doldurulduğunda).</li>
  <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, internet sitesi giriş-çıkış logları, tarayıcı bilgileri, oturum verileri (5651 sayılı Kanun uyarınca zorunlu log kayıtları).</li>
  <li><strong>Kullanıcı İşlem Verileri:</strong> Haberlere yapılan yorumlar, beğeniler ve anket oyları.</li>
</ul>

<h3>3. Kişisel Verilerin İşlenme Hukuki Sebepleri</h3>
<p>Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen:</p>
<ul>
  <li>Kanunlarda açıkça öngörülmesi (5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Kanunu),</li>
  <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması,</li>
  <li>Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması,</li>
  <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaatlerimiz için veri işlenmesinin zorunlu olması hukuki sebeplerine dayalı olarak işlenmektedir.</li>
</ul>

<h3>4. Kişisel Verilerin Aktarılması</h3>
<p>Toplanan kişisel verileriniz, yasal zorunluluklar ve meşru amaçlar haricinde hiçbir üçüncü kişi veya kuruma ticari amaçla satılmaz veya devredilmez. Ancak adli ve idari makamların usulüne uygun yasal talepleri (mahkemeler, savcılıklar, BTK) doğrultusunda yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir.</p>

<h3>5. KVKK'nın 11. Maddesi Uyarınca Haklarınız</h3>
<p>Kanun'un 11. maddesi kapsamında dilediğiniz zaman Şirketimize başvurarak:</p>
<ul>
  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
  <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
  <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
  <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
  <li>Kişisel verilerinizin silinmesini veya yok edilmesini talep etme haklarına sahipsiniz.</li>
</ul>

<blockquote>Haklarınızı kullanmak için <a href="/kvkk/basvuru-formu">KVKK Başvuru Formu</a> sayfamızdaki yönergeleri takip edebilir veya <strong>kvkk@gundem360.com</strong> adresine güvenli elektronik imzanızla e-posta iletebilirsiniz.</blockquote>`
  },
  {
    id: "cerez-politikasi",
    title: "Çerez (Cookie) Politikası",
    slug: "/kvkk/cerez-politikasi",
    description: "İnternet sitemizde kullanılan çerez türleri ve yönetim rehberi.",
    updatedAt: "2026-09-20T12:00:00.000Z",
    content: `<h2>GÜNDEM360 ÇEREZ (COOKIE) POLİTİKASI</h2>
<p class="lead">Bu Çerez Politikası, Gündem360 internet sitemizi ziyaret eden kullanıcılarımızın deneyimini zenginleştirmek, performans ölçümleri yapmak ve sitemizin güvenliğini sağlamak amacıyla kullanılan çerezler hakkında bilgilendirme sunar.</p>

<h3>1. Çerez (Cookie) Nedir?</h3>
<p>Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler sitenin daha verimli çalışmasını, kullanıcı tercihlerinin (örneğin tema, dil veya font boyutu) hatırlanmasını ve ziyaretçi istatistiklerinin anonim olarak analiz edilmesini sağlar.</p>

<h3>2. Sitemizde Kullanılan Çerez Türleri</h3>
<ul>
  <li><strong>Zorunlu Çerezler:</strong> Web sitesinin temel fonksiyonlarının düzgün çalışması, sayfa geçişleri ve güvenlik duvarı kontrolleri için teknik olarak zorunlu çerezlerdir. Bu çerezler devre dışı bırakılamaz.</li>
  <li><strong>İşlevsel Çerezler:</strong> Koyu/açık tema seçimi, okuma boyutu tercihleri gibi kişiselleştirilmiş ayarlarınızı tarayıcınızda hatırlamamızı sağlar.</li>
  <li><strong>Analitik ve Performans Çerezleri:</strong> Sayfa görüntüleme sayıları, popüler haberler ve sitede geçirilen ortalama süre gibi istatistiki verileri anonim olarak ölçümlememize yardımcı olur (örneğin Google Analytics).</li>
  <li><strong>Güvenlik Çerezleri:</strong> Yorum formlarında bot ve spam saldırılarını önlemek, CSRF koruması sağlamak amacıyla kullanılır.</li>
</ul>

<h3>3. Çerezleri Nasıl Kontrol Edebilir veya Silebilirsiniz?</h3>
<p>Tarayıcınızın ayarlarını değiştirerek çerezleri dilediğiniz an engelleyebilir veya mevcut çerezleri temizleyebilirsiniz. Popüler tarayıcılarda çerez ayarları yönetimi için aşağıdaki bağlantıları inceleyebilirsiniz:</p>
<ul>
  <li><strong>Google Chrome:</strong> Ayarlar > Gizlilik ve Güvenlik > Çerezler ve diğer site verileri</li>
  <li><strong>Mozilla Firefox:</strong> Seçenekler > Gizlilik ve Güvenlik > Çerezler ve Site Verileri</li>
  <li><strong>Apple Safari:</strong> Tercihler > Gizlilik > Çerezleri ve Web Sitesi Verilerini Yönet</li>
  <li><strong>Microsoft Edge:</strong> Ayarlar > Çerezler ve Site İzinleri</li>
</ul>

<blockquote>Zorunlu çerezlerin engellenmesi durumunda internet sitemizin bazı bölümleri (örneğin anket oylama veya admin paneli girişi) beklenen şekilde çalışmayabilir.</blockquote>`
  },
  {
    id: "imha-politikasi",
    title: "Kişisel Verileri Saklama ve İmha Politikası",
    slug: "/kvkk/saklama-ve-imha",
    description: "Kişisel verilerin saklama süreleri, periyodik imha süreçleri ve teknik tedbirler.",
    updatedAt: "2026-09-20T12:00:00.000Z",
    content: `<h2>KİŞİSEL VERİLERİ SAKLAMA VE İMHA POLİTİKASI</h2>
<p class="lead">Gündem360 Medya ve Yayıncılık A.Ş., işlediği kişisel verileri ilgili mevzuatta öngörülen veya işlendikleri amaç için gerekli olan süre boyunca muhafaza etmekte, yasal sürelerin sona ermesiyle periyodik imha süreçlerini işletmektedir.</p>

<h3>1. Politikanın Amacı ve Kapsamı</h3>
<p>Bu politika, 6698 sayılı Kanun ve Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik uyarınca, Şirketimiz tarafından gerçekleştirilen saklama ve imha faaliyetlerine ilişkin usul ve esasları belirler.</p>

<h3>2. Veri Saklama ve İmha Süreleri Tablosu</h3>
<ul>
  <li><strong>Trafik ve Erişim Logları (IP & Zaman Damgası):</strong> 5651 sayılı Kanun uyarınca <strong>2 yıl</strong> süreyle saklanır, süre sonunda otomatik silinir.</li>
  <li><strong>İletişim Formu Mesajları:</strong> İlgili talep veya şikayetin çözüme kavuşturulmasından itibaren <strong>1 yıl</strong> sonra imha edilir.</li>
  <li><strong>Haber Yorumları ve Kullanıcı İçerikleri:</strong> Yayında kaldığı süre boyunca ve olası tekzip/dava zamanaşımı süreleri (Basın Kanunu gereği) boyunca saklanır.</li>
  <li><strong>Bülten Aboneliği E-postaları:</strong> Kullanıcı bülten aboneliğinden ayrılana kadar saklanır, ayrılma talebi üzerine 3 iş günü içinde sistemden silinir.</li>
</ul>

<h3>3. İmha Yöntemleri</h3>
<ul>
  <li><strong>Silme:</strong> Veritabanı kayıtlarının yetkili kullanıcılar için erişilemez ve tekrar kullanılamaz hale getirilmesi.</li>
  <li><strong>Yok Etme:</strong> Fiziksel veri ortamlarının parçalanması veya manyetik ortamların de-magnetize edilerek geri döndürülemez kılınması.</li>
  <li><strong>Anonim Hale Getirme:</strong> Verilerin başka verilerle eşleştirilse dahi hiçbir surette kimliği belirli veya belirlenebilir bir gerçek kişiyle ilişkilendirilemeyecek hale getirilmesi.</li>
</ul>

<h3>4. Periyodik İmha Takvimi</h3>
<p>Şirketimiz, periyodik imha aralığını <strong>6 ay</strong> olarak belirlemiştir. Her yılın Haziran ve Aralık aylarında saklama süresi dolan kişisel veriler mevzuata uygun şekilde imha edilerek tutanak altına alınır.</p>`
  },
  {
    id: "kamera-aydinlatma",
    title: "Güvenlik Kamerası Kayıtları Aydınlatma Metni",
    slug: "/kvkk/kamera-aydinlatma",
    description: "Hizmet binaları ve tesislerimizde yürütülen güvenlik kamerası kayıt faaliyetleri.",
    updatedAt: "2026-09-20T12:00:00.000Z",
    content: `<h2>GÜVENLİK KAMERALARI HAKKINDA AYDINLATMA METNİ</h2>
<p class="lead">Gündem360 Medya ve Yayıncılık A.Ş. yönetim binası, stüdyoları ve çalışma alanlarında fiziksel mekan güvenliğinin temini amacıyla kapalı devre kamera kayıt sistemi (CCTV) ile görüntü kaydı yapılmaktadır.</p>

<h3>1. Kamera Kaydının Amacı ve Hukuki Sebebi</h3>
<p>Güvenlik kameraları aracılığıyla görüntü kaydı yapılması;</p>
<ul>
  <li>Bina ve çalışan güvenliğinin sağlanması,</li>
  <li>Şirketimiz demirbaşlarının, haber ekipmanlarının ve stüdyo donanımlarının korunması,</li>
  <li>Yetkisiz girişlerin önlenmesi ve caydırıcılık sağlanması,</li>
  <li>Olası hukuki uyuşmazlıklarda delil niteliğinin korunması amaçlarıyla yürütülmektedir.</li>
</ul>
<p>Bu faaliyet, KVKK'nın 5. maddesinde yer alan <em>"Veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması"</em> hukuki sebebine dayanmaktadır.</p>

<h3>2. Kayıt Yapılan Alanlar ve Mahremiyet Sınırları</h3>
<p>Kamera ile izleme faaliyeti bina dış cephesi, ana giriş kapıları, danışma, stüdyo girişleri ve ortak koridorlarla sınırlıdır. Kişilerin mahremiyetini ihlal edebilecek alanlarda (tuvaletler, mescit, giyinme odaları vb.) kesinlikle kamera kaydı yapılmamaktadır.</p>

<h3>3. Verilerin Saklanma Süresi ve Güvenliği</h3>
<p>Kamera kayıtları yüksek güvenlikli dijital kayıt cihazlarında (NVR) şifreli olarak muhafaza edilmekte olup, yasal bir soruşturma veya uyuşmazlık bulunmadığı takdirde <strong>30 gün</strong> sonra otomatik olarak üzerine yazma yöntemiyle imha edilmektedir.</p>

<h3>4. Kayıtların Kimlere Aktarıldığı</h3>
<p>Güvenlik kamerası kayıtlarına yalnızca yetkili güvenlik birimi ve yönetim kadrosu erişebilir. Kayıtlar, kanunen yetkili kılınmış kamu kurumları (Emniyet Genel Müdürlüğü, Savcılıklar veya Mahkemeler) tarafından resmi yazı ile talep edilmesi haricinde hiçbir üçüncü kişiyle paylaşılmaz.</p>`
  },
  {
    id: "kvkk-basvuru",
    title: "KVKK İlgili Kişi Başvuru Formu ve Rehberi",
    slug: "/kvkk/basvuru-formu",
    description: "KVKK'nın 11. maddesi kapsamındaki haklarınızı kullanabileceğiniz başvuru yönergeleri.",
    updatedAt: "2026-09-20T12:00:00.000Z",
    content: `<h2>KVKK İLGİLİ KİŞİ BAŞVURU FORMU VE BAŞVURU REHBERİ</h2>
<p class="lead">6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 11. maddesinde sayılan haklarınıza ilişkin taleplerinizi, bu rehberde belirtilen yöntemlerle Şirketimize iletebilirsiniz.</p>

<h3>1. Başvuru Yöntemleri ve Kanalları</h3>
<p>Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ uyarınca başvurularınızı aşağıdaki kanallardan biriyle gerçekleştirebilirsiniz:</p>

<ul>
  <li><strong>E-posta Yoluyla (Güvenli Elektronik İmza / Mobil İmza ile):</strong> Sistemimizde kayıtlı e-posta adresinizden veya kayıtlı elektronik posta (KEP) adresinizden <strong>kvkk@gundem360.com</strong> adresine iletebilirsiniz.</li>
  <li><strong>Noter Kanalıyla:</strong> Talebinizi içeren noter onaylı ihtarnamenizi <em>"Büyükdere Cad. No:190 Maslak / Sarıyer / İstanbul"</em> adresimize gönderebilirsiniz.</li>
  <li><strong>Şahsen Islak İmzalı Başvuru:</strong> Kimliğinizi tevsik edici resmi belge (Nüfus Cüzdanı / Pasaport) ile birlikte şirket merkezimize bizzat müracaat edebilirsiniz.</li>
</ul>

<h3>2. Başvuruda Bulunması Zorunlu Bilgiler</h3>
<p>Yasal tebliğ uyarınca başvurunuzda aşağıdaki bilgilerin yer alması kanuni zorunluluktur:</p>
<ol>
  <li>Ad, soyad ve başvuru yazılı ise ıslak imza,</li>
  <li>Türkiye Cumhuriyeti vatandaşları için T.C. kimlik numarası, yabancılar için uyruğu ve pasaport numarası,</li>
  <li>Tebligata esas yerleşim yeri veya iş yeri adresi,</li>
  <li>Varsa bildirime esas elektronik posta adresi, telefon ve faks numarası,</li>
  <li>Talep konusu ve talebe dayanak oluşturan somut açıklamalar.</li>
</ol>

<h3>3. Başvuruların Cevaplandırılma Süresi</h3>
<p>Şirketimize usulüne uygun olarak ulaşan başvurularınız, talebin niteliğine göre en kısa sürede ve <strong>en geç otuz (30) gün içinde</strong> ücretsiz olarak sonuçlandırılacaktır. Ancak işlemin ayrıca bir maliyeti gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu'nca belirlenen tarifedeki ücret alınabilir.</p>

<blockquote>İlgili taleplerinizi doğrudan inceleyebilmemiz için lütfen konuyu açık ve net biçimde ifade eden dilekçenizi ekleyiniz. İletişim merkezimize <a href="/iletisim">buradan</a> da ulaşabilirsiniz.</blockquote>`
  }
];
