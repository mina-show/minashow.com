export interface Product {
  id: string;
  category: "mascots" | "costumes" | "soundtracks" | "marionettes";
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
    description: "Arabic praise and show music for kids",
    image: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=800",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-600",
    borderClass: "border-yellow-200",
    activeClass: "bg-brand-yellow",
  },
  {
    id: "marionettes",
    name: "Marionettes",
    description: "Hand-crafted puppets for storytelling",
    image: "https://images.unsplash.com/photo-1695241189294-e405ed91553c?w=800",
    bgClass: "bg-green-50",
    textClass: "text-green-600",
    borderClass: "border-green-200",
    activeClass: "bg-brand-green",
  },
];

export const products: Product[] = [
  {
    id: "1",
    category: "mascots",
    name: "Leo the Lion",
    price: 150,
    description:
      "A brave and friendly lion mascot costume, perfect for kids church shows. Includes full head and body suit. Made from soft, breathable materials safe for performers.",
    image: "https://images.unsplash.com/photo-1701772870805-0b1b3a449803?w=800",
    type: "Full Body",
  },
  {
    id: "2",
    category: "mascots",
    name: "Sammy Sheep",
    price: 140,
    description:
      "A gentle and lovable sheep mascot, ideal for Bible story shows about the Good Shepherd. Soft white fleece with a friendly smile that kids will love.",
    image: "https://images.unsplash.com/photo-1598088372329-26b2932afa98?w=800",
    type: "Full Body",
  },
  {
    id: "3",
    category: "mascots",
    name: "Sunny the Bear",
    price: 160,
    description:
      "A warm and huggable bear mascot in bright yellow. Perfect for Sunday school events and birthday shows at the church.",
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
    name: "Angel Costume",
    price: 95,
    description:
      "A beautiful white angel costume with delicate wings and a golden halo. Perfect for Christmas and Easter shows. Available in child sizes S-XL.",
    image: "https://images.unsplash.com/photo-1587706419216-8845bd1fefd3?w=800",
    type: "Single",
  },
  {
    id: "6",
    category: "soundtracks",
    name: "Praise Songs Vol. 1",
    price: 45,
    description:
      "A collection of 10 upbeat Arabic praise songs for children, with both instrumental and full vocal tracks included. Ready to use in any show.",
    image: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=800",
    type: "Digital Download",
  },
  {
    id: "7",
    category: "soundtracks",
    name: "Christmas Medley",
    price: 35,
    description:
      "A joyful Christmas medley featuring 6 traditional and original Arabic Christmas songs. Includes instrumental versions perfect for nativity plays.",
    image: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=800",
    type: "Digital Download",
  },
  {
    id: "8",
    category: "marionettes",
    name: "Wooden Lion Puppet",
    price: 200,
    description:
      "A hand-crafted wooden lion marionette with smooth, responsive movements. Built for durability and storytelling. Each puppet is unique.",
    image: "https://images.unsplash.com/photo-1695241189294-e405ed91553c?w=800",
    type: "Handcrafted",
  },
  {
    id: "9",
    category: "marionettes",
    name: "Angel Marionette",
    price: 180,
    description:
      "A beautifully crafted angel marionette with golden wings and flowing white robes. Delicate strings for expressive movement during shows.",
    image: "https://images.unsplash.com/photo-1659619131381-f84abe1d7c5d?w=800",
    type: "Handcrafted",
  },
];

export const getCategoryById = (id: string) => categories.find((c) => c.id === id);
export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getProductsByCategory = (category: string) =>
  products.filter((p) => p.category === category);
