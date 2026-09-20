/**
 * YouTube Entegrasyon Servisi
 * Clean Architecture & SOLID - Single Responsibility Principle
 * Sorumluluk: Yalnızca YouTube video kaynaklarının doğrulanması, ID ayrıştırması ve URL formatlaması.
 */

export interface YouTubeValidationResult {
  isValid: boolean;
  youtubeId: string | null;
  canonicalUrl: string | null;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  error?: string;
}

export class YouTubeService {
  private static readonly YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

  /**
   * Kullanıcı tarafından girilen URL veya Video ID'sini katı şekilde ayrıştırır ve doğrular.
   * Yalnızca YouTube platformunu kabul eder; Vimeo, Dailymotion vb. diğer kaynakları reddeder.
   */
  public static extractId(input: string): string | null {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim();

    // 1. Doğrudan 11 karakterlik geçerli YouTube ID kontrolü
    if (this.YOUTUBE_ID_REGEX.test(trimmed)) {
      return trimmed;
    }

    // 2. Yalnızca YouTube alan adları içeren URL'leri kabul et
    const isYouTubeDomain =
      trimmed.includes("youtube.com") ||
      trimmed.includes("youtu.be") ||
      trimmed.includes("youtube-nocookie.com");

    if (!isYouTubeDomain) {
      return null;
    }

    // 3. Desteklenen YouTube URL desenleri:
    // watch?v=ID, youtu.be/ID, embed/ID, shorts/ID, v/ID
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i,
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1] && this.YOUTUBE_ID_REGEX.test(match[1])) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Kapsamlı doğrulama ve standart YouTube URL'lerinin üretimi.
   */
  public static validate(input: string): YouTubeValidationResult {
    if (!input || !input.trim()) {
      return {
        isValid: false,
        youtubeId: null,
        canonicalUrl: null,
        thumbnailUrl: null,
        embedUrl: null,
        error: "YouTube bağlantısı veya video ID'si girilmelidir.",
      };
    }

    const id = this.extractId(input);
    if (!id) {
      return {
        isValid: false,
        youtubeId: null,
        canonicalUrl: null,
        thumbnailUrl: null,
        embedUrl: null,
        error:
          "Geçersiz video kaynağı. Tüm videolar yalnızca YouTube üzerinden eklenebilir (örn: https://www.youtube.com/watch?v=... veya youtu.be/...).",
      };
    }

    return {
      isValid: true,
      youtubeId: id,
      canonicalUrl: this.buildCanonicalUrl(id),
      thumbnailUrl: this.buildThumbnailUrl(id),
      embedUrl: this.buildEmbedUrl(id),
    };
  }

  /**
   * Standart YouTube kanonik URL üretir
   */
  public static buildCanonicalUrl(id: string): string {
    return `https://www.youtube.com/watch?v=${id}`;
  }

  /**
   * Yüksek çözünürlüklü YouTube kapak görseli URL'i üretir
   */
  public static buildThumbnailUrl(id: string, quality: "max" | "hq" | "mq" = "max"): string {
    if (quality === "mq") return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    if (quality === "hq") return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  }

  /**
   * Güvenli YouTube no-cookie embed URL'i üretir
   */
  public static buildEmbedUrl(id: string, autoplay: boolean = false): string {
    return `https://www.youtube-nocookie.com/embed/${id}${autoplay ? "?autoplay=1&rel=0" : "?rel=0"}`;
  }
}
