function charsSection(){
  var cur=P.chars.filter(function(c){return c.id===FV})[0];
  var real=P.chars.filter(function(c){return !isBase(c)});
  var h='<h2 class="sec"><i></i>Personajes de rol</h2>';
  if(!hasFicha())h+='<p class="note">Aún no tienes ficha. Créala para desbloquear las salas de combate, escuela y exploración. Mientras tanto puedes usar la sala <b>Spam fuera de rol</b>.</p>';
  if(cur&&cur.ficha)h+=fichaHTML(cur);
  h+=(real.length?'<div class="chars">':'<div>')+real.map(function(c){
    return '<div class="char'+(c.id===P.active?' on':'')+'">'+avatar(c.name,c.rol,56)+'<b>'+esc(c.name)+'</b>'+pill(c.rol)+'<small>'+esc(c.poder||'Sin poder definido')+'</small>'+
     '<button class="btn sm'+(c.id===P.active?'':' ghost')+'" data-act="setchar" data-id="'+esc(c.id)+'" type="button">'+(c.id===P.active?'En uso':'Usar')+'</button>'+
     (c.ficha?'<button class="linkbtn" data-act="verficha" data-id="'+esc(c.id)+'" type="button">Ver ficha</button>':'')+
     ('<button class="linkbtn" data-act="delchar" data-id="'+esc(c.id)+'" type="button">Eliminar</button>')+'</div>';
  }).join('')+'</div>';
  if(real.length<6)h+='<button class="btn" style="margin-top:12px;width:100%" data-act="newchar" type="button">Crear personaje</button>'+charFormHTML();
  else h+='<p class="note">Llegaste al máximo de 6 personajes.</p>';
  h+='<h2 class="sec"><i></i>Ficha de artículos</h2>'+
   (P.items.length?P.items.map(function(it){
     return '<article class="card item ficha"><span class="tag">'+esc(it.cat)+' · '+esc(it.rar)+'</span><h3>'+esc(it.nom)+'</h3><dl>'+dd('Precio',it.pre!==''?esc(it.pre)+' '+esc(it.mon):'')+dd('Efecto',it.efe)+dd('Duración',it.dur)+dd('Restricciones',it.res)+dd('Bonificación',it.bon)+dd('Estado',it.est)+'</dl><button class="linkbtn" data-act="delitem" data-id="'+esc(it.id)+'" type="button" style="margin-top:8px">Eliminar artículo</button></article>';
   }).join(''):'<p class="note">Aún no has creado artículos.</p>')+
   (P.items.length<20?'<button class="btn ghost" style="margin-top:12px;width:100%" data-act="newitem" type="button">Crear artículo</button>'+itemFormHTML():'');
  return h;
}

function viewUniverso(){
  return topbar('<b>Universo</b>')+
  '<div class="card"><b>Academia Aurora</b><p class="mute" style="margin-top:4px">Una ciudad de vigilantes, estudiantes y villanos. Cada lugar es una sala donde la historia la escriben los jugadores.</p></div>'+
  '<h2 class="sec"><i></i>Ubicaciones clave</h2>'+
  ROOMS.filter(function(r){return !r.ooc}).map(function(r){return '<article class="card loc"><span class="tag">'+esc(r.tag)+'</span><h3>'+esc(r.lugar)+'</h3><p>'+esc(r.escena)+'</p><button class="btn sm" style="margin-top:10px" data-act="room" data-id="'+r.id+'" type="button">Abrir sala</button></article>'}).join('')+
  '<h2 class="sec"><i></i>Reglas de rol</h2><details class="card" open><summary>Cómo jugar</summary><ol>'+RULES.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol></details>'+
  '<details class="card" style="margin-top:12px"><summary>Reglas del grupo</summary><div class="rulebox" style="max-height:none;margin-top:10px">'+rulesHTML()+'</div></details>';
}

