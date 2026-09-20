import fs from "fs";
import path from "path";
import {
  INITIAL_NEWS,
  INITIAL_COLUMNISTS,
  INITIAL_FINANCE_RATES,
  INITIAL_WEATHER,
  CATEGORIES,
  INITIAL_GALLERIES,
  INITIAL_GALLERY_CATEGORIES,
  INITIAL_VIDEOS,
  INITIAL_VIDEO_CATEGORIES,
} from "./data/mock-news";
import {
  NewsItem,
  Columnist,
  ColumnistArticle,
  Comment,
  FinanceRate,
  WeatherInfo,
  CategoryKey,
  CategoryItem,
  CategoryLayoutVariant,
  SiteSettings,
  SiteSeoSettings,
  PhotoGallery,
  GallerySlide,
  GalleryCategory,
  VideoItem,
  VideoCategory,
  Poll,
  PollOption,
  PaginatedNewsResult,
} from "@/types/news";

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const STORE_FILE = path.join(DATA_DIR, "news-store.json");

const DEFAULT_SEO_SETTINGS: SiteSeoSettings = {
  metaTitleTemplate: "%s | Son Dakika ve Güncel Haberler - Gündem360",
  metaTitle: "Gündem360 | Son Dakika, Güncel ve Tarafsız Haber Portalı",
  metaDescription: "Türkiye ve dünyadan son dakika haberleri, ekonomi, spor, teknoloji, gündem ve analizlerle en hızlı ve doğru haber kaynağınız.",
  focusKeywords: "haber, son dakika, ekonomi, gündem, spor, teknoloji, canlı borsa, tarafsız haber",
  canonicalUrl: "https://gundem360.com",
  robotsIndex: "index, follow",
  maxSnippet: true,
  maxImagePreview: "large",
  maxVideoPreview: true,
  ogTitle: "Gündem360 | Hızlı, Tarafsız & Doğru Haber Portalı",
  ogDescription: "Türkiye ve dünyadan anlık son dakika haberleri, ekonomi analizleri, spor ve gündem başlıkları.",
  ogImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
  twitterCard: "summary_large_image",
  twitterHandle: "@gundem360",
  googleVerification: "google-site-verification-gundem360-2026",
  bingVerification: "bing-site-verification-gundem360-2026",
  yandexVerification: "",
  publisherType: "NewsMediaOrganization",
  publisherLogo: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80",
  googleNewsName: "Gündem360",
  robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://gundem360.com/sitemap.xml",
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Gündem360",
  siteSlogan: "Hızlı, Tarafsız & Doğru Haber Portalı",
  contactEmail: "iletisim@gundem360.com",
  contactPhone: "+90 (212) 555 36 00",
  address: "Büyükdere Cad. No:190, Maslak / İstanbul",
  twitterUrl: "https://twitter.com/gundem360",
  facebookUrl: "https://facebook.com/gundem360",
  instagramUrl: "https://instagram.com/gundem360",
  youtubeUrl: "https://youtube.com/gundem360",
  whatsappUrl: "https://whatsapp.com/channel/gundem360",
  maintenanceMode: false,
  autoFinanceRates: true,
  seo: { ...DEFAULT_SEO_SETTINGS },
};

export interface RuntimeStore {
  news: NewsItem[];
  columnists: Columnist[];
  categories: CategoryItem[];
  siteSettings: SiteSettings;
  comments: Comment[];
  galleries: PhotoGallery[];
  galleryCategories: GalleryCategory[];
  videos: VideoItem[];
  videoCategories: VideoCategory[];
  polls?: Poll[];
}

