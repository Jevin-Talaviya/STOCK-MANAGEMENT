/**
 * Normalizes a header string by converting to lowercase and stripping spaces, underscores, dots, and dashes.
 * @param {string} header
 * @returns {string}
 */
export function normalizeHeader(header) {
  if (!header || typeof header !== "string") return "";
  return header.toLowerCase().replace(/[\s\._\-]/g, "");
}

/**
 * Returns a map of raw excel/csv headers to database schema keys based on matching aliases.
 * @param {string[]} rawHeaders
 * @returns {object} Maps rawHeader -> schemaKey
 */
export function getHeaderMapping(rawHeaders) {
  if (!rawHeaders || !Array.isArray(rawHeaders)) return {};

  const normalizedToField = {
    // machineName
    "machinename": "machineName",
    "machine": "machineName",
    "machinetype": "machineName",
    "equipment": "machineName",
    
    // sapCode
    "sapcode": "sapCode",
    "sap": "sapCode",
    "sapno": "sapCode",
    "sapnumber": "sapCode",
    "sapmaterialcode": "sapCode",

    // materialDescription
    "materialdescription": "materialDescription",
    "description": "materialDescription",
    "material": "materialDescription",
    "matdesc": "materialDescription",
    
    // partNo
    "partno": "partNo",
    "partnumber": "partNo",
    "part": "partNo",
    "partnum": "partNo",
    "itemcode": "partNo",
    
    // specification
    "specification": "specification",
    "specifications": "specification",
    "spec": "specification",
    "specs": "specification",
    "size": "specification",
    
    // storeLocation
    "storelocation": "storeLocation",
    "location": "storeLocation",
    "store": "storeLocation",
    "bin": "storeLocation",
    "shelf": "storeLocation",
    "rack": "storeLocation",
  };

  const mapping = {};
  for (const rawHeader of rawHeaders) {
    if (typeof rawHeader !== "string") continue;
    const norm = normalizeHeader(rawHeader);
    if (normalizedToField[norm]) {
      mapping[rawHeader] = normalizedToField[norm];
    }
  }
  return mapping;
}

/**
 * Validates mapped headers to ensure required fields are present.
 * @param {object} mapping Maps rawHeader -> schemaKey
 * @param {string[]} rawHeaders Original headers found
 * @returns {object} { isValid: boolean, missing: string[], found: string[] }
 */
export function validateMapping(mapping, rawHeaders) {
  const mappedFields = Object.values(mapping);
  const hasMachineName = mappedFields.includes("machineName");
  const hasPartNo = mappedFields.includes("partNo");

  const missing = [];
  if (!hasMachineName) missing.push("Machine Name");
  if (!hasPartNo) missing.push("Part No");

  return {
    isValid: missing.length === 0,
    missing,
    found: rawHeaders,
  };
}
