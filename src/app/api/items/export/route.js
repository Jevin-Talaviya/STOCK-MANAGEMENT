import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import * as xlsx from "xlsx";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Fetch all items sorted by machine name
    const items = await Item.find({}).sort({ machineName: 1 }).lean();

    // Map to row objects matching the column positions, with Thumbnail Image Links in the last column
    const data = items.map((item) => {
      const imageLinks = item.images && item.images.length > 0 ? item.images.join(", ") : "";
      return {
        "Machine Name": item.machineName || "",
        "Serial Number": item.serialNumber || "",
        "SAP Code": item.sapCode || "",
        "Material Description": item.materialDescription || "",
        "Part Number": item.partNo || "",
        "Specification": item.specification || "",
        "Store Location": item.storeLocation || "",
        "Thumbnail Image Links": imageLinks
      };
    });

    // Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Inventory");

    // Write to buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=warehouse_inventory_export.xlsx",
      },
    });
  } catch (error) {
    console.error("GET /api/items/export failed:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
