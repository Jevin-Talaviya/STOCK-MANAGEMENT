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
    const rawHeaders = ["Machine Name", "description", "part_no", "Specification", "location"];
    const mapping = getHeaderMapping(rawHeaders);

    expect(mapping).toEqual({
      "Machine Name": "machineName",
      "description": "materialDescription",
      "part_no": "partNo",
      "Specification": "specification",
      "location": "storeLocation",
    });
  });

  it("should ignore mapping for unkown column headers", () => {
    const rawHeaders = ["Random Column", "Machine", "Part No"];
    const mapping = getHeaderMapping(rawHeaders);

    expect(mapping).toEqual({
      "Machine": "machineName",
      "Part No": "partNo",
    });
  });
});

describe("Import Mapping - validateMapping", () => {
  it("should identify as valid if machineName and partNo are both mapped", () => {
    const headers = ["Machine Name", "Part No"];
    const mapping = getHeaderMapping(headers);
    const validation = validateMapping(mapping, headers);

    expect(validation.isValid).toBe(true);
    expect(validation.missing).toHaveLength(0);
  });

  it("should identify as invalid and identify missing required fields if any of them is not present", () => {
    const headersOnlyMachine = ["Machine Name", "Specification"];
    const mappingOnlyMachine = getHeaderMapping(headersOnlyMachine);
    const validationOnlyMachine = validateMapping(mappingOnlyMachine, headersOnlyMachine);

    expect(validationOnlyMachine.isValid).toBe(false);
    expect(validationOnlyMachine.missing).toContain("Part No");
    expect(validationOnlyMachine.missing).not.toContain("Machine Name");

    const headersNone = ["Location"];
    const mappingNone = getHeaderMapping(headersNone);
    const validationNone = validateMapping(mappingNone, headersNone);

    expect(validationNone.isValid).toBe(false);
    expect(validationNone.missing).toContain("Machine Name");
    expect(validationNone.missing).toContain("Part No");
  });
});
