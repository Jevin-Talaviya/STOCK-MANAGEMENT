import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import { deleteR2Object } from "@/lib/r2";

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { ids, deleteAll } = body;

    if (!deleteAll && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ error: "No IDs provided for deletion" }, { status: 400 });
    }

    // Find items to retrieve their image URLs
    const itemsToDelete = deleteAll 
      ? await Item.find({}).select("images").lean()
      : await Item.find({ _id: { $in: ids } }).select("images").lean();

    // Collect all image URLs
    const imageUrls = [];
    for (const item of itemsToDelete) {
      if (item.images && item.images.length > 0) {
        imageUrls.push(...item.images);
      }
    }

    // Delete matching documents
    const result = deleteAll
      ? await Item.deleteMany({})
      : await Item.deleteMany({ _id: { $in: ids } });

    // Best-effort delete images from R2
    for (const url of imageUrls) {
      await deleteR2Object(url);
    }

    return NextResponse.json({
      message: deleteAll ? "All items deleted successfully" : `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("POST /api/items/bulk-delete failed:", error);
    return NextResponse.json({ error: "Failed to perform bulk deletion" }, { status: 500 });
  }
}
