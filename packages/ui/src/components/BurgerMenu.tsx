"use client";

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { SideMenu } from "./SideMenu";
import type { NavItem } from "../types/nav";
import type { RenderLinkFn } from "./HeaderMenu";

export interface BurgerMenuProps {
  items: NavItem[];
  renderLink?: RenderLinkFn;
  activeHref?: string;
  /** Offset from the top of the viewport to clear a fixed/static AppBar. Accepts a responsive object like { xs: 56, sm: 64 }. */
  topOffset?: number | string | Record<string, number | string>;
}

export function BurgerMenu({ items, renderLink, activeHref, topOffset }: BurgerMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        color="inherit"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((prev) => !prev)}
        edge="start"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <SideMenu
        items={items}
        open={open}
        onClose={() => setOpen(false)}
        variant="temporary"
        anchor="top"
        topOffset={topOffset}
        renderLink={renderLink}
        activeHref={activeHref}
      />
    </>
  );
}
