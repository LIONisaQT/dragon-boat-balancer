import { useEffect } from "react";

export function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  onClickInside: () => void,
  onClickOutside: () => void,
  excludedRefs: React.RefObject<HTMLElement>[] = [],
) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!ref.current) return;

      // Click inside main ref
      if (ref.current.contains(target)) {
        onClickInside();
        return;
      }

      // Click inside any excluded refs, ignore click
      for (const excludedRef of excludedRefs) {
        if (excludedRef.current && excludedRef.current.contains(target)) {
          return;
        }
      }

      onClickOutside();
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, onClickInside, onClickOutside, excludedRefs]);
}
