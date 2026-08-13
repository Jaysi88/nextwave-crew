import { requireMember } from '@/lib/member';

function numberValue(value: unknown, max = 1_000_000_000) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= max ? parsed : null;
}

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const snapshots = await member.sql`select snapshot_date, monthly_ship_income, contract_months, planned_leave_months,
      monthly_family_support, emergency_fund, savings_total, investment_total, debt_total, currency, created_at
    from financial_snapshots where user_id = ${member.user.id}
    order by snapshot_date desc, created_at desc limit 1`;
  const goals = await member.sql`select id, name, goal_type, target_amount, current_amount, currency, target_date, status, created_at, updated_at
    from savings_goals where user_id = ${member.user.id} and status = 'active'
    order by target_date nulls last, created_at`;
  return Response.json({ snapshot: snapshots[0] ?? null, goals });
}

export async function PUT(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const monthlyIncome = numberValue(input.monthlyShipIncome);
  const contractMonths = numberValue(input.contractMonths, 24);
  const leaveMonths = numberValue(input.plannedLeaveMonths, 24);
  const monthlyFamily = numberValue(input.monthlyFamilySupport);
  const emergencyFund = numberValue(input.emergencyFund);
  const savingsTotal = numberValue(input.savingsTotal);
  const investmentTotal = numberValue(input.investmentTotal);
  const debtTotal = numberValue(input.debtTotal);
  const currency = typeof input.currency === 'string' && /^[A-Z]{3}$/.test(input.currency) ? input.currency : 'USD';
  if ([monthlyIncome, contractMonths, leaveMonths, monthlyFamily, emergencyFund, savingsTotal, investmentTotal, debtTotal].some(v => v === null)) {
    return Response.json({ error: 'Enter valid non-negative financial values.' }, { status: 400 });
  }
  const rows = await member.sql`insert into financial_snapshots
      (user_id, snapshot_date, monthly_ship_income, contract_months, planned_leave_months, monthly_family_support,
       emergency_fund, savings_total, investment_total, debt_total, currency)
    values (${member.user.id}, current_date, ${monthlyIncome}, ${contractMonths}, ${leaveMonths}, ${monthlyFamily},
      ${emergencyFund}, ${savingsTotal}, ${investmentTotal}, ${debtTotal}, ${currency})
    on conflict (user_id, snapshot_date) do update set
      monthly_ship_income = excluded.monthly_ship_income, contract_months = excluded.contract_months,
      planned_leave_months = excluded.planned_leave_months, monthly_family_support = excluded.monthly_family_support,
      emergency_fund = excluded.emergency_fund, savings_total = excluded.savings_total,
      investment_total = excluded.investment_total, debt_total = excluded.debt_total, currency = excluded.currency
    returning snapshot_date, monthly_ship_income, contract_months, planned_leave_months, monthly_family_support,
      emergency_fund, savings_total, investment_total, debt_total, currency`;
  return Response.json({ snapshot: rows[0] });
}
