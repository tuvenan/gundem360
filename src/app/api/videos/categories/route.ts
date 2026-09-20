/**
 * Video Kategori API Router
 * Clean Architecture - Router Layer
 * Sorumluluk: HTTP rotalama ve istekleri VideoCategoryController'a delege etme.
 */

import { VideoCategoryController } from "@/controllers/video-category.controller";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return VideoCategoryController.getCategories(request);
}

export async function POST(request: Request) {
  return VideoCategoryController.createCategory(request);
}

export async function PUT(request: Request) {
  return VideoCategoryController.updateCategory(request);
}

export async function DELETE(request: Request) {
  return VideoCategoryController.deleteCategory(request);
}
