import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
  icon?: ReactNode;
}
