import ExcelJS from "exceljs";
import { serverEnv } from "~/lib/env/env.defaults.server";

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

const IMAGE_PX = 88;

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
 * Build an .xlsx workbook for the manufacturer: one row per order item with an
 * embedded product image, the item name, type, and quantity. Images that can't
 * be fetched are skipped (the row still lists name/type/qty).
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
    { header: "Type", key: "type", width: 16 },
    { header: "Quantity", key: "quantity", width: 12 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };

  // Fetch all images up front (in parallel) so embedding is fast.
  const images = await Promise.all(
    order.items.map((item) => (item.itemImageUrl ? fetchImage(item.itemImageUrl) : Promise.resolve(null)))
  );

  order.items.forEach((item, idx) => {
    const row = sheet.addRow({
      image: "",
      name: item.itemName,
      type: item.itemType,
      quantity: item.quantity,
    });
    row.height = IMAGE_PX * 0.78; // points ≈ px * 0.75; small margin for padding
    row.alignment = { vertical: "middle" };

    const imageBuffer = images[idx];
    if (imageBuffer && item.itemImageUrl) {
      const imageId = workbook.addImage({
        buffer: imageBuffer as unknown as ExcelJS.Buffer,
        extension: imageExtension(item.itemImageUrl),
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
