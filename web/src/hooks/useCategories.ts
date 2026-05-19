import { getCategories } from "../data/api";
import { useAsync } from "./useAsync";

export function useCategories() {
  return useAsync(() => getCategories(), []);
}
