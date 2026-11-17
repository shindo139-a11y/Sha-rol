var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var use=function(n){try{return window.claude&&window.claude.use?window.claude.use(n):Promise.resolve(null)}catch(e){return Promise.resolve(null)}};

/* ---------- datos del universo ---------- */
var ROLES={heroe:'Héroe',villano:'Villano',neutral:'Neutral'};
var ROOMS_BASE=[
 {id:'spam',nombre:'Spam fuera de rol',lugar:'Sala común',tag:'Fuera de rol',ooc:true,
  escena:'Espacio libre para saludar, charlar y conocerse fuera de personaje. Aquí no se rolea ni se gana XP. Para entrar a las demás salas, crea tu ficha de personaje en tu Perfil.'},
 {id:'urbano',nombre:'Simulación de Batalla Urbana',lugar:'Distrito Neón',tag:'Combate',
  escena:'Las sirenas suenan sobre el Distrito Neón. Un robo a gran escala está en curso en el banco central y los equipos de la Academia ya van en camino. ¿Quién llega primero?'},
 {id:'academia',nombre:'Patio de la Academia Aurora',lugar:'Academia Aurora',tag:'Vida escolar',
  escena:'Es la hora del almuerzo en el patio central. Los carteles anuncian el Torneo de Héroes y corre el rumor de un estudiante nuevo con un poder desconocido.'},
 {id:'guarida',nombre:'La Guarida del Eclipse',lugar:'Subsuelo del puerto',tag:'Villanos',
  escena:'Detrás de un almacén abandonado, una puerta de metal se abre solo para quienes conocen la contraseña. Esta noche el Eclipse escucha ofertas.'},
 {id:'bosque',nombre:'Prueba en el Bosque Eco',lugar:'Bosque Eco',tag:'Exploración',
  escena:'La niebla del Bosque Eco devuelve cada sonido con retraso. La prueba de supervivencia dura hasta el amanecer y nadie puede usar el equipo de rescate.'}
];
var ROOMS=ROOMS_BASE.slice(),CUSTOM=[],HIDDEN=[];
var RULES=[
 'Escribe siempre en personaje. Fuera de personaje, usa ((doble paréntesis)).',
 'Controlas solo a tu personaje. Nunca decidas lo que hacen o sienten los demás.',
 'Los conflictos se resuelven con dados: escribe /dado o toca "Tirar d20". Un 20 es crítico y un 1 es pifia.',
 'Usa el modo Acción para lo que haces y el modo Narrador para describir el entorno.',
 'Respeta el ritmo de la escena: deja que otros respondan antes de avanzar.'
];
var RANKS=['Aspirante','Novato','Veterano','Élite','Leyenda'];
var GLYPH={
 bolt:'M13 2 4 14h6l-1 8 9-12h-6z',
 shield:'M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z',
 star:'M12 2l3 7 7 .6-5.3 4.6 1.7 7.2L12 17.8 5.6 21.4l1.7-7.2L2 9.6 9 9z',
 people:'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 19c0-3 3-5 6-5s6 2 6 5zm12 0c0-1.5-.5-2.8-1.4-3.8.5-.1 1-.2 1.4-.2 3 0 6 2 6 5z',
 crown:'M3 18 2 7l5 4 5-7 5 7 5-4-1 11z'
};
var ACH=[
 {n:'Primera Línea',g:'bolt',t:function(p){return p.msgs>=1}},
 {n:'Voz de la Academia',g:'shield',t:function(p){return p.msgs>=25}},
 {n:'Golpe Crítico',g:'star',t:function(p){return p.crit>=1}},
 {n:'Elenco Completo',g:'people',t:function(p){return p.chars.length>=3}},
 {n:'Leyenda Viva',g:'crown',t:function(p){return lvl()>=5}}
];

