"use client";

import { CategoryItem } from "@/types/news";
import { FolderTree } from "lucide-react";
import CategoryManager from "@/components/admin/CategoryManager";

interface KategorilerClientProps {
  initialCategories: CategoryItem[];
}

export default function KategorilerClient({
  initialCategories,
}: KategorilerClientProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Üst Bar */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-red-600" />
          Kategori Yönetimi
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Haber portalındaki ana menü ve filtreleme kategorilerini ekleyin, silin, düzenleyin veya sırasını değiştirin.
        </p>
      </div>

      <CategoryManager initialCategories={initialCategories} />
    </div>
  );
}