/* ---------- render ---------- */
function viewRegistro(){
  var today=new Date().toISOString().slice(0,10);
  return '<div class="reg"><section class="hero"><div class="media">'+bannerMedia()+'</div>'+themeBtn()+'<div class="logo"><div class="t">S.H.A.<b>ROL</b></div></div></section>'+
  '<form class="card form" id="regForm" novalidate><h2>Crea tu cuenta</h2><p class="mute">Regístrate para entrar a la Academia.</p>'+
  '<label class="l" for="rname">Nombre de usuario</label><input class="field" id="rname" maxlength="24" minlength="3" autocomplete="nickname" placeholder="Tu nombre de usuario" value="'+(P.name==='Jugador Nuevo'?'':esc(P.name))+'">'+
  '<label class="l" for="rbirth">Fecha de nacimiento</label><input class="field" id="rbirth" type="date" min="1900-01-01" max="'+today+'" autocomplete="bday">'+
  '<div class="rulebox" tabindex="0" role="region" aria-label="Reglas del grupo">'+rulesHTML()+'</div>'+
  '<label class="check" for="rrul"><input type="checkbox" id="rrul"><span>Leer las reglas</span></label>'+
  '<label class="check" for="racc"><input type="checkbox" id="racc"><span>Acepto que esta app contiene material de entretenimiento cuya finalidad es rolear con personajes ficticios, creando una historia totalmente ficticia.</span></label>'+
  '<p class="mute" id="rhint" role="status" style="font-weight:700"></p>'+
  '<button class="btn" type="submit" disabled>Registrarme</button></form></div>';
}
function regMissing(){
  var m=[],n=($('#rname')||{value:''}).value.trim(),b=($('#rbirth')||{value:''}).value,t=new Date().toISOString().slice(0,10);
  if(n.length<3)m.push('nombre de usuario (mínimo 3 caracteres)');
  if(!b||isNaN(new Date(b).getTime())||b>t||b<'1900-01-01')m.push('fecha de nacimiento');
  if(!($('#rrul')||{}).checked)m.push('marcar “Leer las reglas”');
  if(!($('#racc')||{}).checked)m.push('aceptar el aviso de entretenimiento');
  return m;
}
function regRefresh(){
  var f=$('#regForm');if(!f)return;
  var m=regMissing(),b=f.querySelector('button[type=submit]'),h=$('#rhint');
  b.disabled=m.length>0;
  h.textContent=m.length?'Falta: '+m.join(', ')+'.':'¡Todo listo para registrarte!';
  h.style.color=m.length?'var(--hot)':'var(--ok)';
}
['input','change'].forEach(function(ev){document.addEventListener(ev,function(e){if(e.target.closest&&e.target.closest('#regForm'))regRefresh()})});
function askConfirm(title,text,yes,onYes){
  var m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
  m.innerHTML='<div class="box"><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p><div class="row"><button class="btn ghost" type="button" data-no="1">Cancelar</button><button class="btn danger" type="button" data-yes="1">'+esc(yes)+'</button></div></div>';
  document.body.appendChild(m);
  var close=function(){m.remove()};
  m.addEventListener('click',function(e){
    if(e.target.closest('[data-yes]')){close();onYes()}
    else if(e.target===m||e.target.closest('[data-no]'))close();
  });
  var b=m.querySelector('[data-no]');if(b)b.focus();
}
function render(){
  var navEl=document.querySelector('.nav');if(navEl)navEl.hidden=!P.reg;
  if(!P.reg){$('#main').innerHTML=viewRegistro();regRefresh();return}
  $('#nav').innerHTML=navHTML();
  var f={inicio:viewInicio,rol:viewRol,ranking:viewRanking,perfil:viewPerfil,universo:viewUniverso}[view];
  $('#main').innerHTML=f();
  if(view==='inicio'){renderPosts();showPrev()}
  if(view==='ranking')renderRank();
  if(view==='rol'&&room)renderMsgs(currentMsgs());
}
function currentMsgs(){return SHARED?msgs:(localMsgs[room.id]||[])}
function go(v){if(v!=='rol'||view==='rol')leaveRoom();view=v;render();window.scrollTo(0,0)}
function leaveRoom(){if(unsubMsgs){unsubMsgs();unsubMsgs=null}room=null;msgs=null}

