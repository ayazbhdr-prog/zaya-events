// Catalog names recovered from the user's ZAYA show planning records.
// No artist counts, durations, availability or unverified show specifications are implied.
window.ZAYA_SHOWS = [
  {id:'fresno',title:'Fresno Style',category:'Şov',filter:'sahne',image:'night.webp',icon:'sparkles',description:'Sezonun akşam programında Fresno Style. Gösteriyi tesisinizin sahnesi ve etkinlik akışıyla birlikte planlayalım.',tags:['Otel & Resort','Akşam programı']},
  {id:'colombia',title:'Colombia Rumbera',category:'Latin gecesi',filter:'sahne',image:'night.webp',icon:'music-2',description:'Colombia Rumbera ile Latin gecesinin enerjisini programınıza taşıyın. Sahne ve tarih planını tesisinize göre birlikte şekillendirelim.',tags:['Latin gecesi','Otel & Resort']},
  {id:'african',title:'African Acrobats',category:'Akrobasi',filter:'sahne',image:null,icon:'orbit',description:'Akrobasi performanslarıyla akşam programınıza farklı bir hareket katın. Sahne koşulları ve teknik ihtiyaçlar doğrultusunda uygun gösteri planını oluşturalım.',tags:['Akrobasi','Sahne performansı']},
  {id:'party',title:'Party Dancers',category:'Parti',filter:'parti',image:'theme-party.webp',icon:'disc-3',description:'Partinin enerjisini dansla tamamlayan performanslar. Konsepti ve program akışını tesisinizin atmosferine göre birlikte hazırlayalım.',tags:['Parti performansı','Dans']},
  {id:'drifters',title:'Drifters',category:'Şov',filter:'sahne',image:null,icon:'move-up-right',description:'Drifters’ı tesisinizin veya etkinliğinizin programına dahil edelim. Gösteri içeriğini ve sahne akışını etkinlik planınızla birlikte değerlendirelim.',tags:['Şov programı','Etkinlik']},
  {id:'heal',title:'Heal Me Band',category:'Canlı müzik',filter:'muzik',image:'live-music.webp',icon:'audio-lines',description:'Heal Me Band ile akşamın atmosferini canlı müzikle tamamlayın. Performansı tesisinizin veya etkinliğinizin akışına göre birlikte planlayalım.',tags:['Canlı müzik','Akşam programı']},
  {id:'due',title:'Due Band',category:'Canlı müzik',filter:'muzik',image:'live-music.webp',icon:'mic-vocal',description:'Due Band ile programınıza canlı müzik ekleyin. Etkinliğinizin akışına uygun performans ve sahne planını birlikte oluşturalım.',tags:['Canlı müzik','Etkinlik']},
  {id:'etiyopya',title:'Etiyopya',category:'Şov',filter:'sahne',image:null,icon:'globe-2',description:'Etiyopya gösterisini sezon programınız için değerlendirelim. İçerik, tarih ve sahne koşullarını tesisinizin ihtiyaçlarına göre birlikte netleştirelim.',tags:['Şov programı','Otel & Resort']},
  {id:'prestij',title:'Prestij',category:'Şov',filter:'sahne',image:null,icon:'star',description:'Prestij’i etkinlik programınız için birlikte planlayalım. Gösteri içeriği, tarih ve teknik ihtiyaçlar etkinliğinizin koşullarına göre netleştirilir.',tags:['Şov programı','Etkinlik']}
];

// Presentation-only art direction; actual show media can replace these assets later.
const showArt = {
  fresno: {image:'hero-poster.webp',position:'74% 50%',art:'photo',accent:'#ff775d'},
  colombia: {position:'85% 50%',art:'photo',accent:'#ff775d'},
  african: {art:'orbit',accent:'#b9dfc6'},
  party: {position:'52% 50%',art:'photo',accent:'#ffcf89'},
  drifters: {art:'diagonal',accent:'#cbbfff'},
  heal: {position:'22% 50%',art:'photo',accent:'#8dcddd'},
  due: {position:'78% 50%',art:'photo',accent:'#8dcddd'},
  etiyopya: {art:'interlace',accent:'#ffb090'},
  prestij: {art:'rays',accent:'#edcf86'}
};
window.ZAYA_SHOWS.forEach(show => Object.assign(show, showArt[show.id]));
