const RH_QUERY_URL = "https://www.runninghub.ai/openapi/v2/query";
const reply=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});

function safeLog(tag,payload){
  try{ console.error(tag,JSON.stringify(payload)); }
  catch{ console.error(tag,payload); }
}

export default {async fetch(request){
  if(request.method!=="POST") return reply({error:"Method Not Allowed"},405);
  const apiKey=(request.headers.get("x-rh-key")||"").trim();
  if(!apiKey) return reply({error:"缺少 RunningHub API Key"},401);

  try{
    const body=await request.json();
    const taskId=String(body?.taskId||"").trim();
    if(!taskId) return reply({error:"缺少 taskId"},400);

    const response=await fetch(RH_QUERY_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},
      body:JSON.stringify({taskId})
    });

    const result=await response.json().catch(()=>null);

    if(!response.ok){
      safeLog("[RH_QUERY_HTTP_ERROR]",{
        taskId,
        httpStatus:response.status,
        errorCode:result?.errorCode||result?.code||"",
        errorMessage:result?.errorMessage||result?.message||result?.msg||"",
        failedReason:result?.failedReason||null
      });
      return reply({
        error:result?.errorMessage||result?.message||result?.msg||`RunningHub 查询失败 (${response.status})`,
        raw:result
      },response.status);
    }

    if(result?.status==="FAILED"){
      safeLog("[RH_TASK_FAILED]",{
        taskId:result?.taskId||taskId,
        errorCode:result?.errorCode||"",
        errorMessage:result?.errorMessage||"",
        failedReason:result?.failedReason||{},
        promptTips:result?.promptTips||"",
        usage:result?.usage||null
      });
    }

    return reply(result);
  }catch(error){
    safeLog("[RH_QUERY_EXCEPTION]",{message:error instanceof Error?error.message:String(error)});
    return reply({error:error instanceof Error?error.message:"任务查询失败"},500);
  }
}};