import { useState, useEffect } from "react";
import { useFetcher, useLoaderData, redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { eq, asc, desc } from "drizzle-orm";
import { db } from "~/lib/db/client";
import {
  categories,
  products,
  sounds,
  orders,
} from "~/lib/db/schema";
import { requireAdmin } from "~/lib/auth/admin.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "~/components/ui/sheet";
import {
  LayoutGrid,
  Package,
  Music,
  ClipboardList,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function meta() {
  return [{ title: "Admin — Minashow" }];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
function str(fd: FormData, k: string) {
  return (fd.get(k) as string | null) ?? "";
}
function num(fd: FormData, k: string, fallback = 0) {
  const v = parseInt(str(fd, k) || String(fallback), 10);
  return isNaN(v) ? fallback : v;
}
function bool(fd: FormData, k: string) {
  return str(fd, k) === "true";
}
function nullableStr(fd: FormData, k: string): string | null {
  const v = str(fd, k).trim();
  return v === "" ? null : v;
}
function nullableNum(fd: FormData, k: string): number | null {
  const v = str(fd, k).trim();
  if (v === "") return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);

  const [allCategories, allProducts, allSounds, allOrders] = await Promise.all([
    db.query.categories.findMany({ orderBy: [asc(categories.sortOrder), asc(categories.name)] }),
    db.query.products.findMany({
      with: { category: true },
      orderBy: [asc(products.categoryId), asc(products.sortOrder)],
    }),
    db.query.sounds.findMany({
      orderBy: [asc(sounds.sortOrder), asc(sounds.title)],
    }),
    db.query.orders.findMany({
      with: { items: true, user: true },
      orderBy: [desc(orders.createdAt)],
    }),
  ]);

  return { allCategories, allProducts, allSounds, allOrders };
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const fd = await request.formData();
  const intent = str(fd, "intent");

  switch (intent) {
    // ── Categories ────────────────────────────────────────────────────────
    case "create-category": {
      const name = str(fd, "name");
      await db.insert(categories).values({
        name,
        slug: str(fd, "slug") || slugify(name),
        description: nullableStr(fd, "description"),
        priceCents: num(fd, "priceCents"),
        sortOrder: num(fd, "sortOrder"),
        isActive: bool(fd, "isActive"),
      });
      break;
    }
    case "update-category": {
      const name = str(fd, "name");
      await db
        .update(categories)
        .set({
          name,
          slug: str(fd, "slug") || slugify(name),
          description: nullableStr(fd, "description"),
          priceCents: num(fd, "priceCents"),
          sortOrder: num(fd, "sortOrder"),
          isActive: bool(fd, "isActive"),
          updatedAt: new Date(),
        })
        .where(eq(categories.id, str(fd, "id")));
      break;
    }
    case "delete-category": {
      await db.delete(categories).where(eq(categories.id, str(fd, "id")));
      break;
    }

    // ── Products ──────────────────────────────────────────────────────────
    case "create-product": {
      const imageUrl = nullableStr(fd, "imageUrl");
      await db.insert(products).values({
        name: str(fd, "name"),
        categoryId: str(fd, "categoryId"),
        description: nullableStr(fd, "description"),
        images: imageUrl ? [{ url: imageUrl, alt: str(fd, "name") }] : [],
        sortOrder: num(fd, "sortOrder"),
        isActive: bool(fd, "isActive"),
      });
      break;
    }
    case "update-product": {
      const imageUrl = nullableStr(fd, "imageUrl");
      await db
        .update(products)
        .set({
          name: str(fd, "name"),
          categoryId: str(fd, "categoryId"),
          description: nullableStr(fd, "description"),
          images: imageUrl ? [{ url: imageUrl, alt: str(fd, "name") }] : [],
          sortOrder: num(fd, "sortOrder"),
          isActive: bool(fd, "isActive"),
          updatedAt: new Date(),
        })
        .where(eq(products.id, str(fd, "id")));
      break;
    }
    case "delete-product": {
      await db.delete(products).where(eq(products.id, str(fd, "id")));
      break;
    }

    // ── Sounds ────────────────────────────────────────────────────────────
    case "create-sound": {
      await db.insert(sounds).values({
        title: str(fd, "title"),
        artist: str(fd, "artist"),
        durationSeconds: num(fd, "durationSeconds"),
        previewDurationSeconds: nullableNum(fd, "previewDurationSeconds"),
        thumbnailUrl: nullableStr(fd, "thumbnailUrl"),
        audioUrl: nullableStr(fd, "audioUrl"),
        sortOrder: num(fd, "sortOrder"),
        isActive: bool(fd, "isActive"),
      });
      break;
    }
    case "update-sound": {
      await db
        .update(sounds)
        .set({
          title: str(fd, "title"),
          artist: str(fd, "artist"),
          durationSeconds: num(fd, "durationSeconds"),
          previewDurationSeconds: nullableNum(fd, "previewDurationSeconds"),
          thumbnailUrl: nullableStr(fd, "thumbnailUrl"),
          audioUrl: nullableStr(fd, "audioUrl"),
          sortOrder: num(fd, "sortOrder"),
          isActive: bool(fd, "isActive"),
          updatedAt: new Date(),
        })
        .where(eq(sounds.id, str(fd, "id")));
      break;
    }
    case "delete-sound": {
      await db.delete(sounds).where(eq(sounds.id, str(fd, "id")));
      break;
    }

    // ── Orders ────────────────────────────────────────────────────────────
    case "update-order-status": {
      await db
        .update(orders)
        .set({ status: str(fd, "status") as typeof orders.$inferSelect["status"], updatedAt: new Date() })
        .where(eq(orders.id, str(fd, "id")));
      break;
    }
  }

  return { ok: true };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type LoaderData = Awaited<ReturnType<typeof loader>>;
type Category = LoaderData["allCategories"][number];
type Product = LoaderData["allProducts"][number];
type Sound = LoaderData["allSounds"][number];
type Order = LoaderData["allOrders"][number];

type Section = "orders" | "categories" | "products" | "sounds";

// ─── Shared row wrapper ────────────────────────────────────────────────────────

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50 transition-colors">
      {children}
    </div>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-bold font-sans ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Delete button ─────────────────────────────────────────────────────────────

function DeleteButton({ intent, id }: { intent: string; id: string }) {
  const fetcher = useFetcher();
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-600 font-sans font-semibold">Sure?</span>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value={intent} />
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded font-bold font-sans"
          >
            Yes
          </button>
        </fetcher.Form>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded font-sans"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

// ─── Field helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-sans font-semibold text-gray-700">{label}</Label>
      {children}
    </div>
  );
}

// ─── Categories section ────────────────────────────────────────────────────────

function CategoriesSection({ data }: { data: Category[] }) {
  const fetcher = useFetcher();
  const [sheet, setSheet] = useState<{ item: Category | null }>({ item: null });
  const [open, setOpen] = useState(false);

  const isAdd = sheet.item === null;
  const item = sheet.item;

  const [form, setForm] = useState({
    name: "", slug: "", description: "", priceCents: "0", sortOrder: "0", isActive: true,
  });

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? {
            name: item.name,
            slug: item.slug,
            description: item.description ?? "",
            priceCents: String(item.priceCents),
            sortOrder: String(item.sortOrder),
            isActive: item.isActive,
          }
          : { name: "", slug: "", description: "", priceCents: "0", sortOrder: "0", isActive: true }
      );
    }
  }, [open, item?.id]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) setOpen(false);
  }, [fetcher.state, fetcher.data]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-gray-900">Categories</h2>
        <Button size="sm" onClick={() => { setSheet({ item: null }); setOpen(true); }} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {data.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 font-sans text-sm">No categories yet.</div>
        )}
        {data.map((cat) => (
          <Row key={cat.id}>
            <ActiveBadge isActive={cat.isActive} />
            <span className="flex-1 font-sans font-semibold text-gray-900 text-sm">{cat.name}</span>
            <span className="text-xs text-gray-400 font-mono hidden sm:block">{cat.slug}</span>
            <span className="text-sm text-gray-700 font-sans font-bold">
              ${(cat.priceCents / 100).toFixed(2)}
            </span>
            <span className="text-xs text-gray-400 font-sans">#{cat.sortOrder}</span>
            <button
              onClick={() => { setSheet({ item: cat }); setOpen(true); }}
              className="p-1.5 rounded-lg hover:bg-brand-blue/10 text-gray-400 hover:text-brand-blue transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <DeleteButton intent="delete-category" id={cat.id} />
          </Row>
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{isAdd ? "Add Category" : "Edit Category"}</SheetTitle>
          </SheetHeader>
          <fetcher.Form method="post" className="flex flex-col gap-4 px-4 py-2">
            <input type="hidden" name="intent" value={isAdd ? "create-category" : "update-category"} />
            {!isAdd && <input type="hidden" name="id" value={item!.id} />}
            <Field label="Name">
              <Input
                name="name"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: isAdd ? slugify(name) : f.slug }));
                }}
                required
              />
            </Field>
            <Field label="Slug">
              <Input name="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </Field>
            <Field label="Description">
              <Textarea name="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </Field>
            <Field label="Package Price ($)">
              <Input
                name="priceCents"
                type="number"
                min={0}
                value={Math.round(Number(form.priceCents) / 100) || 0}
                onChange={(e) => setForm((f) => ({ ...f, priceCents: String(Math.round(Number(e.target.value) * 100)) }))}
              />
            </Field>
            <Field label="Sort Order">
              <Input name="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            </Field>
            <div className="flex items-center gap-3">
              <Switch name="isActive" checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              <input type="hidden" name="isActive" value={String(form.isActive)} />
              <Label className="font-sans">Active</Label>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={fetcher.state !== "idle"} className="w-full">
                {fetcher.state !== "idle" ? "Saving…" : isAdd ? "Create" : "Save Changes"}
              </Button>
            </SheetFooter>
          </fetcher.Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Products section ──────────────────────────────────────────────────────────