/* ---------- perfil local ---------- */
var LS='sharol.v1';
function lsGet(){try{return JSON.parse(localStorage.getItem(LS)||'null')}catch(e){return null}}
function lsSet(v){try{localStorage.setItem(LS,JSON.stringify(v))}catch(e){}}
var P=lsGet()||{};
P.name=P.name||'Jugador Nuevo';
P.bio=P.bio||'Escribe aquí tu historia. ¿Héroe, villano o algo en medio?';
P.chars=(P.chars&&P.chars.length)?P.chars:[{id:'c1',name:'Aurora Vega',rol:'heroe',poder:'Luz solidificada',base:true}];
P.items=P.items||[];
function isBase(c){return !!(c.base||(c.id==='c1'&&c.name==='Aurora Vega'&&!c.ficha))}
function hasFicha(){return P.chars.some(function(c){return !isBase(c)})}
function speaker(){var c=activeChar();return isBase(c)?{name:P.name,rol:'neutral'}:c}
var RL='sharol.rooms';
try{var _r=JSON.parse(localStorage.getItem(RL)||'null');if(_r){CUSTOM=_r.c||[];HIDDEN=_r.h||[]}}catch(e){}
function rebuildRooms(){ROOMS.length=0;ROOMS_BASE.filter(function(r){return r.ooc||HIDDEN.indexOf(r.id)<0}).concat(CUSTOM).forEach(function(r){ROOMS.push(r)})}
rebuildRooms();
var RULES_G=[
 'Estas son las reglas del grupo, irán integrándose más reglas conforme avance el tiempo. Principalmente los administradores no seremos estrictos, estaremos lo mejor capacitados para ser flexibles en cuanto a los inconvenientes que ocurran en el grupo.',
 'Solo si la situación lo requiere se tomarán las medidas necesarias para solucionar los problemas sin causar alboroto en los grupos.',
 'REGLA N°1: No faltarle el respeto a los administradores o miembros del grupo.',
 'REGLA N°2: Cualquier problema entre usuarios, ya sea por desacuerdos, incomodidades, acusaciones de favoritismo, mano negra u otros motivos, deberá ser tratado y resuelto exclusivamente por un ADMINISTRADOR.',
 'No queremos discusiones entre usuarios. Este espacio está hecho para disfrutar y compartir, por lo que la diversión y comodidad de todos siempre serán nuestra prioridad. Ante cualquier inconveniente, acudan a la administración.',
 'REGLA N°3: En los enfrentamientos entre héroes y villanos solo existen tres resultados por defecto: dejarse ganar, escapar o ganar y escapar. La muerte de un personaje únicamente podrá ocurrir con el consentimiento de su propietario.',
 'REGLA N°4: Mantener una buena ambientación en el grupo. El objetivo principal es crear una historia entretenida para todos.',
 'Se recomienda priorizar la narrativa y la diversión antes que la victoria individual.',
 'REGLA N°5: La ficha deberá enviarse utilizando el formato establecido en el grupo. No se aceptarán formatos alternativos. Aunque no es obligatorio, su uso es altamente recomendable para facilitar la revisión y evitar posibles inconvenientes.',
 'REGLA N°6: Solo está permitido hasta un máximo de 6 personajes por usuario.',
 'Pero hay una función en la pestaña S.H.A INFO (OFICIAL) que te permite “superar” ese límite.',
 'REGLA N°7: Está permitido enviar gifs, vídeos, imágenes o entre dos y tres comentarios en los grupos de [S.H.A.] FICHAS y [S.H.A] ROL, pero evitan abusar de ello ☝️✨',
 'REGLA N°8: Todo usuario nuevo que haya enviado su ficha al grupo correspondiente y se encuentre a la espera de su aceptación podrá ser agregado al grupo de rol, donde únicamente tendrá permitido realizar interacciones mientras se completa el proceso de revisión y aprobación de su ficha.',
 'REGLA N°9: Prohibido el Metarol. Tu personaje solo conoce aquello que ha visto, escuchado o descubierto dentro del rol. Información obtenida fuera del rol no debe utilizarse dentro de la historia.',
 'REGLA N°10: La muerte permanente de un personaje requerirá autorización administrativa o acuerdo entre las partes involucradas.',
 'REGLA N°11: Las decisiones administrativas durante eventos y misiones oficiales tendrán prioridad para mantener el orden de la trama.',
 'REGLA N°12: No enamorarse entre personajes al poco tiempo. Debe sentirse natural el acercamiento sentimental.'
];
function rulesHTML(){
  return '<p><b>📋 REGLAS DEL GRUPO 📋</b></p>'+RULES_G.map(function(t){
    var m=/^(REGLA N°\d+:)(.*)$/.exec(t);
    return m?'<p><b>'+esc(m[1])+'</b>'+esc(m[2])+'</p>':'<p>'+esc(t)+'</p>';
  }).join('');
}
function saveRoomsLocal(){try{localStorage.setItem(RL,JSON.stringify({c:CUSTOM,h:HIDDEN}))}catch(e){}}
P.active=P.active||P.chars[0].id;
P.xp=P.xp||0; P.msgs=P.msgs||0; P.crit=P.crit||0; P.hist=P.hist||[];
P.lid=P.lid||('l'+Math.random().toString(36).slice(2,10));
function lvl(){return Math.floor(P.xp/100)+1}
function rankName(){return RANKS[Math.min(RANKS.length-1,Math.floor((lvl()-1)/2))]}
function activeChar(){return P.chars.filter(function(c){return c.id===P.active})[0]||P.chars[0]}

