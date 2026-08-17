import { InventoryItem, StockRecord } from '../types';
import { apiClient } from './api';
import { apiDelete, apiGet, apiPost, apiPut } from './api';

export interface ApiInventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  goodCount?: number;
  damagedCount?: number;
  repairCount?: number;
  location?: string;
  unit?: string;
  lowStockLimit?: number;
  minRequired?: number;
  description?: string;
}

export interface ApiTransaction {
  _id: string;
  inventoryId: string | { _id: string; name: string };
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  note?: string;
  supplierName?: string;
  supplierContact?: string;
  supplierEmail?: string;
  purchaseCost?: number;
  invoiceFileName?: string;
  date?: string;
  createdAt?: string;
}

function mapTransactionType(type: ApiTransaction['type']): StockRecord['type'] {
  if (type === 'IN') return 'Incoming';
  if (type === 'OUT') return 'Outgoing';
  return 'Adjustment';
}

function mapStockRecordType(type: StockRecord['type']): ApiTransaction['type'] {
  if (type === 'Incoming') return 'IN';
  if (type === 'Outgoing') return 'OUT';
  return 'ADJUSTMENT';
}

export function mapApiInventoryToItem(item: ApiInventoryItem): InventoryItem {
  const goodCount = item.goodCount ?? item.quantity ?? 0;
  const damagedCount = item.damagedCount ?? 0;
  const repairCount = item.repairCount ?? 0;

  return {
    id: item._id,
    name: item.name,
    category: item.category as InventoryItem['category'],
    quantity: item.quantity ?? goodCount + damagedCount + repairCount,
    goodCount,
    damagedCount,
    repairCount,
    location: item.location || 'Hostel Common Area',
    minRequired: item.minRequired ?? item.lowStockLimit ?? 5,
  };
}

export function mapInventoryItemToPayload(item: Omit<InventoryItem, 'id'> | InventoryItem) {
  return {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    goodCount: item.goodCount,
    damagedCount: item.damagedCount,
    repairCount: item.repairCount,
    location: item.location,
    minRequired: item.minRequired,
    lowStockLimit: item.minRequired,
    unit: 'units',
  };
}

export function mapApiTransactionToStockRecord(tx: ApiTransaction): StockRecord {
  const inventoryRef = tx.inventoryId;
  const inventoryItemId = typeof inventoryRef === 'object' ? inventoryRef._id : inventoryRef;
  const inventoryItemName =
    typeof inventoryRef === 'object' ? inventoryRef.name : 'Unknown Item';

  return {
    id: tx._id,
    inventoryItemId,
    inventoryItemName,
    type: mapTransactionType(tx.type),
    quantity: tx.quantity,
    date: (tx.date || tx.createdAt || new Date().toISOString()).split('T')[0],
    supplierName: tx.supplierName,
    supplierContact: tx.supplierContact,
    supplierEmail: tx.supplierEmail,
    purchaseCost: tx.purchaseCost,
    invoiceFileName: tx.invoiceFileName,
    notes: tx.note,
  };
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const data = await apiGet<ApiInventoryItem[]>('/inventory');
  return data.map(mapApiInventoryToItem);
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  const created = await apiPost<ApiInventoryItem>('/inventory', mapInventoryItemToPayload(item));
  return mapApiInventoryToItem(created);
}

export async function updateInventoryItemApi(item: InventoryItem): Promise<InventoryItem> {
  const updated = await apiPut<ApiInventoryItem>(
    `/inventory/${item.id}`,
    mapInventoryItemToPayload(item)
  );
  return mapApiInventoryToItem(updated);
}

export async function deleteInventoryItemApi(id: string): Promise<void> {
  await apiDelete(`/inventory/${id}`);
}

export async function fetchStockRecords(): Promise<StockRecord[]> {
  const data = await apiGet<ApiTransaction[]>('/stock/history');
  return data.map(mapApiTransactionToStockRecord);
}

export async function createStockRecord(
  record: Omit<StockRecord, 'id'>
): Promise<StockRecord> {
  if (record.type === 'Incoming') {
    const response = await apiClient.post<{ transaction: ApiTransaction }>('/stock/in', {
      inventoryId: record.inventoryItemId,
      quantity: record.quantity,
      note: record.notes,
      supplierName: record.supplierName,
      supplierContact: record.supplierContact,
      supplierEmail: record.supplierEmail,
      purchaseCost: record.purchaseCost,
      invoiceFileName: record.invoiceFileName,
    });
    return mapApiTransactionToStockRecord(response.data.transaction);
  }

  if (record.type === 'Outgoing') {
    const response = await apiClient.post<{ transaction: ApiTransaction }>('/stock/out', {
      inventoryId: record.inventoryItemId,
      quantity: record.quantity,
      note: record.notes,
    });
    return mapApiTransactionToStockRecord(response.data.transaction);
  }

  const response = await apiClient.post<{ transaction: ApiTransaction }>('/stock/adjustment', {
    inventoryId: record.inventoryItemId,
    quantity: record.quantity,
    note: record.notes,
  });
  return mapApiTransactionToStockRecord(response.data.transaction);
}

export async function deleteStockRecordApi(id: string): Promise<void> {
  await apiDelete(`/stock/history/${id}`);
}

export { mapStockRecordType };
