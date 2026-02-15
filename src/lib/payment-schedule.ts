export type PaymentStatus = 'paid' | 'overdue' | 'upcoming';

export interface PaymentEntry {
  date: string; // YYYY-MM-DD
  status: PaymentStatus;
}

function addCycle(d: Date, cycle: string): Date {
  const result = new Date(d);
  if (cycle === 'quarterly') {
    result.setMonth(result.getMonth() + 3);
  } else if (cycle === 'annual') {
    result.setFullYear(result.getFullYear() + 1);
  } else {
    // monthly or custom → 1 month
    result.setMonth(result.getMonth() + 1);
  }
  return result;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getPaymentSchedule(plan: {
  startDate: string;
  billingCycle: string;
  lastPaymentDate: string | null;
}): PaymentEntry[] {
  const { startDate, billingCycle, lastPaymentDate } = plan;
  const today = toYMD(new Date());
  const lastPaid = lastPaymentDate ?? '';

  const entries: PaymentEntry[] = [];
  // Use T12:00:00 to stay in the middle of the day and avoid DST boundary issues
  let current = new Date(startDate + 'T12:00:00');

  for (let i = 0; i < 120; i++) {
    const dateStr = toYMD(current);

    let status: PaymentStatus;
    if (lastPaid && dateStr <= lastPaid) {
      status = 'paid';
    } else if (dateStr <= today) {
      status = 'overdue';
    } else {
      status = 'upcoming';
    }

    entries.push({ date: dateStr, status });

    // Stop after the first upcoming entry
    if (status === 'upcoming') break;

    current = addCycle(current, billingCycle);
  }

  return entries;
}
