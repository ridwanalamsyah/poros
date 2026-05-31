import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useCart } from "./useCart";

describe("useCart", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("adds items and accumulates quantity for the same slug", () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.add("tote", 1));
    act(() => result.current.add("tote", 2));
    expect(result.current.lines).toEqual([{ slug: "tote", qty: 3 }]);
    expect(result.current.totalCount).toBe(3);
  });

  it("setQty to 0 removes the line", () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.add("zine", 2));
    act(() => result.current.setQty("zine", 0));
    expect(result.current.lines).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it("remove and clear empty the cart", () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.add("a", 1));
    act(() => result.current.add("b", 1));
    act(() => result.current.remove("a"));
    expect(result.current.lines).toEqual([{ slug: "b", qty: 1 }]);
    act(() => result.current.clear());
    expect(result.current.lines).toEqual([]);
  });
});
