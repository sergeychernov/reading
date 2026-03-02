"use client";

import Button from "@mui/material/Button";

type PrimaryButtonProps = {
  label: string;
};

export function PrimaryButton({ label }: PrimaryButtonProps) {
  return (
    <Button color="primary" variant="contained">
      {label}
    </Button>
  );
}