var readyP=null;
async function openRoom(id){
  await readyP;
  var target=ROOMS.filter(function(r){return r.id===id})[0];
  if(!target)return;
  if(!target.ooc&&!hasFicha()){
    toast('Crea tu ficha de personaje en tu Perfil para entrar a esta sala');
    return;
  }
  leaveRoom();
  room=target;
  view='rol';render();window.scrollTo(0,0);
  if(SHARED){
    var loaded=false;
    setTimeout(function(){if(!loaded){var e=$('#msgs .empty');if(e)e.textContent='No se pudo conectar todavía. Revisa tu conexión.'}},10000);
    unsubMsgs=db.collection('salas/'+id+'/mensajes').orderBy('t','desc').limit(80).onSnapshot(function(s){
      loaded=true;
      msgs=s.docs.map(function(d){var o=d.data();o.id=d.id;return o}).reverse();
      renderMsgs(msgs);
    },function(){loaded=true;msgs=[];renderMsgs(msgs);toast('Se perdió la conexión con la sala')});
  }
}

/* ---------- acciones ---------- */
async function sendMsg(tipo,texto,extra){
  var ooc=!!room.ooc;
  if(!ooc&&!hasFicha()){toast('Crea tu ficha de personaje en tu Perfil');return false}
  var ch=ooc?{name:P.name,rol:'neutral'}:activeChar();
  if(ooc)tipo='dialogo';
  var m={t:Date.now(),uid:UID,pj:ch.name,rol:ch.rol,tipo:tipo,texto:texto};
  if(extra)for(var k in extra)m[k]=extra[k];
  if(SHARED){
    try{await db.collection('salas/'+room.id+'/mensajes').add(m)}catch(e){toast('No se pudo enviar el mensaje');return false}
  }else{
    m.id='l'+Date.now();(localMsgs[room.id]=localMsgs[room.id]||[]).push(m);renderMsgs(localMsgs[room.id]);
  }
  if(ooc)return true;
  P.msgs++;P.xp+=10;
  if(m.d===20){P.crit++;P.xp+=25;toast('¡Crítico! +35 XP')}
  P.hist.unshift({sala:room.nombre,texto:tipo==='dado'?'Tiró un d20: '+m.d:texto,t:m.t});P.hist=P.hist.slice(0,20);
  save();
  return true;
}
async function doSend(){
  if(!CANWRITE){toast('Tu acceso es de solo lectura');return}
  var t=$('#txt');if(!t)return;var v=t.value.trim();if(!v)return;
  t.value='';
  if(!room.ooc&&/^\/(dado|d20)\b/i.test(v))return roll();
  var ok=await sendMsg(mode,v);if(!ok)t.value=v;
}
function roll(){var n=1+Math.floor(Math.random()*20);return sendMsg('dado','d20',{d:n})}

