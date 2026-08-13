'use client';

import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Job = { id: string; title: string; department: string; vessel_type?: string; region?: string; description: string; salary_min?: number | string; salary_max?: number | string; salary_currency?: string; contract_months?: number | string; company_name?: string; company_verification?: string; application_status?: string };

export default function CareerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState('');
  async function load(q = '', department = '', vesselType = '') {
    const r = await fetch(`/api/jobs?q=${encodeURIComponent(q)}&department=${encodeURIComponent(department)}&vesselType=${encodeURIComponent(vesselType)}`);
    const j = await r.json(); if (r.ok) setJobs(j.jobs); else setMessage(j.error || 'Unable to load vacancies.');
  }
  useEffect(() => { void fetch('/api/jobs').then(async r => { const j = await r.json(); if (r.ok) setJobs(j.jobs); else setMessage(j.error || 'Connect Neon and sign in to activate the Career Center.'); }); }, []);
  function search(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); void load(String(form.get('q') || ''), String(form.get('department') || ''), String(form.get('vesselType') || '')); }
  async function apply(job: Job) { setMessage(`Applying for ${job.title}…`); const r = await fetch('/api/applications', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobId: job.id }) }); const j = await r.json(); setMessage(r.ok ? `Application submitted for ${job.title}.` : j.error || 'Unable to apply.'); if (r.ok) await load(); }
  async function withdraw(job: Job) { const r = await fetch('/api/applications', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobId: job.id }) }); const j = await r.json(); setMessage(r.ok ? `Application withdrawn from ${job.title}.` : j.error || 'Unable to withdraw.'); if (r.ok) await load(); }
  const activeStatuses = new Set(['applied','screening','interview','offer']);
  return <AppShell title="Career Center" kicker="NEXT CONTRACT">
    <div className="demoBanner">Vacancies appear only when published through an authorized recruiter or admin workflow. Member applications remain private.</div>
    <section className="panel"><form className="supportForm" onSubmit={search}><label>Search<input name="q" placeholder="Role, company or keyword" /></label><label>Department<input name="department" placeholder="Casino, Deck, Engine, Hotel…" /></label><label>Vessel type<input name="vesselType" placeholder="Cruise, Cargo, Offshore…" /></label><button className="primaryButton" type="submit">Find roles</button></form></section>
    {message && <p>{message}</p>}
    <div className="communityGrid">{jobs.map(job => { const active = job.application_status && activeStatuses.has(job.application_status); return <article className="communityCard" key={job.id}><span className="microLabel">{job.company_verification === 'verified' ? '✓ VERIFIED EMPLOYER' : 'VACANCY'}</span><h3>{job.title}</h3><p><b>{job.company_name || 'Maritime employer'}</b> · {job.department}{job.vessel_type ? ` · ${job.vessel_type}` : ''}</p><p>{job.region || 'International'}{job.contract_months ? ` · ${job.contract_months} month contract` : ''}</p><p>{job.description}</p>{job.salary_currency && (job.salary_min || job.salary_max) && <p><b>{job.salary_currency} {job.salary_min || '—'}–{job.salary_max || '—'}</b></p>}<div>{active ? <><span className="statusPill">{job.application_status}</span> <button className="ghostButton small" onClick={() => withdraw(job)}>Withdraw</button></> : <button className="primaryButton" onClick={() => apply(job)} disabled={Boolean(job.application_status && job.application_status !== 'withdrawn')}>{job.application_status === 'withdrawn' ? 'Apply again' : job.application_status ? `Application: ${job.application_status}` : 'Apply with CrewID'}</button>}</div></article>; })}</div>
    {!jobs.length && !message && <p>No published vacancies yet. Recruiter publishing will be enabled only after role-based access controls are in place.</p>}
  </AppShell>;
}
