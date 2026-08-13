'use client';

import { useMemo, useState } from 'react';

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

export default function WealthPlanner() {
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [contractMonths, setContractMonths] = useState(8);
  const [leaveMonths, setLeaveMonths] = useState(4);
  const [monthlyFamily, setMonthlyFamily] = useState(1200);
  const [monthlyPersonal, setMonthlyPersonal] = useState(900);

  const result = useMemo(() => {
    const contractIncome = monthlyIncome * contractMonths;
    const familyDuringContract = monthlyFamily * contractMonths;
    const personalDuringContract = monthlyPersonal * contractMonths;
    const leaveReserve = (monthlyFamily + monthlyPersonal) * leaveMonths;
    const available = Math.max(0, contractIncome - familyDuringContract - personalDuringContract - leaveReserve);
    const savingsRate = contractIncome > 0 ? Math.round((available / contractIncome) * 100) : 0;
    return { contractIncome, leaveReserve, available, savingsRate };
  }, [monthlyIncome, contractMonths, leaveMonths, monthlyFamily, monthlyPersonal]);

  return (
    <section className="panel plannerPanel">
      <div className="panelHead">
        <div><span className="microLabel">CONTRACT PLANNER</span><h2>What can this contract build?</h2><p>Model the months at sea and the months ashore together.</p></div>
        <span className="statusPill positive">Live calculation</span>
      </div>
      <div className="plannerGrid">
        <label>Monthly ship income<input type="number" min="0" value={monthlyIncome} onChange={(e)=>setMonthlyIncome(Number(e.target.value))}/></label>
        <label>Contract months<input type="number" min="1" max="18" value={contractMonths} onChange={(e)=>setContractMonths(Number(e.target.value))}/></label>
        <label>Planned leave months<input type="number" min="0" max="18" value={leaveMonths} onChange={(e)=>setLeaveMonths(Number(e.target.value))}/></label>
        <label>Family support / month<input type="number" min="0" value={monthlyFamily} onChange={(e)=>setMonthlyFamily(Number(e.target.value))}/></label>
        <label>Personal costs / month<input type="number" min="0" value={monthlyPersonal} onChange={(e)=>setMonthlyPersonal(Number(e.target.value))}/></label>
      </div>
      <div className="plannerResults">
        <div><span>Contract income</span><b>{money(result.contractIncome)}</b></div>
        <div><span>Leave reserve needed</span><b>{money(result.leaveReserve)}</b></div>
        <div><span>Available for goals</span><b>{money(result.available)}</b></div>
        <div><span>Potential savings rate</span><b>{result.savingsRate}%</b></div>
      </div>
    </section>
  );
}
