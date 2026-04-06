// Cursor
const dot = document.getElementById('curDot');
const ring = document.getElementById('curRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
(function anim(){
  dot.style.left=mx+'px'; dot.style.top=my+'px';
  rx+=(mx-rx)*0.14; ry+=(my-ry)*0.14;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(anim);
})();
document.querySelectorAll('a,button,.proj-card,.sk,.astat').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
});

// Scroll bar
const bar=document.getElementById('scrollBar');
window.addEventListener('scroll',()=>{
  bar.style.width=(window.scrollY/(document.body.scrollHeight-window.innerHeight)*100)+'%';
});

// Reveal
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

// Parallax blobs
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  document.querySelectorAll('.type-blob,.deco-ball').forEach((g,i)=>{
    g.style.transform=`translateY(${y*(0.06+i*0.02)}px)`;
  });
});

// Live view counter
const viewCountEl = document.getElementById('viewCount');
const viewCountStatusEl = document.getElementById('viewCountStatus');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formSubmitButton = contactForm ? contactForm.querySelector('.form-submit') : null;

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const name = contactForm.elements.name.value.trim();
    const email = contactForm.elements.email.value.trim();
    const message = contactForm.elements.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Please fill all fields before sending.';
      formStatus.classList.remove('is-success');
      formStatus.classList.add('is-error');
      return;
    }

    formStatus.textContent = 'Sending your message...';
    formStatus.classList.remove('is-success', 'is-error');
    if (formSubmitButton) {
      formSubmitButton.disabled = true;
      formSubmitButton.textContent = 'SENDING...';
    }

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Send failed.');
      }

      formStatus.textContent = 'Message sent successfully.';
      formStatus.classList.add('is-success');
      formStatus.classList.remove('is-error');
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = 'Could not send message right now. Please try again in a moment.';
      formStatus.classList.remove('is-success');
      formStatus.classList.add('is-error');
      console.warn('Contact form submission failed:', error);
    } finally {
      if (formSubmitButton) {
        formSubmitButton.disabled = false;
        formSubmitButton.textContent = 'SEND MESSAGE ▶';
      }
    }
  });
}

async function updateLiveViewCount() {
  if (!viewCountEl) return;

  const namespace = 'arush-pradhan-portfolio';
  const key = 'home';

  try {
    const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Counter API request failed.');
    }

    const data = await response.json();
    const count = Number(data.value);
    viewCountEl.textContent = Number.isFinite(count) ? count.toLocaleString('en-IN') : '--';
    if (viewCountStatusEl) viewCountStatusEl.textContent = 'global';
  } catch (error) {
    const localKey = 'portfolioLocalViews';
    const localCount = Number(localStorage.getItem(localKey) || '0') + 1;
    localStorage.setItem(localKey, String(localCount));
    viewCountEl.textContent = `${localCount.toLocaleString('en-IN')}*`;
    if (viewCountStatusEl) viewCountStatusEl.textContent = 'local fallback';
    console.warn('Using local fallback view counter:', error);
  }
}

updateLiveViewCount();