export function loadStore(): RuntimeStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.categories || !Array.isArray(parsed.categories)) {
        parsed.categories = [...CATEGORIES];
      }
      if (!parsed.siteSettings) {
        parsed.siteSettings = { ...DEFAULT_SITE_SETTINGS };
      }
      if (!parsed.siteSettings.seo) {
        parsed.siteSettings.seo = { ...DEFAULT_SEO_SETTINGS };
      }
      if (!parsed.galleryCategories || !Array.isArray(parsed.galleryCategories) || parsed.galleryCategories.length === 0) {
        parsed.galleryCategories = [...INITIAL_GALLERY_CATEGORIES];
      }
      if (!parsed.galleries || !Array.isArray(parsed.galleries) || parsed.galleries.length === 0) {
        parsed.galleries = [...INITIAL_GALLERIES];
      } else {
        parsed.galleries = parsed.galleries.map((g: PhotoGallery) => {
          const catMatch = parsed.galleryCategories.find((c: GalleryCategory) => c.key === g.category);
          return {
            ...g,
            categoryTitle: g.categoryTitle || catMatch?.name || g.category,
            categoryBadgeColor: g.categoryBadgeColor || catMatch?.badgeColor || "bg-red-600",
          };
        });
      }
      if (!parsed.videoCategories || !Array.isArray(parsed.videoCategories) || parsed.videoCategories.length === 0) {
        parsed.videoCategories = [...INITIAL_VIDEO_CATEGORIES];
      }
      if (!parsed.videos || !Array.isArray(parsed.videos) || parsed.videos.length === 0) {
        parsed.videos = [...INITIAL_VIDEOS];
      } else {
        parsed.videos = parsed.videos.map((v: VideoItem) => {
          const catMatch = parsed.videoCategories.find((c: VideoCategory) => c.slug === v.category);
          return {
            ...v,
            categoryTitle: v.categoryTitle || catMatch?.name || v.category,
            categoryBadgeColor: v.categoryBadgeColor || catMatch?.color || "bg-red-600",
          };
        });
      }
      if (!parsed.columnists || !Array.isArray(parsed.columnists) || parsed.columnists.length === 0) {
        parsed.columnists = [...INITIAL_COLUMNISTS];
      } else {
        // Her yazarın slug, bio ve makale arşivi olduğundan emin ol
        parsed.columnists = parsed.columnists.map((col: Columnist) => {
          const initMatch = INITIAL_COLUMNISTS.find((ic) => ic.id === col.id);
          const colSlug =
            col.slug ||
            initMatch?.slug ||
            col.name
              .toLowerCase()
              .replace(/ğ/g, "g")
              .replace(/ü/g, "u")
              .replace(/ş/g, "s")
              .replace(/ı/g, "i")
              .replace(/ö/g, "o")
              .replace(/ç/g, "c")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");

          let articles = col.articles;
          if (!articles || !Array.isArray(articles) || articles.length === 0) {
            if (initMatch && initMatch.articles && initMatch.articles.length > 0) {
              articles = [...initMatch.articles];
            } else if (col.articleTitle) {
              articles = [
                {
                  id: "art-" + col.id + "-1",
                  authorId: col.id,
                  title: col.articleTitle,
                  slug: col.articleSlug,
                  date: col.articleDate,
                  excerpt: col.excerpt,
                  content: col.content,
                  views: 1200,
                },
              ];
            } else {
              articles = [];
            }
          }

          return {
            ...col,
            slug: colSlug,
            bio: col.bio || initMatch?.bio || `${col.name}, ${col.title} olarak Gündem360 bünyesinde köşe yazıları kaleme almaktadır.`,
            email: col.email || initMatch?.email || "iletisim@gundem360.com",
            socialTwitter: col.socialTwitter || initMatch?.socialTwitter,
            socialLinkedin: col.socialLinkedin || initMatch?.socialLinkedin,
            articles,
          };
        });
      }
      if (!parsed.polls || !Array.isArray(parsed.polls) || parsed.polls.length === 0) {
        parsed.polls = [...INITIAL_POLLS];
      }
      if (!parsed.comments || !Array.isArray(parsed.comments) || parsed.comments.length === 0) {
        parsed.comments = [
          {
            id: "com-1",
            newsId: "1",
            newsTitle: "Türkiye'nin Yeni Nesil Yapay Zekâ Modeli Tanıtıldı: Dünyada Büyük Yankı",
            author: "Selim Kaya",
            content: "Mühendislerimizi tebrik ediyorum, yerli yapay zekâ hamlesi ülkemiz için çok kıymetli.",
            createdAt: "18 Eylül 2026 10:45",
            likes: 14,
            dislikes: 1,
            parentId: null,
            status: "approved",
          },
          {
            id: "com-1-1",
            newsId: "1",
            newsTitle: "Türkiye'nin Yeni Nesil Yapay Zekâ Modeli Tanıtıldı: Dünyada Büyük Yankı",
            author: "Dr. Arda Yılmaz",
            content: "Kesinlikle katılıyorum. Özellikle açık kaynaklı modeller üzerinde eğitilmiş olması araştırmacılar için büyük avantaj sağlayacaktır.",
            createdAt: "18 Eylül 2026 11:05",
            likes: 6,
            dislikes: 0,
            parentId: "com-1",
            replyToAuthor: "Selim Kaya",
            status: "approved",
          },
          {
            id: "com-2",
            newsId: "1",
            newsTitle: "Türkiye'nin Yeni Nesil Yapay Zekâ Modeli Tanıtıldı: Dünyada Büyük Yankı",
            author: "Merve Demir",
            content: "API erişiminin açılmasını dört gözle bekliyoruz. Umarım Türkçe desteği iddia edildiği kadar başarılıdır.",
            createdAt: "18 Eylül 2026 11:20",
            likes: 8,
            dislikes: 0,
            parentId: null,
            status: "approved",
          },
          {
            id: "com-3",
            newsId: "3",
            newsTitle: "Avrupa'da Tarihi Gece: Temsilcimiz Deplasmandan Zaferle Döndü",
            author: "Caner Öztürk",
            content: "Harika bir maçtı, ikinci gol tam bir jeneriklik vuruştu!",
            createdAt: "19 Eylül 2026 00:10",
            likes: 24,
            dislikes: 2,
            parentId: null,
            status: "approved",
          },
        ];
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading news-store.json, resetting to defaults:", err);
  }

  const defaultStore: RuntimeStore = {
    news: [...INITIAL_NEWS],
    columnists: [...INITIAL_COLUMNISTS],
    categories: [...CATEGORIES],
    siteSettings: { ...DEFAULT_SITE_SETTINGS },
    galleries: [...INITIAL_GALLERIES],
    galleryCategories: [...INITIAL_GALLERY_CATEGORIES],
    videos: [...INITIAL_VIDEOS],
    videoCategories: [...INITIAL_VIDEO_CATEGORIES],
    polls: [...INITIAL_POLLS],
    comments: [
      {
        id: "com-1",
        newsId: "1",
        newsTitle: "Türkiye'nin Yeni Nesil Yapay Zekâ Modeli Tanıtıldı: Dünyada Büyük Yankı",
        author: "Selim Kaya",
        content: "Mühendislerimizi tebrik ediyorum, yerli yapay zekâ hamlesi ülkemiz için çok kıymetli.",
        createdAt: "18 Eylül 2026 10:45",
        likes: 12,
        status: "approved",
      },
      {
        id: "com-2",
        newsId: "1",
        newsTitle: "Türkiye'nin Yeni Nesil Yapay Zekâ Modeli Tanıtıldı: Dünyada Büyük Yankı",
        author: "Merve Demir",
        content: "API erişiminin açılmasını dört gözle bekliyoruz. Umarım Türkçe desteği iddia edildiği kadar başarılıdır.",
        createdAt: "18 Eylül 2026 11:20",
        likes: 8,
        status: "approved",
      },
      {
        id: "com-3",
        newsId: "3",
        newsTitle: "Avrupa'da Tarihi Gece: Temsilcimiz Deplasmandan Zaferle Döndü",
        author: "Caner Öztürk",
        content: "Harika bir maçtı, ikinci gol tam bir jeneriklik vuruştu!",
        createdAt: "19 Eylül 2026 00:10",
        likes: 24,
        status: "approved",
      },
      {
        id: "com-4",
        newsId: "2",
        newsTitle: "Merkez Bankası Kritik Kararını Açıkladı: Piyasaların İlk Tepkisi",
        author: "Hakan Aydın",
        content: "Piyasa bu kararı önceden fiyatlamıştı, borsa için olumlu bir hava oluştu.",
        createdAt: "18 Eylül 2026 15:30",
        likes: 3,
        status: "pending",
      },
    ],
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Error creating news-store.json:", err);
  }

  return defaultStore;
}

