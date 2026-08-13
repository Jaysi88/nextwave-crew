import Link from 'next/link';

const plans = [
  {name:'Crew Free',price:'$0',text:'Start your professional maritime identity.',features:['CrewID profile','Community access','Basic career tools','Basic CrewWealth planner']},
  {name:'Crew Plus',price:'$7',text:'For active crew building their career and finances.',features:['Everything in Free','Document vault & reminders','Advanced CrewWealth','Learning & member benefits'],featured:true},
  {name:'Crew Pro',price:'$15',text:'For senior crew, leaders and career movers.',features:['Everything in Plus','Verification priority','Career intelligence','Mentor & expert network']},
];
export default function Membership(){return <main className="membershipPage"><section className="sectionHeading"><span className="microLabel">FOUNDING MEMBERSHIP</span><h1>A membership that keeps working between contracts.</h1><p>Start free. Upgrade when the professional and financial tools earn their place in your life.</p></section><div className="pricingGrid">{plans.map(p=><article className={`priceCard ${p.featured?'featuredPrice':''}`} key={p.name}>{p.featured&&<span className="popular">FOUNDING PICK</span>}<h2>{p.name}</h2><p>{p.text}</p><div className="price"><b>{p.price}</b><span>/ month</span></div><ul>{p.features.map(f=><li key={f}>✓ {f}</li>)}</ul><Link className={p.featured?'primaryButton':'ghostButton'} href="/auth/sign-in">Choose {p.name}</Link></article>)}</div><p className="centerNote">Pricing is a launch hypothesis. Paid subscription checkout is not active yet.</p></main>}
