/**
 * Video API Router
 * Clean Architecture - Router Layer
 * Sorumluluk: HTTP rotalama ve istekleri VideoController'a delege etme.
 */

import { VideoController } from "@/controllers/video.controller";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return VideoController.getVideos(request);
}

export async function POST(request: Request) {
  return VideoController.createVideo(request);
}

export async function PUT(request: Request) {
  return VideoController.updateVideo(request);
}

export async function DELETE(request: Request) {
  return VideoController.deleteVideo(request);
}