function ProductsSection({ data, cats }: { data: Product[]; cats: Category[] }) {
  const fetcher = useFetcher();
  const [sheet, setSheet] = useState<{ item: Product | null }>({ item: null });
  const [open, setOpen] = useState(false);

  const isAdd = sheet.item === null;
  const item = sheet.item;

  const [form, setForm] = useState({
    name: "", categoryId: "", description: "", imageUrl: "", sortOrder: "0", isActive: true,
  });

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? {
            name: item.name,
            categoryId: item.categoryId,
            description: item.description ?? "",
            imageUrl: (item.images as { url: string }[])?.[0]?.url ?? "",
            sortOrder: String(item.sortOrder),
            isActive: item.isActive,
          }
          : { name: "", categoryId: cats[0]?.id ?? "", description: "", imageUrl: "", sortOrder: "0", isActive: true }
      );
    }
  }, [open, item?.id]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) setOpen(false);
  }, [fetcher.state, fetcher.data]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-gray-900">Products</h2>
        <Button size="sm" onClick={() => { setSheet({ item: null }); setOpen(true); }} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {data.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 font-sans text-sm">No products yet.</div>
        )}
        {data.map((p) => (
          <Row key={p.id}>
            <ActiveBadge isActive={p.isActive} />
            <span className="flex-1 font-sans font-semibold text-gray-900 text-sm">{p.name}</span>
            <span className="text-xs text-gray-500 font-sans bg-gray-100 px-2 py-0.5 rounded-full">
              {p.category.name}
            </span>
            <span className="text-xs text-gray-400 font-sans">#{p.sortOrder}</span>
            <button
              onClick={() => { setSheet({ item: p }); setOpen(true); }}
              className="p-1.5 rounded-lg hover:bg-brand-blue/10 text-gray-400 hover:text-brand-blue transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <DeleteButton intent="delete-product" id={p.id} />
          </Row>
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{isAdd ? "Add Product" : "Edit Product"}</SheetTitle>
          </SheetHeader>
          <fetcher.Form method="post" className="flex flex-col gap-4 px-4 py-2">
            <input type="hidden" name="intent" value={isAdd ? "create-product" : "update-product"} />
            {!isAdd && <input type="hidden" name="id" value={item!.id} />}
            <Field label="Name">
              <Input name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </Field>
            <Field label="Category">
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <input type="hidden" name="categoryId" value={form.categoryId} />
            </Field>
            <Field label="Description">
              <Textarea name="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </Field>
            <Field label="Image URL">
              <Input name="imageUrl" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
            </Field>
            <Field label="Sort Order">
              <Input name="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            </Field>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              <input type="hidden" name="isActive" value={String(form.isActive)} />
              <Label className="font-sans">Active</Label>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={fetcher.state !== "idle"} className="w-full">
                {fetcher.state !== "idle" ? "Saving…" : isAdd ? "Create" : "Save Changes"}
              </Button>
            </SheetFooter>
          </fetcher.Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Sounds section ────────────────────────────────────────────────────────────

function SoundsSection({ data }: { data: Sound[] }) {
  const fetcher = useFetcher();
  const [sheet, setSheet] = useState<{ item: Sound | null }>({ item: null });
  const [open, setOpen] = useState(false);
  const isAdd = sheet.item === null;
  const item = sheet.item;

  const [form, setForm] = useState({
    title: "", artist: "", durationSeconds: "0", previewDurationSeconds: "",
    thumbnailUrl: "", audioUrl: "", sortOrder: "0", isActive: true,
  });

  useEffect(() => {
    if (open) {
      setForm(item
        ? {
          title: item.title,
          artist: item.artist,
          durationSeconds: String(item.durationSeconds),
          previewDurationSeconds: item.previewDurationSeconds != null ? String(item.previewDurationSeconds) : "",
          thumbnailUrl: item.thumbnailUrl ?? "",
          audioUrl: item.audioUrl ?? "",
          sortOrder: String(item.sortOrder),
          isActive: item.isActive,
        }
        : {
          title: "", artist: "", durationSeconds: "0", previewDurationSeconds: "",
          thumbnailUrl: "", audioUrl: "", sortOrder: "0", isActive: true,
        }
      );
    }
  }, [open, item?.id]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) setOpen(false);
  }, [fetcher.state, fetcher.data]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-gray-900">Sounds</h2>
        <Button size="sm" onClick={() => { setSheet({ item: null }); setOpen(true); }} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {data.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 font-sans text-sm">No sounds yet.</div>
        )}
        {data.map((s) => (
          <Row key={s.id}>
            <ActiveBadge isActive={s.isActive} />
            <span className="flex-1 font-sans font-semibold text-gray-900 text-sm">{s.title}</span>
            <span className="text-xs text-gray-500 font-sans hidden sm:block">{s.artist}</span>
            <span className="text-xs text-gray-400 font-sans">{s.durationSeconds}s</span>
            <button onClick={() => { setSheet({ item: s }); setOpen(true); }} className="p-1.5 rounded-lg hover:bg-brand-blue/10 text-gray-400 hover:text-brand-blue transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <DeleteButton intent="delete-sound" id={s.id} />
          </Row>
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>{isAdd ? "Add Sound" : "Edit Sound"}</SheetTitle></SheetHeader>
          <fetcher.Form method="post" className="flex flex-col gap-4 px-4 py-2">
            <input type="hidden" name="intent" value={isAdd ? "create-sound" : "update-sound"} />
            {!isAdd && <input type="hidden" name="id" value={item!.id} />}
            <Field label="Title">
              <Input name="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </Field>
            <Field label="Artist">
              <Input name="artist" value={form.artist} onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration (sec)">
                <Input name="durationSeconds" type="number" min={0} value={form.durationSeconds} onChange={(e) => setForm((f) => ({ ...f, durationSeconds: e.target.value }))} />
              </Field>
              <Field label="Preview limit (sec)">
                <Input name="previewDurationSeconds" type="number" min={0} value={form.previewDurationSeconds} placeholder="Unlimited" onChange={(e) => setForm((f) => ({ ...f, previewDurationSeconds: e.target.value }))} />
              </Field>
            </div>
            <Field label="Thumbnail URL">
              <Input name="thumbnailUrl" value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))} placeholder="https://…" />
            </Field>
            <Field label="Audio URL">
              <Input name="audioUrl" value={form.audioUrl} onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))} placeholder="https://…" />
            </Field>
            <Field label="Sort Order">
              <Input name="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            </Field>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              <input type="hidden" name="isActive" value={String(form.isActive)} />
              <Label className="font-sans">Active</Label>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={fetcher.state !== "idle"} className="w-full">
                {fetcher.state !== "idle" ? "Saving…" : isAdd ? "Create" : "Save Changes"}
              </Button>
            </SheetFooter>
          </fetcher.Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Orders section ────────────────────────────────────────────────────────────

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-700",
};

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const fetcher = useFetcher();

  return (
    <div className="bg-white border-b border-gray-100 last:border-0">
      <div
        className="flex flex-wrap items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-sans ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
          {order.status}
        </span>
        <span className="font-mono text-xs text-gray-500 hidden sm:block">{order.id.slice(0, 8)}…</span>
        <span className="flex-1 font-sans text-sm text-gray-700 font-semibold">{order.customerName}</span>
        <span className="text-sm font-sans font-bold text-gray-900">
          ${(order.totalCents / 100).toFixed(2)}
        </span>
        <span className="text-xs text-gray-400 font-sans hidden md:block">
          {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
          <div className="mt-3 mb-3 text-sm font-sans text-gray-600 flex flex-col gap-0.5">
            <p><span className="font-semibold">Name:</span> {order.customerName}</p>
            <p><span className="font-semibold">Organization:</span> {order.customerOrganization}</p>
            <p><span className="font-semibold">Email:</span> {order.customerEmail}</p>
            <p><span className="font-semibold">Phone:</span> {order.customerPhone}</p>
            {order.shippingAddress && <p><span className="font-semibold">Shipping:</span> {order.shippingAddress}</p>}
            {order.notes && <p><span className="font-semibold">Notes:</span> {order.notes}</p>}
            {order.assignedAdmin && <p><span className="font-semibold">Notified:</span> {order.assignedAdmin}</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4">
            <p className="text-xs text-gray-400 font-sans font-bold mb-2">Items</p>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-1 border-b border-gray-50 last:border-0 text-sm font-sans">
                <span className="text-gray-700">{item.itemName} × {item.quantity}</span>
                <span className="font-bold text-gray-900">${(item.lineTotalCents / 100).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-sm font-sans font-bold">
              <span>Total</span>
              <span>${(order.totalCents / 100).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-sans font-semibold">Update status:</span>
            {ORDER_STATUSES.map((s) => (
              <fetcher.Form key={s} method="post">
                <input type="hidden" name="intent" value="update-order-status" />
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={s} />
                <button
                  type="submit"
                  disabled={order.status === s || fetcher.state !== "idle"}
                  className={`text-xs px-3 py-1 rounded-full font-bold font-sans transition-all ${order.status === s
                    ? `${STATUS_COLORS[s]} opacity-100 cursor-default`
                    : "bg-white border border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue"
                    }`}
                >
                  {s}
                </button>
              </fetcher.Form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersSection({ data }: { data: Order[] }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">Orders Review</h2>
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {data.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 font-sans text-sm">No orders yet.</div>
        )}
        {data.map((o) => <OrderRow key={o.id} order={o} />)}
      </div>
    </div>
  );
}

// ─── Sidebar nav ───────────────────────────────────────────────────────────────

const NAV: { section: Section; label: string; icon: React.ReactNode }[] = [
  { section: "orders", label: "Orders Review", icon: <ClipboardList className="w-4 h-4" /> },
  // { section: "categories", label: "Categories", icon: <LayoutGrid className="w-4 h-4" /> },
  // { section: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
  // { section: "sounds", label: "Sounds", icon: <Music className="w-4 h-4" /> },
];

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { allCategories, allProducts, allSounds, allOrders } = useLoaderData<typeof loader>();

  const [section, setSection] = useState<Section>("orders");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white border-r border-gray-100 flex flex-col pt-4 min-h-screen sticky top-16">
        <p className="px-4 text-xs text-gray-400 font-sans font-bold uppercase tracking-wider mb-2">
          Admin
        </p>
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV.map(({ section: s, label, icon }) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-sans font-semibold transition-all text-left ${section === s
                ? "bg-brand-blue text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-5xl">
        {section === "orders" && <OrdersSection data={allOrders} />}
        {section === "categories" && <CategoriesSection data={allCategories} />}
        {section === "products" && <ProductsSection data={allProducts} cats={allCategories} />}
        {section === "sounds" && <SoundsSection data={allSounds} />}
      </main>
    </div>
  );
}
