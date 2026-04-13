export interface Product {
  id: string;
  category: "mascots" | "costumes" | "soundtracks";
  name: string;
  price: number;
  description: string;
  image: string;
  type?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  /** Tailwind bg utility class (light tint) */
  bgClass: string;
  /** Tailwind text utility class */
  textClass: string;
  /** Tailwind border utility class */
  borderClass: string;
  /** Tailwind bg class for the active/selected state (full brand color) */
  activeClass: string;
}

export const categories: Category[] = [
  {
    id: "mascots",
    name: "Mascots",
    description: "Full-body mascot characters for your shows",
    image: "https://images.unsplash.com/photo-1701772870805-0b1b3a449803?w=800",
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
    borderClass: "border-blue-200",
    activeClass: "bg-brand-blue",
  },
  {
    id: "costumes",
    name: "Costumes",
    description: "Fun and colorful costumes for all ages",
    image: "https://images.unsplash.com/photo-1587706419216-8845bd1fefd3?w=800",
    bgClass: "bg-red-50",
    textClass: "text-red-500",
    borderClass: "border-red-200",
    activeClass: "bg-brand-red",
  },
  {
    id: "soundtracks",
    name: "Soundtracks",
    description: "Original show music for kids' performances",
    image: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=800",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-600",
    borderClass: "border-yellow-200",
    activeClass: "bg-brand-yellow",
  },
];

export const products: Product[] = [
  {
    id: "1",
    category: "mascots",
    name: "Leo the Lion",
    price: 150,
    description:
      "A brave and friendly lion mascot costume, perfect for kids' shows. Includes full head and body suit. Made from soft, breathable materials safe for performers.",
    image: "https://images.unsplash.com/photo-1701772870805-0b1b3a449803?w=800",
    type: "Full Body",
  },
  {
    id: "2",
    category: "mascots",
    name: "Sammy Sheep",
    price: 140,
    description:
      "A gentle and lovable sheep mascot, ideal for community show performances. Soft white fleece with a friendly smile that kids will love.",
    image: "https://images.unsplash.com/photo-1598088372329-26b2932afa98?w=800",
    type: "Full Body",
  },
  {
    id: "3",
    category: "mascots",
    name: "Sunny the Bear",
    price: 160,
    description:
      "A warm and huggable bear mascot in bright yellow. Perfect for community events and birthday shows.",
    image: "https://images.unsplash.com/photo-1701773055020-9d2b09b7ca5e?w=800",
    type: "Full Body",
  },
  {
    id: "4",
    category: "costumes",
    name: "Superhero Cape Set",
    price: 85,
    description:
      "A colorful set of superhero capes in 4 vibrant colors — blue, red, green, and yellow. Great for kids who want to save the day at your show.",
    image: "https://images.unsplash.com/photo-1587706419216-8845bd1fefd3?w=800",
    type: "Set of 4",
  },
  {
    id: "5",
    category: "costumes",
    name: "Star Costume",
    price: 95,
    description:
      "A dazzling white star costume with shimmering wings and a glittery headband. Perfect for stage performances and community shows. Available in child sizes S-XL.",
    image: "https://images.unsplash.com/photo-1587706419216-8845bd1fefd3?w=800",
    type: "Single",
  },
  {
    id: "6",
    category: "soundtracks",
    name: "Soundtrack 1",
    price: 45,
    description:
      "A collection of 10 upbeat show songs for children, with both instrumental and full vocal tracks included. Ready to use in any performance.",
    image: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=800",
    type: "Digital Download",
  },
  {
    id: "7",
    category: "soundtracks",
    name: "Soundtrack 2",
    price: 35,
    description:
      "A lively medley featuring 6 original show songs for kids. Includes instrumental versions perfect for stage performances.",
    image: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=800",
    type: "Digital Download",
  },
];

export const getCategoryById = (id: string) => categories.find((c) => c.id === id);
export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getProductsByCategory = (category: string) =>
  products.filter((p) => p.category === category);
