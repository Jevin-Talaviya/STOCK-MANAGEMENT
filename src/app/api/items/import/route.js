import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import { connectToDatabase } from "@/lib/mongodb";
import Item from "@/models/Item";
import { getHeaderMapping, validateMapping } from "@/lib/importMapping";

export async function POST(request) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file bytes into array buffer
    const arrayBuffer = await file.arrayBuffer();
    const workbook = xlsx.read(new Uint8Array(arrayBuffer), { type: "array" });

    if (workbook.SheetNames.length === 0) {
      return NextResponse.json({ error: "Excel file has no worksheets" }, { status: 400 });
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Parse sheet as raw matrix arrays to obtain headers
    const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (rawRows.length === 0) {
      return NextResponse.json({ error: "Worksheet is empty" }, { status: 400 });
    }

    const rawHeaders = rawRows[0];
    const mapping = getHeaderMapping(rawHeaders);
    const validation = validateMapping(mapping, rawHeaders);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${validation.missing.join(", ")}`,
          missing: validation.missing,
          found: validation.found,
        },
        { status: 400 }
      );
    }

    const docsToInsert = [];
    const skippedRows = [];
    let skippedCount = 0;

    for (let i = 1; i < rawRows.length; i++) {
      const rowData = rawRows[i];
      // Skip completely empty empty rows
      if (!rowData || rowData.length === 0) continue;

      const doc = {};
      rawHeaders.forEach((header, colIndex) => {
        const fieldKey = mapping[header];
        if (fieldKey) {
          doc[fieldKey] = rowData[colIndex];
        }
      });

      const machineNameEmpty = !doc.machineName || String(doc.machineName).trim() === "";

      if (machineNameEmpty) {
        skippedRows.push({ rowNum: i + 1, reason: "Machine Name is blank" });
        skippedCount++;
        continue;
      }

      // Format types
      if (doc.machineName !== undefined) doc.machineName = String(doc.machineName).trim();
      if (doc.sapCode !== undefined) doc.sapCode = String(doc.sapCode).trim();
      if (doc.materialDescription !== undefined) doc.materialDescription = String(doc.materialDescription).trim();
      if (doc.storeLocation !== undefined) doc.storeLocation = String(doc.storeLocation).trim();

      doc.images = [];

      docsToInsert.push(doc);
    }

    let insertedCount = 0;
    const errors = [];

    if (docsToInsert.length > 0) {
      try {
        const result = await Item.insertMany(docsToInsert, { ordered: false });
        insertedCount = result.length;
      } catch (insertError) {
        if (insertError.insertedDocs) {
          insertedCount = insertError.insertedDocs.length;
        }
        if (insertError.writeErrors) {
          for (const writeErr of insertError.writeErrors) {
            errors.push(`Row index ${writeErr.index}: ${writeErr.errmsg}`);
          }
        } else if (insertError.errors) {
          Object.keys(insertError.errors).forEach((key) => {
            errors.push(`${key}: ${insertError.errors[key].message}`);
          });
        } else {
          errors.push(insertError.message);
        }
      }
    }

    return NextResponse.json({
      totalParsed: rawRows.length - 1,
      inserted: insertedCount,
      skippedCount,
      skippedRows,
      errors,
    });
  } catch (error) {
    console.error("POST /api/items/import failed:", error);
    return NextResponse.json({ error: "Failed to process excel import file" }, { status: 500 });
  }
}
