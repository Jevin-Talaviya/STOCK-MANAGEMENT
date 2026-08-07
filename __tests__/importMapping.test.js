import { normalizeHeader, getHeaderMapping, validateMapping } from "@/lib/importMapping";

describe("Import Mapping - normalizeHeader", () => {
  it("should return empty string for falsy names", () => {
    expect(normalizeHeader("")).toBe("");
    expect(normalizeHeader(null)).toBe("");
  });

  it("should lowercase and replace spaces, underscores, dots, and dashes", () => {
    expect(normalizeHeader("Machine Name")).toBe("machinename");
    expect(normalizeHeader("part_no")).toBe("partno");
    expect(normalizeHeader("Part-Number")).toBe("partnumber");
    expect(normalizeHeader("Store.Location")).toBe("storelocation");
  });
});

describe("Import Mapping - getHeaderMapping", () => {
  it("should map headers to correct schema fields", () => {
    const rawHeaders = ["Machine Name", "description", "location"];
    const mapping = getHeaderMapping(rawHeaders);

    expect(mapping).toEqual({
      "Machine Name": "machineName",
      "description": "materialDescription",
      "location": "storeLocation",
    });
  });

  it("should ignore mapping for unknown column headers", () => {
    const rawHeaders = ["Random Column", "Machine"];
    const mapping = getHeaderMapping(rawHeaders);

    expect(mapping).toEqual({
      "Machine": "machineName",
    });
  });
});

describe("Import Mapping - validateMapping", () => {
  it("should identify as valid if machineName is mapped", () => {
    const headers = ["Machine Name", "Location"];
    const mapping = getHeaderMapping(headers);
    const validation = validateMapping(mapping, headers);

    expect(validation.isValid).toBe(true);
    expect(validation.missing).toHaveLength(0);
  });

  it("should identify as invalid if machineName is not present", () => {
    const headersNone = ["Location"];
    const mappingNone = getHeaderMapping(headersNone);
    const validationNone = validateMapping(mappingNone, headersNone);

    expect(validationNone.isValid).toBe(false);
    expect(validationNone.missing).toContain("Machine Name");
  });
});
