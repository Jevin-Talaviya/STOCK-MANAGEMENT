import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import { deleteR2Object } from "@/lib/r2";

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

    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
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

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
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