/* ---------- tema ---------- */
function applyTheme(t){var r=document.documentElement;if(t)r.setAttribute('data-theme',t);else r.removeAttribute('data-theme')}
function isDark(){var t=document.documentElement.getAttribute('data-theme');return t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches}
applyTheme(P.theme);
var SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>';
var MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>';
function themeBtn(){return '<button class="themebtn" data-act="theme" type="button" aria-label="Cambiar entre modo día y noche">'+(isDark()?SUN+'Modo día':MOON+'Modo noche')+'</button>'}

/* ---------- estado ---------- */
var db=null,user=null,UID=P.lid,CLOUD=false,CANWRITE=true,SHARED=false;
var view='inicio',room=null,posts=null,rank=null,lastMsg={},msgs=null,unsubMsgs=null,mode='dialogo';
var localMsgs={},localPosts=[];
var PROF={},likeMap={},BANNER=null,ADMIN=false,postImg=null;
try{BANNER=localStorage.getItem('sharol.banner')}catch(e){}

var saveT=null,cloudBusy=false,cloudDirty=false;
function save(){lsSet(P);clearTimeout(saveT);saveT=setTimeout(cloudSave,1200)}
async function cloudSave(){
  if(!db||!CLOUD||!CANWRITE)return;
  if(cloudBusy){cloudDirty=true;return}
  cloudBusy=true;
  try{
    await db.doc('data/users/'+UID+'/profile').set(JSON.parse(JSON.stringify({name:P.name,bio:P.bio,chars:P.chars,active:P.active,xp:P.xp,msgs:P.msgs,crit:P.crit,cover:P.cover||null,reg:P.reg||null,items:P.items||[]})));
    await db.doc('ranking/'+UID).set({name:P.name,xp:P.xp,lvl:lvl(),rol:activeChar().rol});
  }catch(e){}
  cloudBusy=false;
  if(cloudDirty){cloudDirty=false;cloudSave()}
}

