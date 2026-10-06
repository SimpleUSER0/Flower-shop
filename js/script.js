'use strict';
// Only replace null values with details explicitly confirmed by the owner.
const CONTACT = Object.freeze({phone:null, whatsapp:null, instagram:null, address:null, hours:null});
document.documentElement.classList.add('js');
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const menu = $('#primary-nav'), toggle = $('.menu-toggle');
function closeMenu(restore = false) {
 menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false');
 toggle.setAttribute('aria-label','მენიუს გახსნა'); if(restore) toggle.focus();
}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'მენიუს დახურვა':'მენიუს გახსნა');});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true')closeMenu(true);});
matchMedia('(min-width:1200px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const openers = new WeakMap();
function openDialog(dialog,opener){closeMenu();openers.set(dialog,opener||document.activeElement);dialog.showModal();document.body.classList.add('is-locked');}
$$('dialog').forEach(dialog=>{
 dialog.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
 dialog.addEventListener('close',()=>{document.body.classList.remove('is-locked');const opener=openers.get(dialog);if(opener?.isConnected)opener.focus({preventScroll:true});});
});
const order=$('#order-dialog'), product=$('#order-product'), occasion=$('#order-occasion'), message=$('#order-message'), status=$('#order-status');
function compose(){message.value=['გამარჯობა, მსურს ყვავილების შეკვეთა.',product.value?'სასურველი თაიგული: '+product.value+'.':'',occasion.value?'შემთხვევა: '+occasion.value+'.':'','გთხოვთ, დამიზუსტოთ ფასი, შემადგენლობა და მიღების პირობები.'].filter(Boolean).join('\n');status.textContent='';}
function startOrder(button){product.value=button.dataset.order||'';occasion.value=button.dataset.occasion||'';compose();openDialog(order,button);}
$$('[data-order], [data-whatsapp], [data-occasion]').forEach(button=>button.addEventListener('click',()=>startOrder(button)));
product.addEventListener('change',compose);occasion.addEventListener('change',compose);
message.addEventListener('input',()=>{status.textContent='';});
order.addEventListener('close',()=>{product.value='';occasion.value='';message.value='';status.textContent='';});
$('#send-whatsapp').addEventListener('click',()=>{
 if(!message.value.trim()){status.textContent='ჯერ მოამზადე შეტყობინების ტექსტი.';message.focus();return;}
 if(!CONTACT.whatsapp){status.textContent='დასაზუსტებელია: WhatsApp-ის ოფიციალური ნომერი დასადასტურებელია. რეალური შეტყობინება არ გაგზავნილა. შეგიძლია ტექსტი დააკოპირო.';return;}
 const number=CONTACT.whatsapp.replace(/\D/g,'');
 if(!/^\d{8,15}$/.test(number)){status.textContent='დასაზუსტებელია: შეამოწმე ოფიციალური WhatsApp-ის ნომერი.';return;}
 window.open('https://wa.me/'+number+'?text='+encodeURIComponent(message.value),'_blank','noopener,noreferrer');
});
$('#copy-message').addEventListener('click',async()=>{
 if(!message.value.trim()){status.textContent='დასაკოპირებლად ჩაწერე შეტყობინება.';message.focus();return;}
 try {if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(message.value);status.textContent='ტექსტი დაკოპირებულია. შეკვეთა არ გაგზავნილა.';}
 catch {message.focus();message.select();let copied=false;try{copied=document.execCommand('copy');}catch{}status.textContent=copied?'ტექსტი დაკოპირებულია. შეკვეთა არ გაგზავნილა.':'ტექსტი მონიშნულია — დააკოპირე ხელით. შეკვეთა არ გაგზავნილა.';}
});
$$('[data-call]').forEach(button=>button.addEventListener('click',()=>{
 if(CONTACT.phone&&/^\+?[0-9 ()-]{8,24}$/.test(CONTACT.phone)){location.href='tel:'+CONTACT.phone.replace(/[ ()-]/g,'');return;}
 openDialog($('#info-dialog'),button);
}));
for(const [key,selector] of Object.entries({phone:'[data-phone]',address:'[data-address]',hours:'[data-hours]'})){if(CONTACT[key])$$(selector).forEach(el=>el.textContent=CONTACT[key]);}
if(CONTACT.whatsapp)$$('[data-whatsapp-status]').forEach(el=>el.textContent=CONTACT.whatsapp);
if(CONTACT.whatsapp){$('#order-todo').hidden=true;$$('.hero .todo-note').forEach(el=>el.hidden=true);}
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 const category=button.dataset.filter;
 $$('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
 let count=0;$$('.bouquet-card').forEach(card=>{card.hidden=category!=='ყველა'&&card.dataset.category!==category;if(!card.hidden)count++;});$('#product-count').textContent=count+' დემო ნიმუში';
}));
const gallery=$$('[data-gallery]'), lightbox=$('#lightbox');let current=0;
function showPhoto(index){current=(index+gallery.length)%gallery.length;const item=gallery[current];$('#lightbox-image').src=item.href;$('#lightbox-image').alt=item.querySelector('img').alt;$('#lightbox-caption').textContent=item.dataset.caption;$('#lightbox-count').textContent=(current+1)+' / '+gallery.length;}
gallery.forEach((item,index)=>item.addEventListener('click',e=>{e.preventDefault();showPhoto(index);openDialog(lightbox,item);}));
$('#photo-prev').addEventListener('click',()=>showPhoto(current-1));$('#photo-next').addEventListener('click',()=>showPhoto(current+1));
lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(current+(e.key==='ArrowRight'?1:-1));}});
let startX=0,startY=0;const photo=$('#lightbox-image');photo.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX;startY=e.changedTouches[0].clientY;},{passive:true});photo.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))showPhoto(current+(dx<0?1:-1));},{passive:true});
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){document.documentElement.classList.add('motion-enabled');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));}
if('IntersectionObserver' in window){const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){menu.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-15% 0px -65% 0px'});$$('main>section[id]').forEach(section=>navObserver.observe(section));}
$('#year').textContent=new Date().getFullYear();
