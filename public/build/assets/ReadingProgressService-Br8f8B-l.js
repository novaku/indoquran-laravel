import{p as r,c as a}from"./index-WWm_ItZ_.js"
const t=async()=>{try{const r=await a("/api/reading-progress")
if(!r.ok)throw Error("Failed to get reading progress")
return await r.json()}catch(r){throw r}},s=async(a,t)=>{try{const s=await r("/api/reading-progress",{surah_number:a,ayah_number:t})
if(!s.ok)throw Error("Failed to update reading progress")
return await s.json()}catch(s){throw s}}
export{t as g,s as u}
