import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import { deleteR2Object } from "@/lib/r2";
import { getAdminLocation } from "@/lib/authHelpers";

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { ids, deleteAll } = body;

    // Get admin's location from JWT
    const adminLocation = await getAdminLocation(request);
    if (!adminLocation) {
      return NextResponse.json({ error: "Unauthorized: admin location not found" }, { status: 401 });
    }

    if (!deleteAll && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ error: "No IDs provided for deletion" }, { status: 400 });
    }

    // Scope deletion to admin's location
    const locationFilter = { location: adminLocation };

    // Find items to retrieve their image URLs (scoped to location)
    const itemsToDelete = deleteAll 
      ? await Item.find(locationFilter).select("images").lean()
      : await Item.find({ _id: { $in: ids }, ...locationFilter }).select("images").lean();

    // Collect all image URLs
    const imageUrls = [];
    for (const item of itemsToDelete) {
      if (item.images && item.images.length > 0) {
        imageUrls.push(...item.images);
      }
    }

    // Delete matching documents (scoped to location)
    const result = deleteAll
      ? await Item.deleteMany(locationFilter)
      : await Item.deleteMany({ _id: { $in: ids }, ...locationFilter });

    // Best-effort delete images from R2
    for (const url of imageUrls) {
      await deleteR2Object(url);
    }

    return NextResponse.json({
      message: deleteAll ? `All ${adminLocation} items deleted successfully` : `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("POST /api/items/bulk-delete failed:", error);
    return NextResponse.json({ error: "Failed to perform bulk deletion" }, { status: 500 });
  }
}
