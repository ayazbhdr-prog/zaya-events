const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const model=require('../dist/program-model.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../dist/shows.js'),'utf8'),context);
const catalogue=JSON.parse(JSON.stringify(context.window.ZAYA_SHOWS));
test('restoring rejects unknown shows, duplicate entries and invalid days',()=>{
 const draft=model.create(catalogue,[null,{id:'unknown',day:'Friday'},{id:'drifters',day:'Friday'},{id:'drifters',day:'Salı'}]);
 assert.deepEqual(draft.items(),[{id:'drifters',day:'Salı',concepts:[]}]);
});
test('a week merges without duplicates or overwriting chosen days',()=>{
 const draft=model.create(catalogue,[{id:'drifters',day:'Pazar'}]);
 assert.equal(draft.add(model.WEEK),6);assert.equal(draft.add(model.WEEK),0);
 assert.equal(draft.items().length,7);assert.equal(draft.items().find(s=>s.id==='drifters').day,'Pazar');
});
test('adding overlapping concepts preserves intent and editable state',()=>{
 const draft=model.create(catalogue);draft.add(model.WEEK);
 const latin=model.PACKAGES[0];draft.add(latin.ids.map(id=>({id,concepts:['latin']})));
 assert.equal(draft.items().length,7);assert.deepEqual(draft.items().find(s=>s.id===latin.ids[0]).concepts,['latin']);
 draft.setDay('colombia-rumbera','Cuma');
 const restored=model.create(catalogue,JSON.parse(JSON.stringify(draft.items())));
 assert.equal(restored.items().find(s=>s.id==='colombia-rumbera').day,'Cuma');
 draft.remove('white-party');assert.equal(draft.has('white-party'),false);
 draft.clear();assert.equal(draft.items().length,0);
});
test('message preserves Turkish, chosen days and concept names after URL encoding',()=>{
 const draft=model.create(catalogue,[{id:'colombia-rumbera',day:'Pazartesi',concepts:['latin']},{id:'drifters',day:'Salı'}]);
 const text=model.message({items:draft.ordered(),catalogue,venue:'Örnek Otel & Resort',date:'Haziran 2027',note:'Aile ağırlıklı',kind:'Sezonluk otel programı'});
 const url=new URL('https://wa.me/905322834079?text='+encodeURIComponent(text));
 assert.equal(url.searchParams.get('text'),text);
 assert.match(text,/Pazartesi — Colombia Rumbera \[Latin Gecesi\]/);
 assert.match(text,/Salı — Drifters/);assert.match(text,/Örnek Otel & Resort/);
 assert.equal((text.match(/Drifters/g)||[]).length,1);
});
