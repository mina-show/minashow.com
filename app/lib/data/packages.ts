export interface PackageImage {
  src: string;
  name: string;
}

export interface Package {
  id: string;
  name: string;
  /** Short subtitle shown on the shop card */
  subtitle: string;
  description: string;
  /** Gallery images for this package */
  images: PackageImage[];
  /** Primary brand color */
  color: string;
  /** Light tint used for chips / backgrounds */
  lightColor: string;
}

const humanMascotImages: PackageImage[] = [
  { src: "/packages/human-mascots/mascot-1.jpeg", name: "Mascot 1" },
  { src: "/packages/human-mascots/mascot-2.jpeg", name: "Mascot 2" },
  { src: "/packages/human-mascots/mascot-3.jpeg", name: "Mascot 3" },
  { src: "/packages/human-mascots/mascot-4.jpeg", name: "Mascot 4" },
  { src: "/packages/human-mascots/mascot-5.jpeg", name: "Mascot 5" },
  { src: "/packages/human-mascots/mascot-6.jpeg", name: "Mascot 6" },
  { src: "/packages/human-mascots/mascot-7.jpeg", name: "Mascot 7" },
  { src: "/packages/human-mascots/mascot-8.jpeg", name: "Mascot 8" },
  { src: "/packages/human-mascots/mascot-9.jpeg", name: "Mascot 9" },
  { src: "/packages/human-mascots/mascot-10.jpeg", name: "Mascot 10" },
  { src: "/packages/human-mascots/mascot-11.jpeg", name: "Mascot 11" },
  { src: "/packages/human-mascots/mascot-12.jpeg", name: "Mascot 12" },
  { src: "/packages/human-mascots/mascot-13.jpeg", name: "Mascot 13" },
  { src: "/packages/human-mascots/mascot-14.jpeg", name: "Mascot 14" },
  { src: "/packages/human-mascots/mascot-15.jpeg", name: "Mascot 15" },
  { src: "/packages/human-mascots/mascot-16.jpeg", name: "Mascot 16" },
];

const humanCostumeImages: PackageImage[] = [
  { src: "/packages/human-costumes/costume1.jpeg", name: "Costume 1" },
  { src: "/packages/human-costumes/costume2.jpeg", name: "Costume 2" },
  { src: "/packages/human-costumes/costume3.jpeg", name: "Costume 3" },
  { src: "/packages/human-costumes/costume4.jpeg", name: "Costume 4" },
  { src: "/packages/human-costumes/costume5.jpeg", name: "Costume 5" },
  { src: "/packages/human-costumes/costume6.jpeg", name: "Costume 6" },
  { src: "/packages/human-costumes/costume7.jpeg", name: "Costume 7" },
  { src: "/packages/human-costumes/costume8.jpeg", name: "Costume 8" },
  { src: "/packages/human-costumes/costume9.jpeg", name: "Costume 9" },
  { src: "/packages/human-costumes/costume10.jpeg", name: "Costume 10" },
  { src: "/packages/human-costumes/costume11.jpeg", name: "Costume 11" },
  { src: "/packages/human-costumes/costume12.jpeg", name: "Costume 12" },
  { src: "/packages/human-costumes/costume13.jpeg", name: "Costume 13" },
];

export const packages: Package[] = [
  {
    id: "human-mascots",
    name: "Human Mascots",
    subtitle: "Full-body character suits",
    description: "Full-body character mascots to bring your show characters to life on stage.",
    images: humanMascotImages,
    color: "#aa1324",
    lightColor: "#fcedf0",
  },
  {
    id: "human-costumes",
    name: "Human Costumes",
    subtitle: "Costumes for your performers",
    description: "A vibrant collection of human costumes perfect for ensemble performances and shows of all ages.",
    images: humanCostumeImages,
    color: "#6a9e0f",
    lightColor: "#f0f8e0",
  },
  {
    id: "animal-bundle",
    name: "Animal Bundle",
    subtitle: "The complete collection",
    description: "Full-body animal mascots and costumes to bring your show characters to life on stage.",
    images: [...humanMascotImages, ...humanCostumeImages],
    color: "#202973",
    lightColor: "#eef0f8",
  },
];

export function getPackageById(id: string): Package | undefined {
  return packages.find((p) => p.id === id);
}