function compress(file,w,h,maxLen){
  return new Promise(function(res,rej){
    var url=URL.createObjectURL(file),img=new Image();
    img.onload=function(){
      var sw=img.naturalWidth,sh=img.naturalHeight,c=document.createElement('canvas'),ctx=c.getContext('2d');
      if(!h){var sc=Math.min(1,w/sw);c.width=Math.round(sw*sc);c.height=Math.round(sh*sc);ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height)}
      else{var r=Math.max(w/sw,h/sh),dw=sw*r,dh=sh*r;c.width=w;c.height=h;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh)}
      var q=.82,d=c.toDataURL('image/jpeg',q);
      while(d.length>maxLen&&q>.3){q-=.1;d=c.toDataURL('image/jpeg',q)}
      URL.revokeObjectURL(url);
      if(d.length>maxLen)rej();else res(d);
    };
    img.onerror=function(){URL.revokeObjectURL(url);rej()};
    img.src=url;
  });
}
async function saveBanner(d){
  if(!ADMIN)return;
  if(SHARED){
    try{if(d)await db.doc('config/banner').set({img:d,t:Date.now()});else await db.doc('config/banner').delete();toast(d?'Banner actualizado':'Banner restaurado')}
    catch(e){toast('No se pudo guardar el banner')}
  }else{
    BANNER=d;try{if(d)localStorage.setItem('sharol.banner',d);else localStorage.removeItem('sharol.banner')}catch(e){}
    setHeroMedia();toast(d?'Banner actualizado':'Banner restaurado');
  }
}
async function setAvatar(d){
  P.avatar=d||null;save();
  if(SHARED&&CLOUD){
    try{if(d){await db.doc('perfiles/'+UID).set({avatar:d,name:P.name});PROF[UID]=d}else{await db.doc('perfiles/'+UID).delete();delete PROF[UID]}}
    catch(e){toast('No se pudo subir la foto')}
  }
  render();toast(d?'Foto actualizada':'Foto quitada');
}
function setCover(d){P.cover=d||null;save();render();toast(d?'Portada actualizada':'Portada quitada')}
function showPrev(){var el=$('#postPrev');if(el)el.innerHTML=postImg?'<div class="prev"><img src="'+esc(postImg)+'" alt="Vista previa"><button class="linkbtn" type="button" data-act="delprev">Quitar imagen</button></div>':''}
async function publish(){
  if(!ADMIN)return;
  var t=$('#postTxt');var v=t.value.trim();if(!v&&!postImg)return;
  var ch=speaker();
  var p={t:Date.now(),uid:UID,autor:ch.name,rol:ch.rol,texto:v,likes:{}};
  if(postImg)p.img=postImg;
  var img=postImg;t.value='';postImg=null;showPrev();
  if(SHARED){try{await db.collection('publicaciones').add(p)}catch(e){toast('No se pudo publicar');t.value=v;postImg=img;showPrev()}}
  else{p.id='l'+Date.now();localPosts.unshift(p);renderPosts()}
}
async function toggleLike(id){
  if(SHARED){
    var ref=db.doc('likes/'+id+'_'+UID),on=!!(likeMap[id]&&likeMap[id][UID]);
    try{if(on)await ref.delete();else await ref.set({post:id,uid:UID})}catch(e){toast('No se pudo registrar tu reacción')}
  }else{
    var q=localPosts.filter(function(x){return x.id===id})[0];if(!q)return;
    q.likes[UID]=!q.likes[UID];renderPosts();
  }
}
async function delPost(id){
  if(SHARED){try{await db.doc('publicaciones/'+id).delete()}catch(e){toast('No se pudo eliminar')}}
  else{localPosts=localPosts.filter(function(x){return x.id!==id});renderPosts()}
}

