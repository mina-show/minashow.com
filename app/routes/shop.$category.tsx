import { useParams } from "react-router";
import { ShopPage } from "./shop";

export function meta() {
  return [{ title: "Shop — Minashow" }];
}

/** Category-filtered shop view. Reuses ShopPage with the param as initial category. */
export default function ShopCategoryPage() {
  const { category } = useParams<{ category: string }>();
  return <ShopPage initialCategory={category ?? "all"} />;
}
