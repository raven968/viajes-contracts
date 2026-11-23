import { z } from 'zod';
import { IsoDateTime, SignedCents } from './common.js';
import { DriverStatusSchema, LedgerEntryTypeSchema } from './enums.js';

/** Movimiento chofer↔tenant (`GET /ledger/entries`). */
export const LedgerEntry = z.object({
  id: z.string(),
  driverId: z.string(),
  driverName: z.string().nullable(),
  type: LedgerEntryTypeSchema,
  /** Positivo = aumenta la deuda del chofer con el tenant; negativo = la reduce (pago/liquidación). */
  amountCents: SignedCents,
  /** Saldo del chofer después de este movimiento. */
  balanceAfterCents: SignedCents,
  rideId: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: IsoDateTime,
});
export type LedgerEntry = z.infer<typeof LedgerEntry>;

/** Deuda actual por chofer (`GET /ledger/debts`). */
export const DriverDebt = z.object({
  driverId: z.string(),
  driverName: z.string().nullable(),
  status: DriverStatusSchema,
  balanceCents: SignedCents,
  lastSettlementAt: IsoDateTime.nullable(),
});
export type DriverDebt = z.infer<typeof DriverDebt>;
