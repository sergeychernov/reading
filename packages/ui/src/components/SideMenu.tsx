"use client";

import { type ReactNode, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { SxProps, Theme } from "@mui/material/styles";
import type { NavItem } from "../types/nav";
import type { RenderLinkFn } from "./HeaderMenu";

/**
 * Returns a Record of parent item labels that should be expanded
 * so that the item matching `activeHref` is visible.
 */
function getExpandedFromHref(
	items: NavItem[],
	activeHref: string | undefined,
): Record<string, boolean> {
	if (!activeHref) return {};
	const result: Record<string, boolean> = {};

	const check = (navItems: NavItem[]): boolean => {
		for (const item of navItems) {
			if (item.children && item.children.length > 0) {
				if (check(item.children)) {
					result[item.label] = true;
					return true;
				}
			} else if (item.href === activeHref) {
				return true;
			}
		}
		return false;
	};

	check(items);
	return result;
}

const defaultRenderLink: RenderLinkFn = (href, children) => (
  <a href={href} style={{ textDecoration: "none", color: "inherit", display: "contents" }}>
    {children}
  </a>
);

export interface SideMenuProps {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
  variant?: "permanent" | "persistent" | "temporary";
  anchor?: "left" | "right" | "top" | "bottom";
  renderLink?: RenderLinkFn;
  drawerWidth?: number;
  /** Slot for the drawer header (logo, title, etc.) */
  header?: ReactNode;
  /** Slot for the drawer footer (actions like logout, etc.) */
  footer?: ReactNode;
  /** href of the currently active page, used to highlight the matching nav item */
  activeHref?: string;
  /** Offset from the top edge of the viewport when anchor="top", e.g. to clear a fixed AppBar. Accepts a responsive object like { xs: 56, sm: 64 }. */
  topOffset?: number | string | Record<string, number | string>;
  /** sx forwarded to the root Drawer element, e.g. for responsive display overrides */
  sx?: SxProps<Theme>;
}

export function SideMenu({
  items,
  open,
  onClose,
  variant = "temporary",
  anchor = "left",
  renderLink = defaultRenderLink,
  drawerWidth = 260,
  header,
  footer,
  activeHref,
  topOffset,
  sx,
}: SideMenuProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => getExpandedFromHref(items, activeHref),
  );

  useEffect(() => {
    const newExpanded = getExpandedFromHref(items, activeHref);
    if (Object.keys(newExpanded).length > 0) {
      setExpanded((prev) => ({ ...prev, ...newExpanded }));
    }
  }, [activeHref, items]);

  const toggleExpanded = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href?: string) => !!href && href === activeHref;

  const renderItems = (navItems: NavItem[], depth = 0) =>
    navItems.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expanded[item.label] ?? false;
      const active = isActive(item.href);

      if (hasChildren) {
        return (
          <div key={item.label}>
            <ListItemButton
              onClick={() => toggleExpanded(item.label)}
              sx={{
                pl: 1.5 + depth * 1.5,
                pr: 1.5,
                py: 1,
                borderRadius: 1.5,
                mx: 0.5,
                gap: 1.5,
                color: "rgba(255,255,255,0.85)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                  color: "white",
                },
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ minWidth: "unset", color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { fontSize: 14, fontWeight: 500 } }}
              />
              <ChevronRightIcon
                sx={{
                  fontSize: 16,
                  ml: "auto",
                  transition: "transform 0.2s",
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </ListItemButton>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ mt: 0.5 }}>
                {renderItems(item.children!, depth + 1)}
              </List>
            </Collapse>
          </div>
        );
      }

      const content = (
        <ListItemButton
          key={item.label}
          sx={{
            pl: 1.5 + depth * 1.5,
            pr: 1.5,
            py: 1,
            borderRadius: 1.5,
            mx: 0.5,
            gap: 1.5,
            color: active ? "white" : "rgba(255,255,255,0.85)",
            bgcolor: active ? "rgba(255,255,255,0.12)" : "transparent",
            "&:hover": {
              bgcolor: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
              color: "white",
            },
          }}
          onClick={variant === "temporary" ? onClose : undefined}
        >
          {item.icon && (
            <ListItemIcon sx={{ minWidth: "unset", color: "inherit" }}>
              {item.icon}
            </ListItemIcon>
          )}
          <ListItemText
            primary={item.label}
            slotProps={{ primary: { fontSize: 14, fontWeight: 500 } }}
          />
        </ListItemButton>
      );

      return item.href
        ? <div key={item.label}>{renderLink(item.href, content)}</div>
        : <div key={item.label}>{content}</div>;
    });

  const isHorizontal = anchor === "top" || anchor === "bottom";

  return (
    <Drawer
      variant={variant}
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={[
        {
          width: variant === "permanent" ? drawerWidth : undefined,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isHorizontal ? "100%" : drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#0f172a",
            color: "white",
            border: "none",
            ...(anchor === "top" && {
              height: "auto",
              ...(topOffset !== undefined && { top: topOffset }),
            }),
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {header && (
        <>
          <Box sx={{ height: 64, display: "flex", alignItems: "center", px: 2, flexShrink: 0 }}>
            {header}
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        </>
      )}
      <List sx={{ flex: 1, py: 1.5, px: 0.5, overflowY: "auto" }}>
        {renderItems(items)}
      </List>
      {footer && (
        <>
          <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.08)" }} />
          <Box sx={{ p: 1 }}>
            {footer}
          </Box>
        </>
      )}
    </Drawer>
  );
}