export function saveStore(store: RuntimeStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving news-store.json:", err);
  }
}

// 1. HABER SERVİS METOTLARI
export async function getAllNews(): Promise<NewsItem[]> {
  const store = loadStore();
  return [...store.news];
}

export async function getPaginatedNews(
  page: number = 1,
  limit: number = 20,
  search?: string,
  category?: string,
  headlineType?: string
): Promise<PaginatedNewsResult> {
  const store = loadStore();
  let items = [...store.news];

  // Arama filtresi (Başlık, Özet, Yazar veya Etiketler)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.author?.name?.toLowerCase().includes(q) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Kategori filtresi
  if (category && category !== "all") {
    items = items.filter((item) => item.category === category);
  }

  // Manşet / Yayın tipi filtresi
  if (headlineType && headlineType !== "all") {
    if (headlineType === "breaking") {
      items = items.filter((item) => item.isBreaking);
    } else {
      items = items.filter((item) => item.headlineType === headlineType);
    }
  }

  const total = items.length;
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const validPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (validPage - 1) * safeLimit;
  const slicedNews = items.slice(startIndex, startIndex + safeLimit);

  return {
    news: slicedNews,
    total,
    totalPages,
    currentPage: validPage,
    limit: safeLimit,
  };
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const store = loadStore();
  const found = store.news.find((n) => n.id === id);
  return found ? { ...found } : null;
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const store = loadStore();
  const found = store.news.find((n) => n.slug === slug);
  return found ? { ...found } : null;
}

export async function getNewsByCategory(category: CategoryKey | string): Promise<NewsItem[]> {
  const store = loadStore();
  return store.news.filter((n) => n.category === category);
}

export async function getMainHeadlines(): Promise<NewsItem[]> {
  const store = loadStore();
  return store.news
    .filter((n) => n.headlineType === "main")
    .sort((a, b) => (a.headlineOrder || 99) - (b.headlineOrder || 99));
}

export async function getSubHeadlines(): Promise<NewsItem[]> {
  const store = loadStore();
  return store.news.filter((n) => n.headlineType === "sub");
}

export async function getBreakingNews(): Promise<NewsItem[]> {
  const store = loadStore();
  return store.news.filter((n) => n.isBreaking);
}

