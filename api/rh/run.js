const RH_BASE = "https://www.runninghub.ai/openapi/v2/run/ai-app";
const reply=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});

function safeLog(tag,payload,level="info"){
  try{ console[level](tag,JSON.stringify(payload)); }
  catch{ console[level](tag,payload); }
}

export default {async fetch(request){
  if(request.method!=="POST") return reply({error:"Method Not Allowed"},405);
  const apiKey=(request.headers.get("x-rh-key")||"").trim();
  if(!apiKey) return reply({error:"缺少 RunningHub API Key"},401);

  try{
    const body=await request.json();
    const appId=String(body?.appId||"").trim();
    if(!appId) return reply({error:"缺少 AI App ID"},400);

    const nodeInfoList=Array.isArray(body?.nodeInfoList)
      ? body.nodeInfoList
          .filter(x=>String(x?.nodeId||"").trim()&&String(x?.fieldName||"").trim())
          .map(x=>({
            nodeId:String(x.nodeId).trim(),
            fieldName:String(x.fieldName).trim(),
            fieldValue:String(x.fieldValue??""),
            description:x.description??null
          }))
      : [];

    const instanceType=["default","plus","ultra"].includes(body?.instanceType)?body.instanceType:"default";
    const personal=body?.usePersonalQueue===true||body?.usePersonalQueue==="true";
    const payload={nodeInfoList,instanceType,usePersonalQueue:String(personal)};

    if(typeof body?.webhookUrl==="string"&&body.webhookUrl.trim()) payload.webhookUrl=body.webhookUrl.trim();
    if(Number.isFinite(body?.retainSeconds)) payload.retainSeconds=body.retainSeconds;

    const response=await fetch(`${RH_BASE}/${encodeURIComponent(appId)}`,{
      method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},
      body:JSON.stringify(payload)
    });

    const result=await response.json().catch(()=>null);

    const getNode=(id,field)=>nodeInfoList.find(x=>x.nodeId===id&&x.fieldName===field)?.fieldValue||"";
    const mediaNodeIds=new Set(["141","142","143","161","175","176","164","144","160","189"]);
    const mediaNodes=nodeInfoList
      .filter(x=>mediaNodeIds.has(x.nodeId)&&x.fieldValue&&x.fieldValue!=="None")
      .map(x=>x.nodeId);

    if(!response.ok){
      safeLog("[RH_RUN_HTTP_ERROR]",{
        appId,
        httpStatus:response.status,
        errorCode:result?.errorCode||result?.code||"",
        errorMessage:result?.errorMessage||result?.message||result?.msg||"",
        promptTips:result?.promptTips||""
      },"error");
      return reply({
        error:result?.errorMessage||result?.message||result?.msg||`RunningHub 请求失败 (${response.status})`,
        raw:result
      },response.status);
    }

    safeLog("[RH_TASK_SUBMITTED]",{
      taskId:result?.taskId||"",
      status:result?.status||"",
      appId,
      aspectRatio:getNode("115","aspect_ratio"),
      duration:getNode("186","value"),
      quality:getNode("147","value"),
      instanceType,
      usePersonalQueue:String(personal),
      mediaNodes,
      errorCode:result?.errorCode||"",
      errorMessage:result?.errorMessage||"",
      promptTips:result?.promptTips||""
    },"info");

    if(result?.status==="FAILED"){
      safeLog("[RH_RUN_FAILED]",{
        taskId:result?.taskId||"",
        errorCode:result?.errorCode||"",
        errorMessage:result?.errorMessage||"",
        promptTips:result?.promptTips||""
      },"error");
    }

    return reply(result);
  }catch(error){
    safeLog("[RH_RUN_EXCEPTION]",{message:error instanceof Error?error.message:String(error)},"error");
    return reply({error:error instanceof Error?error.message:"任务提交失败"},500);
  }
}};