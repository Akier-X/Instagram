import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedDriveClient } from "@/lib/server/google";

export async function GET(request: NextRequest) {
  const folderId = request.nextUrl.searchParams.get("folderId") ?? "root";
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "100");

  try {
    const drive = await getAuthorizedDriveClient();
    const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`;
    const result = await drive.files.list({
      q: query,
      pageSize: Math.min(Math.max(pageSize, 1), 200),
      fields:
        "files(id,name,mimeType,createdTime,modifiedTime,imageMediaMetadata/time,imageMediaMetadata/width,imageMediaMetadata/height,thumbnailLink,webViewLink)",
      orderBy: "createdTime desc",
    });

    const items = (result.data.files ?? []).map((file) => {
      const shotAt = file.imageMediaMetadata?.time || file.createdTime || file.modifiedTime || null;
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        shotAt,
        width: file.imageMediaMetadata?.width ? Number(file.imageMediaMetadata.width) : null,
        height: file.imageMediaMetadata?.height ? Number(file.imageMediaMetadata.height) : null,
        thumbnailUrl: file.thumbnailLink,
        webViewUrl: file.webViewLink,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
