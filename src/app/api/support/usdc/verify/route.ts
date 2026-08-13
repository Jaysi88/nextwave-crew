import { db, hasDatabase } from '@/lib/db';
import { ERC20_TRANSFER_TOPIC, fromUsdcUnits, isEvmAddress, normalizeNetwork, topicToAddress, toUsdcUnits, USDC_NETWORKS } from '@/lib/usdc';

type RpcReceipt = { status?: string; blockNumber?: string; logs?: Array<{ address?: string; topics?: string[]; data?: string }> };

async function rpc<T>(rpcUrl:string,method:string,params:unknown[]):Promise<T|null>{
  const response=await fetch(rpcUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),cache:'no-store'});
  if(!response.ok) throw new Error('BNB Smart Chain RPC request failed.');
  const payload=await response.json() as {result?:T;error?:{message?:string}};
  if(payload.error) throw new Error(payload.error.message||'BNB Smart Chain RPC returned an error.');
  return payload.result??null;
}

export async function POST(request:Request){
  try{
    const body=await request.json() as {txHash?:string;amount?:string;network?:string;supporterName?:string;message?:string};
    const txHash=String(body.txHash||'').trim();
    if(!/^0x[a-fA-F0-9]{64}$/.test(txHash)) return Response.json({verified:false,error:'Invalid transaction hash.'},{status:400});
    const configuredNetwork=normalizeNetwork(process.env.NEXT_PUBLIC_USDC_NETWORK);
    const requestedNetwork=normalizeNetwork(body.network);
    if(requestedNetwork!==configuredNetwork) return Response.json({verified:false,error:'Payment network does not match this deployment.'},{status:400});
    const recipient=process.env.NEXT_PUBLIC_USDC_RECIPIENT_ADDRESS||'0xf8766be6d62f80c7e5f37af4a07f4faca0dac9fe';
    if(!isEvmAddress(recipient)) return Response.json({verified:false,error:'Support wallet is not configured.'},{status:503});
    const chain=USDC_NETWORKS[configuredNetwork];
    const expectedUnits=toUsdcUnits(String(body.amount||''),chain.usdcDecimals);
    const rpcUrl=process.env.BSC_RPC_URL||chain.rpcUrl;
    const receipt=await rpc<RpcReceipt>(rpcUrl,'eth_getTransactionReceipt',[txHash]);
    if(!receipt) return Response.json({verified:false,error:'Transaction is still pending. Try verification again shortly.'},{status:409});
    if(receipt.status!=='0x1') return Response.json({verified:false,error:'The transaction did not complete successfully.'},{status:400});
    const recipientLower=recipient.toLowerCase(); const usdcLower=chain.usdcAddress.toLowerCase(); let sender=''; let verifiedUnits=0n;
    for(const log of receipt.logs||[]){
      if((log.address||'').toLowerCase()!==usdcLower) continue;
      if((log.topics?.[0]||'').toLowerCase()!==ERC20_TRANSFER_TOPIC) continue;
      if(topicToAddress(log.topics?.[2]||'')!==recipientLower) continue;
      const units=BigInt(log.data||'0x0'); if(units!==expectedUnits) continue;
      sender=topicToAddress(log.topics?.[1]||''); verifiedUnits=units; break;
    }
    if(verifiedUnits!==expectedUnits||!sender) return Response.json({verified:false,error:'No matching Binance-Peg USDC transfer to the configured BSC wallet was found in this transaction.'},{status:400});
    if(hasDatabase()){
      const sql=db();
      await sql`insert into support_payments (tx_hash,network,token_symbol,token_contract,sender_address,recipient_address,amount_atomic,amount_display,supporter_name,supporter_message,block_number,status,verified_at) values (${txHash.toLowerCase()},${configuredNetwork},'USDC',${chain.usdcAddress.toLowerCase()},${sender},${recipientLower},${verifiedUnits.toString()},${fromUsdcUnits(verifiedUnits,chain.usdcDecimals)},${String(body.supporterName||'').slice(0,80)||null},${String(body.message||'').slice(0,240)||null},${receipt.blockNumber?Number.parseInt(receipt.blockNumber,16):null},'verified',now()) on conflict (tx_hash) do update set verified_at=excluded.verified_at,status='verified'`;
    }
    return Response.json({verified:true,txHash,network:configuredNetwork,amount:fromUsdcUnits(verifiedUnits,chain.usdcDecimals),sender,persisted:hasDatabase()});
  }catch(error){return Response.json({verified:false,error:error instanceof Error?error.message:'Unable to verify payment.'},{status:500});}
}
