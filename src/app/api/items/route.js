import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import { buildSearchQuery } from "@/lib/search";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const query = buildSearchQuery(q);
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Item.countDocuments(query),
    ]);

    // Map _id to id or keep as is. Usually antd Table uses rowKey='_id' or 'id'
    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("GET /api/items failed:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { machineName, serialNumber, sapCode, materialDescription, partNo, specification, storeLocation, images } = body;

    if (!machineName || !partNo) {
      return NextResponse.json({ error: "Machine Name and Part Number are required" }, { status: 400 });
    }

    const newItem = new Item({
      machineName,
      serialNumber,
      sapCode,
      materialDescription,
      partNo,
      specification,
      storeLocation,
      images: images || [],
    });

    const savedItem = await newItem.save();
    return NextResponse.json(savedItem, { status: 201 });
  } catch (error) {
    console.error("POST /api/items failed:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
