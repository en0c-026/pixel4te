import { Button, Spinner } from "flowbite-react";
import { ReactNode } from "react";

interface Props {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  color?: string;
}
export default function ActionButton({
  label,
  icon,
  disabled,
  onClick,
  isLoading,
  color = "info",
}: Props) {
  return (
    <Button disabled={disabled || isLoading} onClick={onClick} color={color}>
      {isLoading ? (
        <Spinner size="sm" color="gray" />
      ) : (
        <p className="inline-flex">
          {label}
          {icon && icon}
        </p>
      )}
    </Button>
  );
}
