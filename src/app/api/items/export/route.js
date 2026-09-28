import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import * as xlsx from "xlsx";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const locationFilter = searchParams.get("location") || "";

    // Build query — optionally filter by location
    const query = {};
    if (locationFilter && ["kim", "kosamba"].includes(locationFilter.toLowerCase())) {
      query.location = locationFilter.toLowerCase();
    }

    // Fetch items sorted by machine name
    const items = await Item.find(query).sort({ machineName: 1 }).lean();

    // Map to row objects
    const data = items.map((item) => {
      const imageLinks = item.images && item.images.length > 0 ? item.images.join(", ") : "";
      return {
        "Machine Name": item.machineName || "",
        "SAP Code": item.sapCode || "",
        "Material Description": item.materialDescription || "",
        "Store Location": item.storeLocation || "",
        "Location": item.location || "",
        "Thumbnail Image Links": imageLinks
      };
    });

    // Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Inventory");

    // Write to buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    const fileName = locationFilter 
      ? `${locationFilter.toLowerCase()}_inventory_export.xlsx`
      : "warehouse_inventory_export.xlsx";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${fileName}`,
      },
    });
  } catch (error) {
    console.error("GET /api/items/export failed:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
