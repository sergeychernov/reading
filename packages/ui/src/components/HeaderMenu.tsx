"use client";

import { useState, useRef, type KeyboardEvent, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import type { NavItem } from "../types/nav";

export type RenderLinkFn = (href: string, children: ReactNode) => ReactNode;

const defaultRenderLink: RenderLinkFn = (href, children) => (
  <a href={href} style={{ textDecoration: "none", color: "inherit" }}>
    {children}
  </a>
);

const topLevelLinkSx = {
  display: "inline-flex",
  alignItems: "center",
  px: 1,
  py: 0.75,
  borderRadius: 3,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.75,
  color: "inherit",
  transition: "background-color 0.2s",
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.08)",
  },
} as const;

const submenuLinkSx = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  minWidth: 160,
  px: 2,
  py: 1,
  fontSize: 14,
  color: "white",
} as const;

export interface HeaderMenuProps {
  items: NavItem[];
  logo?: ReactNode;
  renderLink?: RenderLinkFn;
}

export function HeaderMenu({ items, logo, renderLink = defaultRenderLink }: HeaderMenuProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const anchorRefs = useRef<(HTMLElement | null)[]>([]);

  const handleMouseEnter = (index: number) => {
    setOpenIndex(index);
  };

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleParentKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpenIndex(index);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpenIndex(null);
    }
  };

  const handleClose = () => {
    setOpenIndex(null);
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}
      onMouseLeave={handleClose}
    >
      {logo && (
        <Box sx={{ mr: 2, flexShrink: 0 }}>
          {logo}
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {items.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;

          return (
            <Box
              key={item.label}
              ref={(el: HTMLElement | null) => { anchorRefs.current[index] = el; }}
              onMouseEnter={() => {
                if (hasChildren) {
                  handleMouseEnter(index);
                } else {
                  handleClose();
                }
              }}
            >
              {hasChildren ? (
                <>
                  <Button
                    color="inherit"
                    endIcon={<ArrowDropDownIcon />}
                    sx={{ textTransform: "none" }}
                    aria-haspopup="menu"
                    aria-expanded={openIndex === index ? "true" : undefined}
                    aria-controls={openIndex === index ? `header-menu-${index}` : undefined}
                    onClick={() => handleToggle(index)}
                    onKeyDown={(event) => handleParentKeyDown(event, index)}
                  >
                    {item.label}
                  </Button>

                  <Popper
                    open={openIndex === index}
                    anchorEl={anchorRefs.current[index]}
                    placement="bottom-start"
                    disablePortal={true}
                    style={{ zIndex: 1300 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        bgcolor: "#0f172a",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 0,
                        mt: 0.5,
                        overflow: "hidden",
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList id={`header-menu-${index}`} sx={{ py: 0.5 }}>
                          {item.children!.map((child) => (
                            child.href ? (
                              <Box
                                key={child.label}
                                component="li"
                                sx={{
                                  listStyle: "none",
                                  borderRadius: 0,
                                  "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.08)",
                                  },
                                  "&:focus-within": {
                                    bgcolor: "rgba(255,255,255,0.08)",
                                  },
                                }}
                                onClick={handleClose}
                              >
                                {renderLink(
                                  child.href,
                                  <Box component="span" sx={submenuLinkSx}>
                                    {child.label}
                                  </Box>,
                                )}
                              </Box>
                            ) : (
                              <MenuItem
                                key={child.label}
                                onClick={handleClose}
                                sx={{
                                  minWidth: 160,
                                  fontSize: 14,
                                  color: "white",
                                  "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.08)",
                                  },
                                }}
                              >
                                {child.label}
                              </MenuItem>
                            )
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Popper>
                </>
              ) : item.href ? (
                renderLink(
                  item.href,
                  <Box component="span" sx={topLevelLinkSx}>
                    {item.label}
                  </Box>,
                )
              ) : (
                <Button color="inherit" sx={{ textTransform: "none" }}>
                  {item.label}
                </Button>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
