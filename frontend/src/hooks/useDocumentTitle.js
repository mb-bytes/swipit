import { useEffect } from "react";

/**
 * Custom hook to update document.title for a component.
 *
 * @param {string} title - The title to display in the browser tab.
 * @param {boolean} [retainOnUnmount=false] - Whether to keep the title after component unmounts.
 */
export function useDocumentTitle(title, retainOnUnmount = false) {
  useEffect(() => {
    if (!title) return;
    const previousTitle = document.title;
    document.title = title;

    return () => {
      if (!retainOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, retainOnUnmount]);
}

export default useDocumentTitle;
