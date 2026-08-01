import { escapeRegex, buildSearchQuery } from "@/lib/search";

describe("Search Utility - escapeRegex", () => {
  it("should return an empty string if input is falsy", () => {
    expect(escapeRegex("")).toBe("");
    expect(escapeRegex(null)).toBe("");
    expect(escapeRegex(undefined)).toBe("");
  });

  it("should escape special regex characters correctly", () => {
    expect(escapeRegex("abc-123")).toBe("abc\\-123");
    expect(escapeRegex("a.b*c+d?")).toBe("a\\.b\\*c\\+d\\?");
    expect(escapeRegex("hello^world$")).toBe("hello\\^world\\$");
    expect(escapeRegex("([test])")).toBe("\\(\\[test\\]\\)");
  });
});

describe("Search Utility - buildSearchQuery", () => {
  it("should return an empty object for empty or blank search inputs", () => {
    expect(buildSearchQuery("")).toEqual({});
    expect(buildSearchQuery("   ")).toEqual({});
    expect(buildSearchQuery(null)).toEqual({});
    expect(buildSearchQuery(undefined)).toEqual({});
  });

  it("should return a query object with $or containing regex clauses for searchable fields", () => {
    const q = "AB-12";
    const result = buildSearchQuery(q);

    expect(result).toHaveProperty("$or");
    expect(result.$or).toBeInstanceOf(Array);
    expect(result.$or).toHaveLength(6); // machineName, sapCode, materialDescription, partNo, specification, storeLocation

    // Verify machineName query structure
    const machineNameMatch = result.$or.find((item) => item.machineName);
    expect(machineNameMatch).toBeDefined();
    expect(machineNameMatch.machineName.$regex).toBe("AB\\-12");
    expect(machineNameMatch.machineName.$options).toBe("i");

    // Verify sapCode query structure
    const sapCodeMatch = result.$or.find((item) => item.sapCode);
    expect(sapCodeMatch).toBeDefined();
    expect(sapCodeMatch.sapCode.$regex).toBe("AB\\-12");

    // Verify partNo query structure
    const partNoMatch = result.$or.find((item) => item.partNo);
    expect(partNoMatch).toBeDefined();
    expect(partNoMatch.partNo.$regex).toBe("AB\\-12");
  });
});
