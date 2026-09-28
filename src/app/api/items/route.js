import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import { buildSearchQuery } from "@/lib/search";
import { getAdminLocation } from "@/lib/authHelpers";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const locationFilter = searchParams.get("location") || "";

    const query = buildSearchQuery(q);

    // Apply location filter if provided
    if (locationFilter && ["kim", "kosamba"].includes(locationFilter.toLowerCase())) {
      if (query.$or) {
        // Wrap existing $or with $and to combine with location filter
        const searchCondition = { $or: query.$or };
        Object.assign(query, { $and: [searchCondition, { location: locationFilter.toLowerCase() }] });
        delete query.$or;
      } else {
        query.location = locationFilter.toLowerCase();
      }
    }

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Item.countDocuments(query),
    ]);

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

    // Get admin's location from JWT
    const adminLocation = await getAdminLocation(request);
    if (!adminLocation) {
      return NextResponse.json({ error: "Unauthorized: admin location not found" }, { status: 401 });
    }

    const body = await request.json();

    const { machineName, sapCode, materialDescription, storeLocation, images } = body;

    if (!machineName) {
      return NextResponse.json({ error: "Machine Name is required" }, { status: 400 });
    }

    const newItem = new Item({
      machineName,
      sapCode,
      materialDescription,
      storeLocation,
      location: adminLocation,
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
