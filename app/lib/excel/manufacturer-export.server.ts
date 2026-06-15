import ExcelJS from "exceljs";
import { serverEnv } from "~/lib/env/env.defaults.server";
import { packages } from "~/lib/data/packages";

/** Minimal item shape needed for the manufacturer sheet. */
export interface ManufacturerExportItem {
  itemName: string;
  itemType: string;
  itemImageUrl: string | null;
  quantity: number;
}

export interface ManufacturerExportOrder {
  id: string;
  customerName: string;
  customerOrganization: string;
  items: ManufacturerExportItem[];
}

/** A single manufacturer-sheet line: one costume to produce. */
interface ManufacturerRow {
  imageUrl: string | null;
  /** Costume name (or the package name for an unresolved/individual line). */
  name: string;
  /** Parent bundle name; empty for an individual (non-package) product. */
  bundle: string;
  quantity: number;
}

const IMAGE_PX = 88;

/**
 * Static packages keyed by name (lowercased). Order items only snapshot the
 * package *name* — its id isn't persisted — so name is the link back to the
 * bundle's costume list. Names are unique across packages.
 */
const packagesByName = new Map(packages.map((p) => [p.name.toLowerCase(), p]));

/**
 * Explode order items into manufacturer rows. We're billed per costume but sell
 * bundles, so each package becomes one row per costume in it; the package's
 * order quantity carries down to every costume. Individual products (or any
 * package we can't resolve) stay a single row so nothing is dropped.
 */
function toManufacturerRows(items: ManufacturerExportItem[]): ManufacturerRow[] {
  return items.flatMap((item) => {
    const pkg =
      item.itemType === "package"
        ? packagesByName.get(item.itemName.toLowerCase())
        : undefined;

    if (pkg && pkg.images.length > 0) {
      return pkg.images.map((img) => ({
        imageUrl: img.src,
        name: img.name,
        bundle: pkg.name,
        quantity: item.quantity,
      }));
    }

    return [
      {
        imageUrl: item.itemImageUrl,
        name: item.itemName,
        bundle: item.itemType === "package" ? item.itemName : "",
        quantity: item.quantity,
      },
    ];
  });
}

/** Resolve a possibly-relative image URL to an absolute one using APP_FQDN. */
function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const fqdn = serverEnv.APP_FQDN || "localhost:3000";
  const protocol = fqdn.includes("localhost") ? "http" : "https";
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${protocol}://${fqdn}${path}`;
}

/** exceljs only accepts these image extensions. */
function imageExtension(url: string): "jpeg" | "png" | "gif" {
  const match = url.toLowerCase().match(/\.(jpe?g|png|gif)(?:\?|$)/);
  if (!match) return "jpeg";
  const ext = match[1];
  if (ext === "png") return "png";
  if (ext === "gif") return "gif";
  return "jpeg";
}

/** Fetch the raw image bytes; returns null on any failure so export never breaks. */
async function fetchImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(toAbsoluteUrl(url));
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Build an .xlsx workbook for the manufacturer: one row per costume to produce
 * (bundles are exploded into their individual costumes) with an embedded image,
 * the costume name, its parent bundle, and quantity. Images that can't be
 * fetched are skipped (the row still lists name/bundle/qty).
 */
export async function buildManufacturerWorkbook(
  order: ManufacturerExportOrder
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Minashow";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Order ${order.id.slice(0, 8)}`);

  sheet.columns = [
    { header: "Image", key: "image", width: 16 },
    { header: "Item", key: "name", width: 38 },
    { header: "Bundle", key: "bundle", width: 24 },
    { header: "Quantity", key: "quantity", width: 12 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };

  const rows = toManufacturerRows(order.items);

  // Fetch all images up front (in parallel) so embedding is fast.
  const images = await Promise.all(
    rows.map((r) => (r.imageUrl ? fetchImage(r.imageUrl) : Promise.resolve(null)))
  );

  rows.forEach((line, idx) => {
    const row = sheet.addRow({
      image: "",
      name: line.name,
      bundle: line.bundle,
      quantity: line.quantity,
    });
    row.height = IMAGE_PX * 0.78; // points ≈ px * 0.75; small margin for padding
    row.alignment = { vertical: "middle" };

    const imageBuffer = images[idx];
    if (imageBuffer && line.imageUrl) {
      const imageId = workbook.addImage({
        buffer: imageBuffer as unknown as ExcelJS.Buffer,
        extension: imageExtension(line.imageUrl),
      });
      // Anchor inside the first column of this row (0-based col/row).
      sheet.addImage(imageId, {
        tl: { col: 0.15, row: row.number - 1 + 0.1 },
        ext: { width: IMAGE_PX, height: IMAGE_PX },
      });
    }
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