export async function createNews(
  newsData: Omit<NewsItem, "id" | "views" | "publishedAt">
): Promise<NewsItem> {
  const store = loadStore();
  const newItem: NewsItem = {
    ...newsData,
    id: String(Date.now()),
    views: 1,
    publishedAt: new Date().toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  store.news = [newItem, ...store.news];
  saveStore(store);
  return newItem;
}

export async function updateNews(
  id: string,
  updates: Partial<NewsItem>
): Promise<NewsItem | null> {
  const store = loadStore();
  const index = store.news.findIndex((n) => n.id === id);
  if (index === -1) return null;

  store.news[index] = {
    ...store.news[index],
    ...updates,
    updatedAt: new Date().toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  saveStore(store);
  return { ...store.news[index] };
}

export async function deleteNews(id: string): Promise<boolean> {
  const store = loadStore();
  const initialLength = store.news.length;
  store.news = store.news.filter((n) => n.id !== id);
  saveStore(store);
  return store.news.length < initialLength;
}

export async function updateHeadlineSlot(newsId: string, slotOrder: number): Promise<boolean> {
  const store = loadStore();
  const item = store.news.find((n) => n.id === newsId);
  if (!item) return false;
  item.headlineType = "main";
  item.headlineOrder = slotOrder;
  saveStore(store);
  return true;
}

export async function reorderHeadlineSlots(orderedIds: (string | null)[]): Promise<boolean> {
  const store = loadStore();
  const validIds = orderedIds.filter(Boolean) as string[];

  store.news.forEach((n) => {
    const newIndex = validIds.indexOf(n.id);
    if (newIndex !== -1) {
      n.headlineType = "main";
      n.headlineOrder = newIndex + 1;
    } else if (n.headlineType === "main") {
      n.headlineType = "normal";
      n.headlineOrder = undefined;
    }
  });

  saveStore(store);
  return true;
}

// 2. YORUM SERVİS METOTLARI
export async function getComments(newsId: string): Promise<Comment[]> {
  const store = loadStore();
  return store.comments.filter((c) => c.newsId === newsId && c.status !== "rejected");
}

export async function getAllComments(): Promise<Comment[]> {
  const store = loadStore();
  return [...store.comments];
}

export async function addComment(
  comment: Omit<Comment, "id" | "createdAt" | "likes" | "dislikes">
): Promise<Comment> {
  const store = loadStore();
  const newsItem = store.news.find((n) => n.id === comment.newsId);
  const newComment: Comment = {
    id: "com-" + Date.now(),
    newsId: comment.newsId,
    newsTitle: newsItem?.title || "Haber",
    author: comment.author,
    content: comment.content,
    createdAt: "Az önce",
    likes: 0,
    dislikes: 0,
    parentId: comment.parentId || null,
    replyToAuthor: comment.replyToAuthor || undefined,
    status: "approved",
  };
  store.comments = [newComment, ...store.comments];
  saveStore(store);
  return newComment;
}

export async function voteComment(
  commentId: string,
  voteType: "up" | "down",
  action: "add" | "remove" | "switch" = "add"
): Promise<Comment | null> {
  const store = loadStore();
  const comment = store.comments.find((c) => c.id === commentId);
  if (!comment) return null;

  if (typeof comment.likes !== "number") comment.likes = 0;
  if (typeof comment.dislikes !== "number") comment.dislikes = 0;

  if (action === "add") {
    if (voteType === "up") {
      comment.likes += 1;
    } else {
      comment.dislikes += 1;
    }
  } else if (action === "remove") {
    if (voteType === "up") {
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    }
  } else if (action === "switch") {
    if (voteType === "up") {
      comment.likes += 1;
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    } else {
      comment.dislikes += 1;
      comment.likes = Math.max(0, comment.likes - 1);
    }
  }

  saveStore(store);
  return { ...comment };
}

export async function updateCommentStatus(
  id: string,
  status: "approved" | "pending" | "rejected"
): Promise<boolean> {
  const store = loadStore();
  const found = store.comments.find((c) => c.id === id);
  if (!found) return false;
  found.status = status;
  saveStore(store);
  return true;
}

export async function deleteComment(id: string): Promise<boolean> {
  const store = loadStore();
  const initialLength = store.comments.length;
  store.comments = store.comments.filter((c) => c.id !== id);
  saveStore(store);
  return store.comments.length < initialLength;
}

// 3. KÖŞE YAZARLARI & MAKALE ARŞİVİ METOTLARI
export async function getColumnists(): Promise<Columnist[]> {
  const store = loadStore();
  return [...store.columnists];
}

export async function getColumnistById(id: string): Promise<Columnist | null> {
  const store = loadStore();
  const found = store.columnists.find((c) => c.id === id || c.slug === id);
  return found ? { ...found } : null;
}

export async function getColumnistBySlug(identifier: string): Promise<Columnist | null> {
  const store = loadStore();
  const found = store.columnists.find(
    (c) =>
      c.articleSlug === identifier ||
      c.slug === identifier ||
      c.id === identifier ||
      c.articles?.some((a) => a.slug === identifier || a.id === identifier)
  );
  return found ? { ...found } : null;
}

export async function getArticleBySlug(
  identifier: string
): Promise<{ article: ColumnistArticle; columnist: Columnist } | null> {
  const store = loadStore();
  for (const columnist of store.columnists) {
    if (columnist.articles && Array.isArray(columnist.articles)) {
      const match = columnist.articles.find(
        (a) => a.slug === identifier || a.id === identifier
      );
      if (match) {
        return { article: match, columnist };
      }
    }
    if (columnist.articleSlug === identifier) {
      const fallbackArticle: ColumnistArticle = {
        id: "art-" + columnist.id,
        authorId: columnist.id,
        title: columnist.articleTitle,
        slug: columnist.articleSlug,
        date: columnist.articleDate,
        excerpt: columnist.excerpt,
        content: columnist.content,
      };
      return { article: fallbackArticle, columnist };
    }
  }
  return null;
}

export async function addColumnist(columnistData: Columnist): Promise<Columnist> {
  const store = loadStore();

  const slug =
    columnistData.slug ||
    columnistData.name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const initialArticles: ColumnistArticle[] =
    columnistData.articles && columnistData.articles.length > 0
      ? columnistData.articles
      : columnistData.articleTitle
      ? [
          {
            id: "art-" + Date.now(),
            authorId: columnistData.id,
            title: columnistData.articleTitle,
            slug: columnistData.articleSlug || slug + "-yazisi",
            date: columnistData.articleDate,
            excerpt: columnistData.excerpt,
            content: columnistData.content,
            views: 1,
          },
        ]
      : [];

  const newCol: Columnist = {
    ...columnistData,
    slug,
    articles: initialArticles,
  };

  store.columnists = [newCol, ...store.columnists];
  saveStore(store);
  return newCol;
}

export async function updateColumnist(
  id: string,
  data: Partial<Columnist>
): Promise<Columnist | null> {
  const store = loadStore();
  const index = store.columnists.findIndex((c) => c.id === id);
  if (index === -1) return null;

  store.columnists[index] = {
    ...store.columnists[index],
    ...data,
  };
  saveStore(store);
  return { ...store.columnists[index] };
}

export async function deleteColumnist(id: string): Promise<boolean> {
  const store = loadStore();
  const initialLength = store.columnists.length;
  store.columnists = store.columnists.filter((c) => c.id !== id);
  saveStore(store);
  return store.columnists.length < initialLength;
}

export async function addArticleToColumnist(
  authorId: string,
  articleData: Omit<ColumnistArticle, "id">
): Promise<{ author: Columnist; article: ColumnistArticle } | null> {
  const store = loadStore();
  const author = store.columnists.find((c) => c.id === authorId);
  if (!author) return null;

  const newArticle: ColumnistArticle = {
    ...articleData,
    id: "art-" + Date.now(),
    views: articleData.views || 1,
    createdAt: new Date().toISOString(),
  };

  author.articles = [newArticle, ...(author.articles || [])];

  // Yazarın güncel / son makale alanlarını senkronize et
  author.articleTitle = newArticle.title;
  author.articleDate = newArticle.date;
  author.articleSlug = newArticle.slug;
  author.excerpt = newArticle.excerpt;
  author.content = newArticle.content;

  saveStore(store);
  return { author: { ...author }, article: newArticle };
}

export async function updateColumnistArticle(
  authorId: string,
  articleId: string,
  updates: Partial<ColumnistArticle>
): Promise<{ author: Columnist; article: ColumnistArticle } | null> {
  const store = loadStore();
  const author = store.columnists.find((c) => c.id === authorId);
  if (!author || !author.articles) return null;

  const artIndex = author.articles.findIndex((a) => a.id === articleId);
  if (artIndex === -1) return null;

  author.articles[artIndex] = {
    ...author.articles[artIndex],
    ...updates,
  };

  // Eğer güncellenen makale ilk (en son) makaleyse ana alanları güncelle
  if (artIndex === 0) {
    const latest = author.articles[0];
    author.articleTitle = latest.title;
    author.articleDate = latest.date;
    author.articleSlug = latest.slug;
    author.excerpt = latest.excerpt;
    author.content = latest.content;
  }

  saveStore(store);
  return { author: { ...author }, article: { ...author.articles[artIndex] } };
}

export async function deleteColumnistArticle(
  authorId: string,
  articleId: string
): Promise<boolean> {
  const store = loadStore();
  const author = store.columnists.find((c) => c.id === authorId);
  if (!author || !author.articles) return false;

  author.articles = author.articles.filter((a) => a.id !== articleId);

  // Kalan en son makaleyi güncelle
  if (author.articles.length > 0) {
    const latest = author.articles[0];
    author.articleTitle = latest.title;
    author.articleDate = latest.date;
    author.articleSlug = latest.slug;
    author.excerpt = latest.excerpt;
    author.content = latest.content;
  }

  saveStore(store);
  return true;
}

// 4. KATEGORİ METOTLARI
export async function getAllCategories(): Promise<CategoryItem[]> {
  const store = loadStore();
  if (!store.categories || !Array.isArray(store.categories)) {
    store.categories = [...CATEGORIES];
    saveStore(store);
  }
  return store.categories.map((cat) => ({
    ...cat,
    layoutVariant: cat.layoutVariant || "classic-split",
    count: store.news.filter((n) => n.category === cat.key).length,
  }));
}

export const getCategories = getAllCategories;

export async function addCategory(category: CategoryItem): Promise<CategoryItem> {
  const store = loadStore();
  if (!store.categories) store.categories = [...CATEGORIES];
  const exists = store.categories.find((c) => c.key === category.key);
  if (exists) {
    throw new Error(`"${category.key}" kodlu kategori zaten mevcut.`);
  }
  const newCat: CategoryItem = {
    ...category,
    layoutVariant: category.layoutVariant || "classic-split",
  };
  store.categories = [...store.categories, newCat];
  saveStore(store);
  return newCat;
}

export async function updateCategory(
  oldKey: string,
  data: { name: string; key: string; badgeColor?: string; layoutVariant?: CategoryLayoutVariant }
): Promise<CategoryItem | null> {
  const store = loadStore();
  if (!store.categories) store.categories = [...CATEGORIES];
  const index = store.categories.findIndex((c) => c.key === oldKey);
  if (index === -1) return null;

  const newKey = data.key.toLowerCase().trim();
  if (newKey !== oldKey && store.categories.some((c) => c.key === newKey)) {
    throw new Error(`"${newKey}" kodlu başka bir kategori zaten mevcut.`);
  }

  const updatedCategory: CategoryItem = {
    ...store.categories[index],
    name: data.name.trim(),
    key: newKey,
    href: `/kategori/${newKey}`,
    badgeColor: data.badgeColor || store.categories[index].badgeColor || "bg-red-600",
    layoutVariant: data.layoutVariant || store.categories[index].layoutVariant || "classic-split",
  };

  store.categories[index] = updatedCategory;

  // İsim veya kod değiştiyse haberleri otomatik güncelle
  if (newKey !== oldKey || data.name.trim() !== store.categories[index].name) {
    store.news = store.news.map((news) => {
      if (news.category === oldKey) {
        return {
          ...news,
          category: newKey,
          categoryTitle: data.name.trim(),
        };
      }
      return news;
    });
  }

  saveStore(store);
  return updatedCategory;
}

export async function deleteCategory(key: string): Promise<{ success: boolean; reassignedNewsCount: number }> {
  const store = loadStore();
  if (!store.categories) store.categories = [...CATEGORIES];

  if (store.categories.length <= 1) {
    throw new Error("En az bir kategori bulunmalıdır. Son kategori silinemez.");
  }

  const index = store.categories.findIndex((c) => c.key === key);
  if (index === -1) {
    throw new Error("Kategori bulunamadı.");
  }

  store.categories.splice(index, 1);

  // Bu kategorideki haberleri 'gundem' veya ilk kategoriye aktar
  const fallbackCat = store.categories.find((c) => c.key === "gundem") || store.categories[0];
  let reassignedCount = 0;
  store.news = store.news.map((news) => {
    if (news.category === key) {
      reassignedCount++;
      return {
        ...news,
        category: fallbackCat.key,
        categoryTitle: fallbackCat.name,
      };
    }
    return news;
  });

  saveStore(store);
  return { success: true, reassignedNewsCount: reassignedCount };
}

export async function reorderCategories(orderedKeys: string[]): Promise<CategoryItem[]> {
  const store = loadStore();
  if (!store.categories) store.categories = [...CATEGORIES];

  const keyMap = new Map(store.categories.map((c) => [c.key, c]));
  const reordered: CategoryItem[] = [];

  for (const key of orderedKeys) {
    const item = keyMap.get(key);
    if (item) {
      reordered.push(item);
      keyMap.delete(key);
    }
  }

  for (const item of keyMap.values()) {
    reordered.push(item);
  }

  store.categories = reordered;
  saveStore(store);
  return store.categories.map((cat) => ({
    ...cat,
    count: store.news.filter((n) => n.category === cat.key).length,
  }));
}

// 5. SİTE AYARLARI METOTLARI
export { getSiteSettings, saveSiteSettings as updateSiteSettings } from "@/lib/services/settings-service";

// 6. FİNANS VE HAVA DURUMU
export async function getFinanceRates(): Promise<FinanceRate[]> {
  try {
    const { getLiveFinanceRates } = await import("@/lib/services/finance-service");
    return await getLiveFinanceRates();
  } catch {
    return INITIAL_FINANCE_RATES;
  }
}

export async function getWeatherInfo(city: string = "istanbul"): Promise<WeatherInfo> {
  try {
    const { getLiveWeather } = await import("@/lib/services/weather-service");
    return await getLiveWeather(city);
  } catch {
    return INITIAL_WEATHER;
  }
}

// 7. FOTO GALERİ SERVİS METOTLARI
function slugifyText(text: string): string {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getPhotoGalleries(category?: string, limit?: number): Promise<PhotoGallery[]> {
  const store = loadStore();
  let list = [...(store.galleries || [])];
  if (category && category !== "all") {
    list = list.filter((g) => g.category === category);
  }
  if (limit && limit > 0) {
    list = list.slice(0, limit);
  }
  return list;
}

export async function getPhotoGalleryBySlug(slug: string): Promise<PhotoGallery | null> {
  const store = loadStore();
  const found = (store.galleries || []).find((g) => g.slug === slug);
  return found ? { ...found } : null;
}

export async function getPhotoGalleryById(id: string): Promise<PhotoGallery | null> {
  const store = loadStore();
  const found = (store.galleries || []).find((g) => g.id === id);
  return found ? { ...found } : null;
}

export async function createPhotoGallery(
  galleryData: Omit<PhotoGallery, "id" | "slug" | "viewCount" | "publishedAt"> & {
    id?: string;
    slug?: string;
    viewCount?: number;
    publishedAt?: string;
  }
): Promise<PhotoGallery> {
  const store = loadStore();
  const newId = galleryData.id || `gal-${Date.now()}`;
  const baseSlug = galleryData.slug || slugifyText(galleryData.title);

  let finalSlug = baseSlug;
  let counter = 1;
  while ((store.galleries || []).some((g) => g.slug === finalSlug)) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  const catMatch = (store.galleryCategories || []).find((c) => c.key === galleryData.category);

  const newGallery: PhotoGallery = {
    ...galleryData,
    id: newId,
    slug: finalSlug,
    categoryTitle: galleryData.categoryTitle || catMatch?.name || galleryData.category,
    categoryBadgeColor: galleryData.categoryBadgeColor || catMatch?.badgeColor || "bg-red-600",
    viewCount: galleryData.viewCount || 1,
    publishedAt:
      galleryData.publishedAt ||
      new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    slides: (galleryData.slides || []).map((slide, idx) => ({
      ...slide,
      id: slide.id || `s-${Date.now()}-${idx + 1}`,
      order: slide.order ?? idx + 1,
    })),
  };

  store.galleries = [newGallery, ...(store.galleries || [])];
  saveStore(store);
  return newGallery;
}

export async function updatePhotoGallery(
  id: string,
  galleryData: Partial<PhotoGallery>
): Promise<PhotoGallery | null> {
  const store = loadStore();
  const index = (store.galleries || []).findIndex((g) => g.id === id);
  if (index === -1) return null;

  const existing = store.galleries[index];
  const targetCategoryKey = galleryData.category || existing.category;
  const catMatch = (store.galleryCategories || []).find((c) => c.key === targetCategoryKey);

  const updatedGallery: PhotoGallery = {
    ...existing,
    ...galleryData,
    id: existing.id,
    categoryTitle:
      galleryData.categoryTitle ||
      (galleryData.category && catMatch ? catMatch.name : existing.categoryTitle),
    categoryBadgeColor:
      galleryData.categoryBadgeColor ||
      (galleryData.category && catMatch ? catMatch.badgeColor : existing.categoryBadgeColor),
    updatedAt: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    slides: galleryData.slides
      ? galleryData.slides.map((s, idx) => ({
          ...s,
          id: s.id || `s-${Date.now()}-${idx + 1}`,
          order: s.order ?? idx + 1,
        }))
      : existing.slides,
  };

  store.galleries[index] = updatedGallery;
  saveStore(store);
  return updatedGallery;
}

export async function deletePhotoGallery(id: string): Promise<boolean> {
  const store = loadStore();
  const initialLength = (store.galleries || []).length;
  store.galleries = (store.galleries || []).filter((g) => g.id !== id);
  if (store.galleries.length === initialLength) return false;
  saveStore(store);
  return true;
}

export async function incrementGalleryView(slugOrId: string): Promise<PhotoGallery | null> {
  const store = loadStore();
  const gallery = (store.galleries || []).find((g) => g.slug === slugOrId || g.id === slugOrId);
  if (!gallery) return null;
  gallery.viewCount = (gallery.viewCount || 0) + 1;
  saveStore(store);
  return { ...gallery };
}

// 8. GALERİ KATEGORİLERİ METOTLARI
export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  const store = loadStore();
  if (!store.galleryCategories || !Array.isArray(store.galleryCategories)) {
    store.galleryCategories = [...INITIAL_GALLERY_CATEGORIES];
    saveStore(store);
  }
  return store.galleryCategories.map((cat) => {
    const catGalleries = (store.galleries || []).filter((g) => g.category === cat.key);
    const totalPhotos = catGalleries.reduce((sum, g) => sum + (g.slides?.length || 0), 0);
    return {
      ...cat,
      count: catGalleries.length,
      photoCount: totalPhotos,
    };
  });
}

export async function addGalleryCategory(categoryData: {
  name: string;
  key?: string;
  badgeColor?: string;
  description?: string;
  coverImage?: string;
}): Promise<GalleryCategory> {
  const store = loadStore();
  if (!store.galleryCategories) {
    store.galleryCategories = [...INITIAL_GALLERY_CATEGORIES];
  }

  const baseKey = (categoryData.key?.trim() || slugifyText(categoryData.name)).toLowerCase();
  let key = baseKey;
  let counter = 1;
  while (store.galleryCategories.some((c) => c.key === key)) {
    key = `${baseKey}-${counter++}`;
  }

  const newCategory: GalleryCategory = {
    id: `gcat-${Date.now()}`,
    key,
    name: categoryData.name.trim(),
    badgeColor: categoryData.badgeColor || "bg-red-600",
    description: categoryData.description?.trim() || "",
    coverImage: categoryData.coverImage?.trim() || "",
  };

  store.galleryCategories = [...store.galleryCategories, newCategory];
  saveStore(store);
  return {
    ...newCategory,
    count: 0,
    photoCount: 0,
  };
}

export async function updateGalleryCategory(
  oldKey: string,
  data: {
    name: string;
    key?: string;
    badgeColor?: string;
    description?: string;
    coverImage?: string;
  }
): Promise<GalleryCategory | null> {
  const store = loadStore();
  if (!store.galleryCategories) {
    store.galleryCategories = [...INITIAL_GALLERY_CATEGORIES];
  }

  const index = store.galleryCategories.findIndex((c) => c.key === oldKey);
  if (index === -1) return null;

  const current = store.galleryCategories[index];
  const newKey = data.key ? data.key.trim().toLowerCase() : current.key;

  if (newKey !== oldKey && store.galleryCategories.some((c) => c.key === newKey)) {
    throw new Error(`"${newKey}" kodlu başka bir galeri kategorisi zaten mevcut.`);
  }

  const updatedCategory: GalleryCategory = {
    ...current,
    key: newKey,
    name: data.name.trim(),
    badgeColor: data.badgeColor || current.badgeColor || "bg-red-600",
    description: data.description !== undefined ? data.description.trim() : current.description,
    coverImage: data.coverImage !== undefined ? data.coverImage.trim() : current.coverImage,
  };

  store.galleryCategories[index] = updatedCategory;

  // İlgili tüm galerileri de otomatik güncelle
  if (store.galleries && Array.isArray(store.galleries)) {
    store.galleries = store.galleries.map((g) => {
      if (g.category === oldKey) {
        return {
          ...g,
          category: newKey,
          categoryTitle: updatedCategory.name,
          categoryBadgeColor: updatedCategory.badgeColor,
        };
      }
      return g;
    });
  }

  saveStore(store);
  const catGalleries = (store.galleries || []).filter((g) => g.category === newKey);
  const totalPhotos = catGalleries.reduce((sum, g) => sum + (g.slides?.length || 0), 0);
  return {
    ...updatedCategory,
    count: catGalleries.length,
    photoCount: totalPhotos,
  };
}

export async function deleteGalleryCategory(key: string): Promise<boolean> {
  const store = loadStore();
  if (!store.galleryCategories) {
    store.galleryCategories = [...INITIAL_GALLERY_CATEGORIES];
  }

  if (store.galleryCategories.length <= 1) {
    throw new Error("Sistemde en az bir galeri kategorisi bulunmalıdır.");
  }

  const initialLen = store.galleryCategories.length;
  store.galleryCategories = store.galleryCategories.filter((c) => c.key !== key);
  if (store.galleryCategories.length === initialLen) return false;

  // Silinen kategoriye ait galerileri ilk geçerli kategoriye aktar
  const fallback = store.galleryCategories[0];
  if (store.galleries && Array.isArray(store.galleries)) {
    store.galleries = store.galleries.map((g) => {
      if (g.category === key) {
        return {
          ...g,
          category: fallback.key,
          categoryTitle: fallback.name,
          categoryBadgeColor: fallback.badgeColor,
        };
      }
      return g;
    });
  }

  saveStore(store);
  return true;
}

// ==========================================
// VIDEO GALERİ SERVİSLERİ (DELEGASYON)
// ==========================================

import { YouTubeService } from "@/services/youtube.service";
import { VideoService } from "@/services/video.service";
import { VideoCategoryService } from "@/services/video-category.service";

export function extractYoutubeId(url: string): string | null {
  return YouTubeService.extractId(url);
}

export async function getVideoItems(categorySlug?: string, limit?: number): Promise<VideoItem[]> {
  return VideoService.getAllVideos({ category: categorySlug, limit });
}

export async function getVideoBySlug(slug: string): Promise<VideoItem | null> {
  return VideoService.getVideoBySlug(slug);
}

export async function getVideoById(id: string): Promise<VideoItem | null> {
  return VideoService.getVideoById(id);
}

export async function createVideoItem(data: Partial<VideoItem>): Promise<VideoItem> {
  return VideoService.createVideo({
    title: data.title || "Yeni Video",
    description: data.description,
    youtubeUrl: data.youtubeUrl || "",
    thumbnailUrl: data.thumbnailUrl,
    duration: data.duration,
    category: data.category || "savunma-teknoloji",
    categoryTitle: data.categoryTitle,
    categoryBadgeColor: data.categoryBadgeColor,
    author: data.author,
    tags: data.tags,
    isFeatured: data.isFeatured,
  });
}

export async function updateVideoItem(id: string, data: Partial<VideoItem>): Promise<VideoItem | null> {
  return VideoService.updateVideo(id, data);
}

export async function deleteVideoItem(id: string): Promise<boolean> {
  return VideoService.softDeleteVideo(id);
}

export async function incrementVideoView(idOrSlug: string): Promise<number | null> {
  return VideoService.incrementViewCount(idOrSlug);
}

// ==========================================
// VIDEO KATEGORİ SERVİSLERİ (DELEGASYON)
// ==========================================

export async function getVideoCategories(): Promise<VideoCategory[]> {
  return VideoCategoryService.getCategories(true);
}

export async function addVideoCategory(data: {
  name: string;
  slug?: string;
  color?: string;
  order?: number;
}): Promise<VideoCategory> {
  return VideoCategoryService.createCategory(data);
}

export async function updateVideoCategory(
  id: string,
  data: Partial<VideoCategory>
): Promise<VideoCategory | null> {
  return VideoCategoryService.updateCategory(id, data);
}

export async function deleteVideoCategory(id: string): Promise<boolean> {
  return VideoCategoryService.deleteCategory(id, { strategy: "uncategorize" });
}

// ==========================================
// 10. ANKET & KAMUOYU YOKLAMASI SERVİSLERİ
// ==========================================

export const INITIAL_POLLS: Poll[] = [
  {
    id: "poll-1",
    question: "Türkiye'nin yerli savunma ve havacılık projelerinin geleceği hakkında ne düşünüyorsunuz?",
    description: "KAAN, Kızılelma, Bayraktar TB3 ve TUSAŞ motor projeleri kapsamında yürütülen teknolojik atılımlar hakkındaki görüşünüz.",
    category: "teknoloji",
    isFeatured: true,
    status: "active",
    totalVotes: 1420,
    startDate: "15 Eylül 2026",
    endDate: "30 Eylül 2026",
    createdAt: "15 Eylül 2026",
    options: [
      { id: "opt-1", text: "Çok başarılı buluyorum, tam bağımsızlık için kritik.", votes: 980, color: "bg-emerald-600" },
      { id: "opt-2", text: "Gelişmeleri olumlu buluyorum, hızlandırılmalı.", votes: 320, color: "bg-blue-600" },
      { id: "opt-3", text: "Daha fazla sivil ve küresel iş birliği yapılmalı.", votes: 85, color: "bg-amber-600" },
      { id: "opt-4", text: "Yeterli bilgiye sahip değilim / Kararsızım.", votes: 35, color: "bg-zinc-600" },
    ],
  },
  {
    id: "poll-2",
    question: "Merkez Bankası'nın yıl sonu enflasyon ve faiz politikası beklentinizi karşılıyor mu?",
    description: "Son faiz kararları ve dezenflasyon süreci ışığında ekonomi politikalarının etkisini değerlendirin.",
    category: "ekonomi",
    isFeatured: false,
    status: "active",
    totalVotes: 890,
    startDate: "16 Eylül 2026",
    endDate: "1 Ekim 2026",
    createdAt: "16 Eylül 2026",
    options: [
      { id: "opt-2-1", text: "Evet, piyasalara güven veriyor ve olumlu.", votes: 410, color: "bg-emerald-600" },
      { id: "opt-2-2", text: "Kısmen, reel sektör daha fazla desteklenmeli.", votes: 340, color: "bg-blue-600" },
      { id: "opt-2-3", text: "Hayır, henüz yeterli sonuç vermedi.", votes: 140, color: "bg-red-600" },
    ],
  },
];

export async function getPolls(): Promise<Poll[]> {
  const store = loadStore();
  return store.polls || [...INITIAL_POLLS];
}

export async function getActiveFeaturedPoll(): Promise<Poll | null> {
  const store = loadStore();
  const list = store.polls || [...INITIAL_POLLS];
  const featured = list.find((p) => p.isFeatured && p.status === "active");
  if (featured) return { ...featured };
  const firstActive = list.find((p) => p.status === "active");
  return firstActive ? { ...firstActive } : null;
}

export async function getPollById(id: string): Promise<Poll | null> {
  const store = loadStore();
  const found = (store.polls || []).find((p) => p.id === id);
  return found ? { ...found } : null;
}

export async function createPoll(pollData: {
  question: string;
  description?: string;
  category?: string;
  options: Array<{ text: string; color?: string }>;
  isFeatured?: boolean;
  status?: "active" | "draft" | "closed";
  startDate?: string;
  endDate?: string;
}): Promise<Poll> {
  const store = loadStore();
  if (!store.polls) {
    store.polls = [...INITIAL_POLLS];
  }

  // Eğer yeni anket isFeatured ise, diğerlerini isFeatured: false yap
  if (pollData.isFeatured) {
    store.polls = store.polls.map((p) => ({ ...p, isFeatured: false }));
  }

  const newPoll: Poll = {
    id: `poll-${Date.now()}`,
    question: pollData.question.trim(),
    description: pollData.description?.trim() || "",
    category: pollData.category || "gundem",
    totalVotes: 0,
    status: pollData.status || "active",
    isFeatured: Boolean(pollData.isFeatured),
    startDate:
      pollData.startDate ||
      new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    endDate: pollData.endDate || "",
    createdAt: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    options: pollData.options.map((opt, idx) => ({
      id: `opt-${Date.now()}-${idx + 1}`,
      text: opt.text.trim(),
      votes: 0,
      color: opt.color || ["bg-emerald-600", "bg-blue-600", "bg-amber-600", "bg-purple-600", "bg-red-600"][idx % 5],
    })),
  };

  store.polls = [newPoll, ...store.polls];
  saveStore(store);
  return newPoll;
}

export async function updatePoll(
  id: string,
  pollData: Partial<Poll>
): Promise<Poll | null> {
  const store = loadStore();
  if (!store.polls) {
    store.polls = [...INITIAL_POLLS];
  }

  const index = store.polls.findIndex((p) => p.id === id);
  if (index === -1) return null;

  // Eğer bu anket isFeatured yapılıyorsa, diğerlerini false yap
  if (pollData.isFeatured) {
    store.polls = store.polls.map((p) => (p.id === id ? p : { ...p, isFeatured: false }));
  }

  const existing = store.polls[index];
  const updatedPoll: Poll = {
    ...existing,
    ...pollData,
    id: existing.id,
    updatedAt: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
  };

  store.polls[index] = updatedPoll;
  saveStore(store);
  return updatedPoll;
}

export async function deletePoll(id: string): Promise<boolean> {
  const store = loadStore();
  if (!store.polls) {
    store.polls = [...INITIAL_POLLS];
  }

  const initialLength = store.polls.length;
  store.polls = store.polls.filter((p) => p.id !== id);
  if (store.polls.length === initialLength) return false;

  // Eğer silinen anket isFeatured idiyse ve kalan anketler varsa, ilk aktifi featured yap
  if (!store.polls.some((p) => p.isFeatured)) {
    const firstActive = store.polls.find((p) => p.status === "active");
    if (firstActive) firstActive.isFeatured = true;
  }

  saveStore(store);
  return true;
}

export async function votePoll(
  pollId: string,
  optionId: string
): Promise<{ poll: Poll; success: boolean; message?: string }> {
  const store = loadStore();
  if (!store.polls) {
    store.polls = [...INITIAL_POLLS];
  }

  const poll = store.polls.find((p) => p.id === pollId);
  if (!poll) {
    return { poll: null as any, success: false, message: "Anket bulunamadı." };
  }

  if (poll.status !== "active") {
    return { poll, success: false, message: "Bu anket oylamaya kapalıdır." };
  }

  const option = poll.options.find((o) => o.id === optionId);
  if (!option) {
    return { poll, success: false, message: "Geçersiz anket seçeneği." };
  }

  option.votes = (option.votes || 0) + 1;
  poll.totalVotes = (poll.totalVotes || 0) + 1;
  poll.updatedAt = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  saveStore(store);
  return { poll: { ...poll }, success: true };
}

export async function resetPollVotes(id: string): Promise<Poll | null> {
  const store = loadStore();
  if (!store.polls) {
    store.polls = [...INITIAL_POLLS];
  }

  const poll = store.polls.find((p) => p.id === id);
  if (!poll) return null;

  poll.totalVotes = 0;
  poll.options = poll.options.map((o) => ({ ...o, votes: 0 }));
  poll.updatedAt = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  saveStore(store);
  return { ...poll };
}

/**
 * Haberler içerisinde başlık, özet, içerik, yazar ve etiketlere göre Türkçe duyarsız arama yapar.
 */
export async function searchNews(query: string): Promise<NewsItem[]> {
  const store = loadStore();
  const q = (query || "").trim().toLocaleLowerCase("tr-TR");
  if (!q) return [];

  return (store.news || []).filter((item) => {
    const title = (item.title || "").toLocaleLowerCase("tr-TR");
    const summary = (item.summary || "").toLocaleLowerCase("tr-TR");
    const content = (item.content || "").toLocaleLowerCase("tr-TR");
    const author = (item.author?.name || "").toLocaleLowerCase("tr-TR");
    const tags = Array.isArray(item.tags)
      ? item.tags.map((t) => (t || "").toLocaleLowerCase("tr-TR"))
      : [];

    return (
      title.includes(q) ||
      summary.includes(q) ||
      content.includes(q) ||
      author.includes(q) ||
      tags.some((t) => t.includes(q))
    );
  });
}

export { getHomepageLayout, saveHomepageLayout, resetHomepageLayout } from "./services/layout-service";
export { getSidebarWidgets, saveSidebarWidgets, resetSidebarWidgets, addCustomSidebarWidget, deleteSidebarWidget } from "./services/sidebar-service";