/* ---------- utilidades de vista ---------- */
function roleColor(r){return r==='villano'?'var(--r-villano)':r==='neutral'?'var(--r-neutral)':'var(--r-heroe)'}
function avatar(name,rol,size,uid){
  size=size||40;
  var pic=uid?(uid===UID?(P.avatar||PROF[uid]):PROF[uid]):null;
  var ini=String(name||'?').trim().split(/\s+/).slice(0,2).map(function(w){return w.charAt(0)}).join('').toUpperCase();
  return '<span class="av" style="--c:'+roleColor(rol)+';width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size*.4)+'px">'+(pic?'<img src="'+esc(pic)+'" alt="">':esc(ini))+'</span>';
}
function pill(rol){return '<span class="pill r-'+esc(rol)+'">'+esc(ROLES[rol]||'Neutral')+'</span>'}
function ago(t){
  var s=Math.max(1,Math.floor((Date.now()-t)/1000));
  if(s<60)return 'ahora';
  var m=Math.floor(s/60);if(m<60)return 'hace '+m+' min';
  var h=Math.floor(m/60);if(h<24)return 'hace '+h+' h';
  return 'hace '+Math.floor(h/24)+' d';
}
var toastT=null;
function toast(t){var el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove('show')},2800)}

/* ---------- ilustración (original) ---------- */
function skyline(seed,H,W){
  var r=seed,s='',x=0;
  var rnd=function(){r=(r*9301+49297)%233280;return r/233280};
  while(x<W){
    var w=22+Math.floor(rnd()*34),h=Math.floor(H*.25+rnd()*H*.42);
    s+='<rect x="'+x+'" y="'+(H-h)+'" width="'+w+'" height="'+h+'" fill="var(--bld)"/>';
    for(var wy=H-h+8;wy<H-8;wy+=12){for(var wx=x+5;wx<x+w-6;wx+=9){if(rnd()>.62)s+='<rect x="'+wx+'" y="'+wy+'" width="4" height="5" fill="var(--win)"/>'}}
    x+=w+Math.floor(rnd()*6);
  }
  return s;
}
function figure(x,y,s,skin,hairBack,hairFront){
  return '<g transform="translate('+x+' '+y+') scale('+s+')">'+hairBack+
   '<path d="M-62 150Q-62 72 0 64Q62 72 62 150Z" fill="var(--suit)"/>'+
   '<path d="M-26 70 0 112 26 70" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linejoin="round"/>'+
   '<rect x="-10" y="52" width="20" height="18" fill="'+skin+'"/>'+
   '<ellipse cx="0" cy="26" rx="30" ry="36" fill="'+skin+'"/>'+hairFront+
   '<rect x="-19" y="28" width="12" height="4.5" rx="2" fill="var(--eye)"/><rect x="7" y="28" width="12" height="4.5" rx="2" fill="var(--eye)"/></g>';
}
var HERO_SVG=null;
function heroSVG(){
  if(HERO_SVG)return HERO_SVG;
  var spiky=function(c){return '<polygon points="-36,22 -44,-8 -24,4 -22,-30 -6,-4 6,-38 16,-4 30,-26 32,4 48,-6 38,24 26,8 0,2 -26,8" fill="'+c+'"/>'};
  var longB=function(c){return '<path d="M-40 28Q-48 -16 0 -18Q48 -16 40 28L48 118-48 118Z" fill="'+c+'"/>'};
  var longF=function(c){return '<path d="M-34 24Q-30 -14 0 -14Q30 -14 34 24Q10 4-6 6Q-22 8-34 24Z" fill="'+c+'"/>'};
  var s='<svg viewBox="0 0 560 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+
   '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky-a)"/><stop offset="1" stop-color="var(--sky-b)"/></linearGradient>'+
   '<linearGradient id="fd" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#0b1840" stop-opacity="0"/><stop offset="1" stop-color="#0b1840" stop-opacity=".55"/></linearGradient></defs>'+
   '<rect width="560" height="300" fill="url(#sk)"/>'+
   '<circle cx="486" cy="58" r="30" fill="#fff6c2" opacity="var(--sun-op)"/>'+
   '<circle cx="84" cy="52" r="26" fill="#eadfff" opacity="var(--moon-op)"/><circle cx="94" cy="46" r="26" fill="var(--sky-b)" opacity="calc(var(--moon-op)*.55)"/>'+
   '<polygon points="0,300 0,190 210,300" fill="var(--hot)" opacity=".9"/><polygon points="0,300 0,236 130,300" fill="#fff" opacity=".85"/>'+
   '<polygon points="560,0 430,0 560,70" fill="#fff" opacity=".18"/>'+
   skyline(7,300,560)+
   figure(86,22,.9,'#f2c8a0','',spiky('#eef2ff'))+
   figure(232,-4,1.12,'#c68a5e','',spiky('#10142e'))+
   figure(384,26,.95,'#f6d7bd',longB('#3a1f78'),longF('#3a1f78'))+
   figure(488,52,.72,'#8d5a3b','',spiky('#d12a3a'))+
   '<rect width="560" height="300" fill="url(#fd)"/></svg>';
  HERO_SVG=s;return s;
}
function bannerMedia(){return BANNER?'<img src="'+esc(BANNER)+'" alt="Banner de S.H.A. ROL"><div class="shade"></div>':heroSVG()}
function adminBar(){return '<div class="adm"><label class="photobtn">Cambiar banner<input class="sr" type="file" accept="image/*" data-up="banner" id="upBanner"></label>'+(BANNER?'<button class="photobtn" type="button" data-act="delbanner">Restaurar</button>':'')+'</div>'}
function setHeroMedia(){var m=$('.hero .media');if(m)m.innerHTML=bannerMedia();var a=$('.hero .adm');if(a)a.outerHTML=adminBar()}
function miniSky(){return '<svg viewBox="0 0 560 96" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle cx="470" cy="30" r="16" fill="#fff6c2" opacity="var(--sun-op)"/><circle cx="470" cy="30" r="16" fill="#eadfff" opacity="var(--moon-op)"/>'+skyline(21,96,560)+'</svg>'}

