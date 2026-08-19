import {
  BACKUP_FORMAT,
  BACKUP_TABLES,
  BackupError,
  imageFileName,
  parseBackupData,
  reviveRow,
  rewriteImageUri,
  validateManifest,
} from "../backupData";

const CURRENT = { format: BACKUP_FORMAT, schemaVersion: 1 };

const manifest = (overrides: Record<string, unknown> = {}) => ({
  format: BACKUP_FORMAT,
  appVersion: "1.1.0",
  schemaVersion: 1,
  seedVersion: 2,
  exportedAt: "2026-08-19T00:00:00.000Z",
  ...overrides,
});

describe("validateManifest", () => {
  it("accepts a current manifest", () => {
    expect(validateManifest(manifest(), CURRENT)).toMatchObject({
      format: BACKUP_FORMAT,
      schemaVersion: 1,
      seedVersion: 2,
    });
  });

  it.each([null, "text", 42, [], {}])("rejects %p as invalid", (value) => {
    expect(() => validateManifest(value, CURRENT)).toThrow(BackupError);
    try {
      validateManifest(value, CURRENT);
    } catch (error) {
      expect((error as BackupError).code).toBe("invalid");
    }
  });

  it("rejects manifests missing version numbers", () => {
    expect(() =>
      validateManifest(manifest({ schemaVersion: "1" }), CURRENT),
    ).toThrow(BackupError);
  });

  it("rejects a newer schema version with code 'newer'", () => {
    try {
      validateManifest(manifest({ schemaVersion: 99 }), CURRENT);
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as BackupError).code).toBe("newer");
    }
  });

  it("rejects a newer archive format with code 'newer'", () => {
    try {
      validateManifest(manifest({ format: BACKUP_FORMAT + 1 }), CURRENT);
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as BackupError).code).toBe("newer");
    }
  });

  it("tolerates missing optional string fields", () => {
    const m = validateManifest(
      { format: 1, schemaVersion: 1, seedVersion: 2 },
      CURRENT,
    );
    expect(m.appVersion).toBe("unknown");
    expect(m.exportedAt).toBe("");
  });
});

describe("parseBackupData", () => {
  it("returns every registered table, defaulting missing ones to []", () => {
    const data = parseBackupData(
      JSON.stringify({ countries: [{ id: "argentina" }] }),
    );
    expect(data.countries).toEqual([{ id: "argentina" }]);
    for (const { name } of BACKUP_TABLES) {
      expect(Array.isArray(data[name])).toBe(true);
    }
  });

  it("ignores unknown extra tables", () => {
    const data = parseBackupData(JSON.stringify({ futureTable: [{ a: 1 }] }));
    expect("futureTable" in data).toBe(false);
  });

  it.each(["not json", '"a string"', "[1,2]", "null"])(
    "rejects %s as invalid",
    (json) => {
      expect(() => parseBackupData(json)).toThrow(BackupError);
    },
  );

  it("rejects a table that is not an array", () => {
    expect(() => parseBackupData(JSON.stringify({ kits: {} }))).toThrow(
      BackupError,
    );
  });
});

describe("reviveRow", () => {
  it("revives ISO strings and epoch numbers to Dates", () => {
    const row = reviveRow(
      {
        id: "x",
        createdAt: "2026-01-02T03:04:05.000Z",
        updatedAt: 1767322800000,
      },
      ["createdAt", "updatedAt"],
    );
    expect(row.createdAt).toEqual(new Date("2026-01-02T03:04:05.000Z"));
    expect(row.updatedAt).toEqual(new Date(1767322800000));
  });

  it("leaves null timestamps and other fields untouched", () => {
    const row = reviveRow({ id: "x", purchaseDate: null }, ["purchaseDate"]);
    expect(row.purchaseDate).toBeNull();
    expect(row.id).toBe("x");
  });

  it("returns the row as-is when there are no date fields", () => {
    const row = { id: "x" };
    expect(reviveRow(row, [])).toBe(row);
  });

  it("rejects unparseable timestamps", () => {
    expect(() => reviveRow({ createdAt: "not a date" }, ["createdAt"])).toThrow(
      BackupError,
    );
  });
});

describe("rewriteImageUri", () => {
  const newDir = "file:///data/Containers/NEW/Documents/images";

  it("re-roots an owned URI onto the current images directory", () => {
    expect(
      rewriteImageUri(
        "file:///var/mobile/Containers/OLD/Documents/images/abc-123.jpg",
        newDir,
      ),
    ).toBe(`${newDir}/abc-123.jpg`);
  });

  it("handles a trailing slash on the images directory", () => {
    expect(rewriteImageUri("file:///old/images/a.jpg", `${newDir}/`)).toBe(
      `${newDir}/a.jpg`,
    );
  });

  it.each([
    "https://example.com/images/a.jpg",
    "file:///somewhere/else/a.jpg",
    null,
    42,
  ])("passes through %p untouched", (uri) => {
    expect(rewriteImageUri(uri, newDir)).toBe(uri);
  });
});

describe("imageFileName", () => {
  it("extracts the file name", () => {
    expect(imageFileName("file:///docs/images/abc.jpg")).toBe("abc.jpg");
  });

  it("returns null for non-strings and empty tails", () => {
    expect(imageFileName(null)).toBeNull();
    expect(imageFileName("file:///docs/images/")).toBeNull();
  });
});

describe("BACKUP_TABLES ordering", () => {
  it("lists parents before children for every foreign key", () => {
    const order: string[] = BACKUP_TABLES.map((t) => t.name);
    const pos = (name: string) => order.indexOf(name);
    const constraints: [string, string][] = [
      ["countries", "teams"],
      ["teams", "eras"],
      ["teams", "kits"],
      ["eras", "kits"],
      ["manufacturers", "kits"],
      ["competitions", "kitCompetitions"],
      ["kits", "kitCompetitions"],
      ["kits", "kitImages"],
      ["competitions", "addons"],
      ["kits", "collectionItems"],
      ["players", "collectionItems"],
      ["collectionItems", "itemAddons"],
      ["addons", "itemAddons"],
      ["collectionItems", "itemPhotos"],
      ["kits", "wishlistItems"],
      ["players", "wishlistItems"],
    ];
    for (const [parent, child] of constraints) {
      expect(pos(parent)).toBeGreaterThanOrEqual(0);
      expect(pos(parent)).toBeLessThan(pos(child));
    }
  });
});