function act(a,el){
  switch(a){
    case 'theme':P.theme=isDark()?'light':'dark';applyTheme(P.theme);lsSet(P);document.querySelectorAll('.themebtn').forEach(function(b){b.outerHTML=themeBtn()});break;
    case 'room':openRoom(el.dataset.id);break;
    case 'back':leaveRoom();render();window.scrollTo(0,0);break;
    case 'mode':mode=el.dataset.m;var tv=$('#txt');var keep=tv?tv.value:'';
      document.querySelectorAll('.chip').forEach(function(c){var on=c.dataset.m===mode;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)});
      if(tv){tv.placeholder=PH[mode];tv.value=keep;tv.focus()}break;
    case 'dice':if(CANWRITE)roll();break;
    case 'like':toggleLike(el.dataset.id);break;
    case 'delpost':delPost(el.dataset.id);break;
    case 'editp':$('#editForm').hidden=!$('#editForm').hidden;break;
    case 'hist':$('#histBox').hidden=!$('#histBox').hidden;break;
    case 'share':
      try{navigator.clipboard.writeText(location.href).then(function(){toast('Enlace copiado')},function(){toast('Copia el enlace desde la barra de direcciones')})}
      catch(e){toast('Copia el enlace desde la barra de direcciones')}break;
    case 'delbanner':saveBanner(null);break;
    case 'delavatar':setAvatar(null);break;
    case 'delcover':setCover(null);break;
    case 'delprev':postImg=null;showPrev();break;
    case 'setchar':P.active=el.dataset.id;save();render();break;
    case 'delchar':(function(){var id=el.dataset.id,c=P.chars.filter(function(x){return x.id===id})[0];if(!c)return;
      askConfirm('¿Eliminar personaje?','¿Estás seguro de que quieres eliminar a «'+c.name+'»? Esta acción no se puede deshacer.','Sí, eliminar',function(){
        P.chars=P.chars.filter(function(x){return x.id!==id});if(!P.chars.length)P.chars.push({id:'c1',name:'Aurora Vega',rol:'heroe',poder:'Luz solidificada',base:true});if(!P.chars.some(function(x){return x.id===P.active}))P.active=P.chars[0].id;if(FV===id)FV=null;save();render();toast('Personaje eliminado')})})();break;
    case 'newroom':(function(){var f=$('#roomForm');if(f){f.hidden=!f.hidden;if(!f.hidden)f.scrollIntoView({behavior:'smooth',block:'start'})}})();break;
    case 'delroom':(function(){var id=el.dataset.id,r=ROOMS.filter(function(x){return x.id===id})[0];if(!r)return;
      askConfirm('¿Eliminar sala?','¿Estás seguro de que quieres eliminar la sala «'+r.nombre+'»? Dejará de estar disponible para todos los usuarios.','Sí, eliminar',function(){deleteRoom(id)})})();break;
    case 'newchar':(function(){var f=$('#charForm');if(f){f.hidden=!f.hidden;if(!f.hidden)f.scrollIntoView({behavior:'smooth',block:'start'})}})();break;
    case 'verficha':FV=el.dataset.id;render();break;
    case 'closeficha':FV=null;render();break;
    case 'newitem':(function(){var f=$('#itemForm');if(f){f.hidden=!f.hidden;if(!f.hidden)f.scrollIntoView({behavior:'smooth',block:'start'})}})();break;
    case 'delitem':(function(){var id=el.dataset.id,it=P.items.filter(function(x){return x.id===id})[0];if(!it)return;
      askConfirm('¿Eliminar artículo?','¿Estás seguro de que quieres eliminar «'+it.nom+'»? Esta acción no se puede deshacer.','Sí, eliminar',function(){
        P.items=P.items.filter(function(x){return x.id!==id});save();render();toast('Artículo eliminado')})})();break;
  }
}
document.addEventListener('click',function(e){
  var g=e.target.closest('[data-go]');if(g){go(g.dataset.go);return}
  var a=e.target.closest('[data-act]');if(a&&!a.disabled)act(a.dataset.act,a);
});
document.addEventListener('submit',function(e){
  var id=e.target.id;
  if(id==='composer'){e.preventDefault();doSend()}
  else if(id==='postForm'){e.preventDefault();publish()}
  else if(id==='editForm'){e.preventDefault();P.name=($('#pname').value.trim()||P.name);P.bio=($('#pbio').value.trim()||P.bio);save();render();toast('Perfil guardado')}
  else if(id==='regForm'){e.preventDefault();
    var nm=$('#rname').value.trim(),bd=$('#rbirth').value,miss=regMissing();
    if(miss.length){regRefresh();toast('Falta: '+miss.join(', '));return}
    P.name=nm;P.reg={birth:bd,t:Date.now()};save();
    view='rol';render();window.scrollTo(0,0);toast('¡Registro completado!');openRoom('spam')}
  else if(id==='roomForm'){e.preventDefault();var rn=gv('srnom');if(!rn){toast('Escribe el nombre de la sala');return}
    createRoom({nombre:rn,lugar:gv('srlug')||'Sala personalizada',tag:gv('srtag')||'Rol',escena:gv('sresc')||'Una nueva escena comienza…',ooc:!!$('#srooc').checked,custom:true,t:Date.now()});
    e.target.reset();e.target.hidden=true}
  else if(id==='charForm'){e.preventDefault();var n=gv('cname');if(!n){toast('Escribe el nombre y apellido');return}
    var po=vals('cpo',6);if(!po.length){toast('Agrega al menos un poder o habilidad');return}
    var f={alias:gv('calias'),cargo:gv('ccargo'),rango:gv('crango'),genero:gv('cgenero'),edad:gv('cedad'),altura:gv('caltura'),peso:gv('cpeso'),comp:gv('ccomp'),sangre:gv('csangre'),origen:gv('corigen'),
      pers:gv('cpers'),gustos:vals('cgu',3),disgustos:vals('cdi',3),miedos:vals('cmi',3),poderes:po,debil:vals('cde',6),
      fue:gv('cfue'),vel:gv('cvel'),res:gv('cres'),rea:gv('crea'),dom:gv('cdom'),extra:gv('cextra'),hist:gv('chist')};
    var nc={id:'c'+Date.now().toString(36),name:n,rol:gv('crol'),poder:po[0],ficha:f};
    P.chars=P.chars.filter(function(c){return !isBase(c)});P.chars.push(nc);
    if(!P.chars.some(function(c){return c.id===P.active}))P.active=nc.id;
    save();render();toast('Personaje creado. ¡Ya puedes entrar a todas las salas!')}
  else if(id==='itemForm'){e.preventDefault();var nom=gv('inom');if(!nom){toast('Escribe el nombre del artículo');return}
    P.items.unshift({id:'i'+Date.now().toString(36),nom:nom,cat:gv('icat'),rar:gv('irar'),pre:gv('ipre'),mon:gv('imon'),efe:gv('iefe'),dur:gv('idur'),res:gv('ires'),bon:gv('ibon'),est:gv('iest')});
    save();render();toast('Artículo guardado')}
});
document.addEventListener('keydown',function(e){
  if(e.target&&e.target.id==='txt'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();doSend()}
});
document.addEventListener('change',function(e){
  var t=e.target;
  if(t.id==='pjsel'){P.active=t.value;save();return}
  var up=t.dataset&&t.dataset.up;if(!up||!t.files||!t.files[0])return;
  var f=t.files[0];t.value='';
  if((up==='banner'||up==='post')&&!ADMIN)return;
  var cfg={banner:[1000,536,230000],avatar:[160,160,30000],cover:[840,144,70000],post:[900,0,200000]}[up];
  if(!cfg)return;
  compress(f,cfg[0],cfg[1],cfg[2]).then(function(d){
    if(up==='banner')saveBanner(d);else if(up==='avatar')setAvatar(d);else if(up==='cover')setCover(d);else{postImg=d;showPrev()}
  },function(){toast('No se pudo procesar la imagen')});
});