/* ---------- vistas ---------- */
var NAV=[
 ['inicio','Inicio','<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],
 ['rol','Rol','<path d="M4 4h16v12H9l-5 4z"/>'],
 ['ranking','Ranking','<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3M12 13v4M8 21h8M10 17h4"/>'],
 ['perfil','Perfil','<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'],
 ['universo','Universo','<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10.5" ry="3.8" transform="rotate(-25 12 12)"/>']
];
function navHTML(){return NAV.map(function(n){return '<button type="button" data-go="'+n[0]+'" class="'+(view===n[0]?'on':'')+'"'+(view===n[0]?' aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true">'+n[2]+'</svg>'+n[1]+'</button>'}).join('')}
function topbar(t){return '<div class="topbar"><h1>'+t+'</h1>'+themeBtn()+'</div>'}

function viewInicio(){
  var ch=speaker();
  return '<section class="hero"><div class="media">'+bannerMedia()+'</div>'+(ADMIN?adminBar():'')+themeBtn()+'<div class="logo"><div class="t">S.H.A.<b>ROL</b></div><div class="s">SUPER HERO ACADEMY ROLEPLAY</div></div></section>'+
  '<section class="strip">'+avatar(ch.name,ch.rol,46)+'<div><b>¡Bienvenido a S.H.A. ROL!</b><span>Demuestra tu potencial y escribe tu historia.</span></div><button class="btn sm" data-go="rol" type="button">Jugar</button></section>'+
  '<h2 class="sec"><i></i>Publicaciones recientes</h2>'+
  (ADMIN?'<form class="card compose" id="postForm"><label class="sr" for="postTxt">Nueva publicación</label><textarea id="postTxt" rows="2" maxlength="400" placeholder="Escribe la publicación del inicio…"></textarea><div id="postPrev"></div>'+
  '<div class="row"><label class="btn ghost sm" style="cursor:pointer">Añadir imagen<input class="sr" type="file" accept="image/*" data-up="post" id="upPost"></label><button class="btn sm" type="submit">Publicar</button></div><p class="mute" style="margin-top:6px">Solo el administrador publica aquí.</p></form>':'')+
  '<div id="posts" style="margin-top:12px"></div>';
}
var HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>';
var EXAMPLES=[
 {id:'ex1',autor:'Dirección Aurora',rol:'neutral',t:Date.now()-7200000,texto:'¡Nuevo evento de la Academia! ¿Están listos para el Torneo de Héroes?',likes:{},ex:true},
 {id:'ex2',autor:'Sombra Escarlata',rol:'villano',t:Date.now()-3600000,texto:'El mundo necesita un cambio... ¿Quién se une a mi causa?',likes:{},ex:true}
];
function renderPosts(){
  var el=$('#posts');if(!el)return;
  var list=SHARED?posts:localPosts;
  var ex=false;
  if(list===null){el.innerHTML='<p class="empty">Cargando publicaciones…</p>';return}
  if(!list.length){list=EXAMPLES;ex=true}
  el.innerHTML=list.map(function(p){
    var likes=SHARED?(likeMap[p.id]||{}):(p.likes||{}),n=Object.keys(likes).filter(function(k){return likes[k]}).length,on=!!likes[UID];
    return '<article class="card post"><header>'+avatar(p.autor,p.rol,42,p.uid)+'<div><b>'+esc(p.autor)+'</b> '+pill(p.rol)+(p.ex?'<span class="ex">Ejemplo</span>':'')+'<small>'+ago(p.t)+'</small></div>'+
      (ADMIN&&!p.ex?'<button class="linkbtn" data-act="delpost" data-id="'+esc(p.id)+'" type="button">Eliminar</button>':'')+'</header>'+
      (p.texto?'<p>'+esc(p.texto)+'</p>':'')+(p.img?'<img class="pimg" src="'+esc(p.img)+'" alt="Imagen de la publicación">':'')+'<footer><button class="like'+(on?' on':'')+'" data-act="like" data-id="'+esc(p.id)+'" type="button" aria-pressed="'+on+'"'+(p.ex?' disabled':'')+'>'+HEART+'<span>'+n+'</span></button></footer></article>';
  }).join('')+(ex?'<p class="note">Estos son ejemplos. Publica algo y se reemplazarán.</p>':'');
}

function viewRol(){return room?chatShell():roomList()}
function roomList(){
  var h=topbar('Sala de <b>Rol</b>');
  if(!SHARED)h+='<p class="note">Modo local: tus mensajes se quedan en este navegador. Abre el enlace con tu cuenta para chatear con otros.</p>';
  if(ADMIN)h+='<button class="btn ghost" style="width:100%;margin-bottom:12px" data-act="newroom" type="button">Crear sala</button>'+roomFormHTML();
  var ok=hasFicha();
  if(!ok)h+='<div class="note">Por ahora solo puedes entrar a <b>Spam fuera de rol</b>. Para desbloquear las demás salas, crea tu ficha de personaje en tu <button class="linkbtn" type="button" data-go="perfil">Perfil</button>.</div>';
  h+=ROOMS.map(function(r){
    var l=lastMsg[r.id],lock=!r.ooc&&!ok;
    return '<article class="card room'+(lock?' locked':'')+'"><div class="info"><span class="tag">'+esc(r.tag)+'</span>'+(lock?'<span class="lockbadge">Requiere ficha</span>':'')+'<h3>'+esc(r.nombre)+'</h3><p>'+esc(r.lugar)+(l?' · último mensaje '+ago(l.t):' · sin mensajes todavía')+'</p>'+(ADMIN&&r.id!=='spam'?'<button class="linkbtn" data-act="delroom" data-id="'+esc(r.id)+'" type="button">Eliminar sala</button>':'')+'</div><button class="btn sm'+(lock?' ghost':'')+'" data-act="room" data-id="'+r.id+'" type="button">'+(lock?'Bloqueada':'Entrar')+'</button></article>';
  }).join('');
  return h;
}
function chatShell(){
  var r=room,chars=P.chars.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===P.active?' selected':'')+'>'+esc(c.name)+' ('+esc(ROLES[c.rol])+')</option>'}).join('');
  var modes=[['dialogo','Diálogo'],['accion','Acción'],['narrador','Narrador']].map(function(m){return '<button type="button" class="chip'+(
