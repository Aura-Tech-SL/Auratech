"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export interface BlockData {
  _clientId: string;
  id?: string;
  type: string;
  order: number;
  data: Record<string, any>;
  isVisible: boolean;
}

let clientIdCounter = 0;
export function genClientId() {
  return `block_${Date.now()}_${++clientIdCounter}`;
}

/**
 * State + handlers for one editable variant of a page or article. The page
 * editor uses this hook once for the primary variant; in side-by-side mode
 * a second instance is created for the compare variant.
 */
export function useVariantState() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [title, setTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  function loadFromApi(data: { title: string; blocks: any[] }) {
    setTitle(data.title);
    setBlocks(
      data.blocks.map((b) => ({
        _clientId: genClientId(),
        id: b.id,
        type: b.type,
        order: b.order,
        data: b.data || {},
        isVisible: b.isVisible,
      })),
    );
    setSelectedClientId(null);
  }

  function clear() {
    setBlocks([]);
    setTitle("");
    setSelectedClientId(null);
  }

  /**
   * Replace the whole block list at once. Used for "copy from other locale"
   * — drops persisted ids so each clone becomes a new row on save.
   */
  function setBlocksRaw(
    next: Array<{
      type: string;
      data: Record<string, any>;
      isVisible: boolean;
    }>,
  ) {
    setBlocks(
      next.map((b, i) => ({
        _clientId: genClientId(),
        type: b.type,
        order: i,
        data: JSON.parse(JSON.stringify(b.data)),
        isVisible: b.isVisible,
      })),
    );
    setSelectedClientId(null);
  }

  function insertBlockAt(type: string, atIndex: number) {
    const newBlock: BlockData = {
      _clientId: genClientId(),
      type,
      order: atIndex,
      data: {},
      isVisible: true,
    };
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(atIndex, 0, newBlock);
      return next.map((b, i) => ({ ...b, order: i }));
    });
    setSelectedClientId(newBlock._clientId);
  }

  function removeBlock(clientId: string) {
    setBlocks((prev) => prev.filter((b) => b._clientId !== clientId));
    setSelectedClientId((sel) => (sel === clientId ? null : sel));
  }

  function duplicateBlock(clientId: string) {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b._clientId === clientId);
      if (index === -1) return prev;
      const original = prev[index];
      const copy: BlockData = {
        _clientId: genClientId(),
        type: original.type,
        order: index + 1,
        data: JSON.parse(JSON.stringify(original.data)),
        isVisible: original.isVisible,
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      setSelectedClientId(copy._clientId);
      return next.map((b, i) => ({ ...b, order: i }));
    });
  }

  function reorderBlocks(oldIndex: number, newIndex: number) {
    setBlocks((prev) =>
      arrayMove(prev, oldIndex, newIndex).map((b, i) => ({ ...b, order: i })),
    );
  }

  function toggleVisibility(clientId: string) {
    setBlocks((prev) =>
      prev.map((b) =>
        b._clientId === clientId ? { ...b, isVisible: !b.isVisible } : b,
      ),
    );
  }

  function updateBlockData(clientId: string, data: Record<string, any>) {
    setBlocks((prev) =>
      prev.map((b) => (b._clientId === clientId ? { ...b, data } : b)),
    );
  }

  const selectedBlock =
    blocks.find((b) => b._clientId === selectedClientId) ?? null;

  return {
    blocks,
    title,
    setTitle,
    selectedClientId,
    setSelectedClientId,
    selectedBlock,
    loadFromApi,
    clear,
    setBlocksRaw,
    insertBlockAt,
    removeBlock,
    duplicateBlock,
    reorderBlocks,
    toggleVisibility,
    updateBlockData,
  };
}
