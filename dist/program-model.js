/* Draft data stays on this device. Only catalogue IDs and optional days are saved. */
(function (root) {
  'use strict';
  const DAYS = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
  const WEEK = ['colombia-rumbera','drifters','turkish-folk-dance','kenyan-acrobats','heal-me-band','white-party','fresno-dance-show'].map((id,i)=>({id,day:DAYS[i]}));
  const PACKAGES = [
    {id:'latin',title:'Latin Gecesi',ids:['colombia-rumbera','white-party']},
    {id:'africa',title:'Afrika Gecesi',ids:['kenyan-acrobats','african-warriors']}
  ];
  function create(catalogue, initial=[]) {
    const valid=new Set(catalogue.map(s=>s.id));
    let items=[];
    function add(entries) {
      let added=0;
      for(const entry of entries) {
        if(!entry || !valid.has(entry.id)) continue;
        const existing=items.find(s=>s.id===entry.id);
        const day=DAYS.includes(entry.day)?entry.day:'';
        const concepts=(Array.isArray(entry.concepts)?entry.concepts:[]).filter(id=>PACKAGES.some(p=>p.id===id&&p.ids.includes(entry.id)));
        if(existing) {if(!existing.day && day)existing.day=day;existing.concepts=[...new Set([...existing.concepts,...concepts])];continue;}
        items.push({id:entry.id,day,concepts:[...new Set(concepts)]});added++;
      }
      return added;
    }
    if(Array.isArray(initial))add(initial);
    return {
      items:()=>items.map(s=>({...s,concepts:[...s.concepts]})),
      has:id=>items.some(s=>s.id===id),
      add,
      remove(id){items=items.filter(s=>s.id!==id);},
      setDay(id,day){const item=items.find(s=>s.id===id);if(item)item.day=DAYS.includes(day)?day:'';},
      clear(){items=[];},
      ordered:()=>items.map(s=>({...s,concepts:[...s.concepts]})).sort((a,b)=>(a.day?DAYS.indexOf(a.day):7)-(b.day?DAYS.indexOf(b.day):7))
    };
  }
  function message({items,catalogue,venue,date,note,kind}) {
    const byId=new Map(catalogue.map(s=>[s.id,s]));
    const selected=items.filter(s=>byId.has(s.id));
    const lines=selected.map((s,i)=>`${i+1}. ${s.day?s.day+' — ':''}${byId.get(s.id).title}${s.concepts?.length?' ['+s.concepts.map(id=>PACKAGES.find(p=>p.id===id)?.title).filter(Boolean).join(', ')+']':''}`);
    return `Merhaba ZAYA,\n\nTesis / etkinlik: ${String(venue||'').trim()}\nTarih / sezon: ${String(date||'').trim()}\nTalep: ${kind||'Sezonluk otel programı'}\n\n${lines.length?'PROGRAM TASLAĞIM\n'+lines.join('\n'):'Sezon programı için önerilerinizi almak istiyorum.'}${String(note||'').trim()?'\n\nNot: '+String(note).trim():''}\n\nBu taslak için ekip uygunluğu, teknik ihtiyaçlar ve teklif bilgisi rica ediyorum. Günler ve içerikler birlikte netleştirilebilir.`;
  }
  const api={DAYS,WEEK,PACKAGES,create,message};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.ZAYA_PROGRAM_MODEL=api;
})(typeof window!=='undefined'?window:globalThis);
