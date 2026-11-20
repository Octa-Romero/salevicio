export const API=(import.meta.env.VITE_API_URL||'http://localhost:3000').replace(/\/$/,'');
const KEY='salevicio_sesion';
export function getToken(){try{return sessionStorage.getItem(KEY);}catch{return null;}}
export function setToken(token){try{if(token)sessionStorage.setItem(KEY,token);else sessionStorage.removeItem(KEY);}catch{/* navegador sin almacenamiento */}}
export async function request(path,{method='GET',body,signal,publico=false}={}){
 const headers={Accept:'application/json'};
 if(body!==undefined)headers['Content-Type']='application/json';
 if(!publico&&getToken())headers.Authorization=`Bearer ${getToken()}`;
 let response;
 try{response=await fetch(`${API}${path}`,{method,headers,signal,...(body!==undefined?{body:JSON.stringify(body)}:{})});}
 catch(e){if(e?.name==='AbortError')throw e;throw new Error('No pudimos conectar con el servidor. Reintentá en un momento.');}
 const data=await response.json().catch(()=>({}));
 if(!response.ok){const e=new Error(data.error||'Error en la solicitud');e.status=response.status;throw e;}
 return data;
}