/* ---------- nube (db + user) ---------- */
async function initCloud(){
  try{user=await use('user');db=await use('db')}catch(e){}
  if(!db){ADMIN=true;return}
  try{var id=user?await user.id():null;if(id){UID=id;CLOUD=true}}catch(e){}
  try{if(user){var c=await user.can('data.write');if(c===false)CANWRITE=false}}catch(e){}
  try{ADMIN=user?await user.canEdit():false}catch(e){ADMIN=false}
  SHARED=true;
  if(CLOUD){
    try{
      var s=await db.doc('data/users/'+UID+'/profile').get();
      if(s.exists){var d=JSON.parse(JSON.stringify(s.data()));if((d.xp||0)>=P.xp){P.name=d.name||P.name;P.bio=d.bio||P.bio;P.chars=d.chars&&d.chars.length?d.chars:P.chars;P.active=d.active||P.active;P.xp=d.xp||0;P.msgs=d.msgs||0;P.crit=d.crit||0;lsSet(P)}if(d.cover&&!P.cover){P.cover=d.cover;lsSet(P)}
        if(d.reg&&!P.reg){P.reg=d.reg;if(!P.name||P.name==='Jugador Nuevo')P.name=d.name||P.name;lsSet(P)}
        if(d.items&&d.items.length&&!P.items.length){P.items=d.items;lsSet(P)}}
    }catch(e){}
  }
  db.collection('publicaciones').orderBy('t','desc').limit(30).onSnapshot(function(s){
    posts=s.docs.map(function(d){var o=JSON.parse(JSON.stringify(d.
