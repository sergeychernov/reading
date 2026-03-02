import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SideMenu } from "./SideMenu";
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

const sampleHeader = (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <AppLogo size={32} />
    <Typography variant="subtitle1" fontWeight={700} color="white">
      Public Zone
    </Typography>
  </Box>
);

const meta = {
  title: "Navigation/SideMenu",
  component: SideMenu,
  tags: ["autodocs"],
  args: {
    items: sampleItems,
    open: true,
    onClose: fn(),
    header: sampleHeader,
  },
} satisfies Meta<typeof SideMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: { open: true },
};

export const Closed: Story = {
  args: { open: false },
};

export const WithActiveItem: Story = {
  args: {
    open: true,
    activeHref: "/blog",
  },
};

export const Permanent: Story = {
  args: {
    open: true,
    variant: "permanent",
    activeHref: "/",
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 500, width: 280 }}>
        <Story />
      </div>
    ),
  ],
};
