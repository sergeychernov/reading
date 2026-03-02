import type { Meta, StoryObj } from "@storybook/react";
import { BurgerMenu } from "./BurgerMenu";
import type { NavItem } from "../types/nav";

const sampleItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    children: [
      { label: "Products", href: "/about/products" },
      { label: "Services", href: "/about/services" },
    ],
  },
  {
    label: "Solutions",
    children: [
      { label: "Enterprise", href: "/solutions/enterprise" },
      { label: "SMB", href: "/solutions/smb" },
      { label: "Startups", href: "/solutions/startups" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const meta = {
  title: "Navigation/BurgerMenu",
  component: BurgerMenu,
  tags: ["autodocs"],
  args: {
    items: sampleItems,
  },
} satisfies Meta<typeof BurgerMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveItem: Story = {
  args: {
    activeHref: "/blog",
  },
};
