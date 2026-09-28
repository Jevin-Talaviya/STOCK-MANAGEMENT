import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import { deleteR2Object } from "@/lib/r2";
import { getAdminLocation } from "@/lib/authHelpers";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const item = await Item.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/items/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    // Get admin's location from JWT
    const adminLocation = await getAdminLocation(request);
    if (!adminLocation) {
      return NextResponse.json({ error: "Unauthorized: admin location not found" }, { status: 401 });
    }

    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Ensure admin can only edit items from their own location
    if (existingItem.location && existingItem.location !== adminLocation) {
      return NextResponse.json({ error: "You can only edit items from your assigned location" }, { status: 403 });
    }

    const { machineName, sapCode, materialDescription, storeLocation, images } = body;

    if (!machineName) {
      return NextResponse.json({ error: "Machine Name is required" }, { status: 400 });
    }

    // Compare images to delete the removed ones
    if (images && Array.isArray(images)) {
      const removedImages = existingItem.images.filter((img) => !images.includes(img));
      for (const oldImg of removedImages) {
        await deleteR2Object(oldImg);
      }
      existingItem.images = images;
    }

    existingItem.machineName = machineName;
    existingItem.sapCode = sapCode;
    existingItem.materialDescription = materialDescription;
    existingItem.storeLocation = storeLocation;

    const updatedItem = await existingItem.save();
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PUT /api/items/[id] failed:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Get admin's location from JWT
    const adminLocation = await getAdminLocation(request);
    if (!adminLocation) {
      return NextResponse.json({ error: "Unauthorized: admin location not found" }, { status: 401 });
    }

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Ensure admin can only delete items from their own location
    if (item.location && item.location !== adminLocation) {
      return NextResponse.json({ error: "You can only delete items from your assigned location" }, { status: 403 });
    }

    // Delete associated photos from R2
    if (item.images && item.images.length > 0) {
      for (const imgUrl of item.images) {
        await deleteR2Object(imgUrl);
      }
    }

    await Item.findByIdAndDelete(id);
    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/items/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
