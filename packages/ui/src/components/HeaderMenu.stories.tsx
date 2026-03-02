import type { Meta, StoryObj } from "@storybook/react";
import { HeaderMenu } from "./HeaderMenu";
import { AppLogo } from "./AppLogo";
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
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const nestedItems: NavItem[] = [
  ...sampleItems,
  {
    label: "Solutions",
    children: [
      { label: "Enterprise", href: "/solutions/enterprise" },
      { label: "SMB", href: "/solutions/smb" },
      { label: "Startups", href: "/solutions/startups" },
    ],
  },
];

const meta = {
  title: "Navigation/HeaderMenu",
  component: HeaderMenu,
  tags: ["autodocs"],
  args: {
    items: sampleItems,
  },
} satisfies Meta<typeof HeaderMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNestedItems: Story = {
  args: {
    items: nestedItems,
  },
};

export const WithLogo: Story = {
  args: {
    logo: <AppLogo size={36} />,
  },
};
