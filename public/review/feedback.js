/* Shared screen review. Personal access fixes authorship; no production records are modified. */
(() => {
  const names = { eugenie: 'Eugénie', rachid: 'Rachid' };
  const host = document.createElement('section');
  host.id = 'feedback';
  host.className = 'feedback';
  host.innerHTML =
    '<div class="feedback-head"><div><div class="eyebrow">Construisons la suite ensemble</div><h2>Vos feedbacks.</h2><p id="feedback-context"></p></div><div><p id="review-identity" class="muted"></p><button id="review-refresh" type="button">Actualiser les retours</button></div></div><p id="review-error" role="alert"></p><div class="feedback-grid"></div>';
  document.querySelector('.screenfoot').after(host);
  const cards = {},
    drafts = new Map();
  let active = '',
    author = null,
    generation = 0,
    uploading = false,
    loading = false,
    draftsLoaded = false;
  const draftNotice = document.createElement('p');
  draftNotice.className = 'muted';
  host.querySelector('.feedback-head').after(draftNotice);
  function persistDrafts() {
    try {
      localStorage.setItem('bee-review-drafts-' + author, JSON.stringify([...drafts]));
    } catch {
      /* An unavailable local store must never prevent a server save. */
    }
    draftNotice.replaceChildren();
    if (drafts.size) {
      draftNotice.append('Brouillons non partagés : ');
      for (const [key] of drafts) {
        const a = document.createElement('a');
        a.href = '#view/' + key;
        a.textContent = key + ' ';
        draftNotice.append(a);
      }
    }
  }
  function lockNavigation(lock) {
    for (const id of ['role', 'stage', 'page', 'prev', 'next']) {
      const el = document.getElementById(id);
      if (lock) {
        el.dataset.wasDisabled = String(el.disabled);
        el.disabled = true;
      } else el.disabled = el.dataset.wasDisabled === 'true';
    }
  }
  for (const [key, name] of Object.entries(names)) {
    const card = document.createElement('article');
    card.className = 'feedback-card';
    card.dataset.author = key;
    card.innerHTML = `<div class="feedback-card-head"><h3>Feedback ${name}</h3><span class="feedback-owner"></span></div><label for="feedback-${key}" class="sr-only">Feedback ${name}</label><textarea id="feedback-${key}" rows="5" maxlength="15000" placeholder="Ce qui fonctionne, ce qui manque, ce que vous souhaitez changer…" disabled></textarea><div class="feedback-actions"><label class="upload-label" for="images-${key}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6M16 7v4m-2-2h4"/></svg>Ajouter des images</label><input id="images-${key}" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled><button class="feedback-save primary" type="button" disabled>Enregistrer</button></div><p class="feedback-status muted" role="status" aria-live="polite">Chargement…</p><div class="feedback-images"></div>`;
    host.querySelector('.feedback-grid').append(card);
    const c = {
      card,
      text: card.querySelector('textarea'),
      files: card.querySelector('input'),
      save: card.querySelector('button'),
      status: card.querySelector('.feedback-status'),
      images: card.querySelector('.feedback-images'),
      version: 0,
      saved: '',
      busy: false,
    };
    cards[key] = c;
    c.text.oninput = () => {
      drafts.set(active, { body: c.text.value, version: c.version });
      persistDrafts();
      c.status.textContent = 'Modifications non enregistrées';
      c.save.disabled = false;
    };
    c.save.onclick = () => save();
    c.files.onchange = () => upload([...c.files.files]);
  }
  const error = document.getElementById('review-error');
  function fail(e) {
    error.textContent =
      e.message || 'Impossible de joindre le serveur. Vos modifications restent dans cet onglet.';
  }
  async function api(url, options) {
    const r = await fetch(url, { cache: 'no-store', ...options });
    let data;
    try {
      data = await r.json();
    } catch {
      throw Error('Le serveur est temporairement indisponible. Réessayez.');
    }
    if (!r.ok) throw Error(data.error || 'Enregistrement impossible.');
    return data;
  }
  function params(key = active) {
    const [role, page] = key.split('/');
    return { role, page };
  }
  function imageUrl(id) {
    return '/api/community/review/images?id=' + encodeURIComponent(id);
  }
  function displayImages(c, list, key) {
    c.images.replaceChildren();
    for (const file of list) {
      const figure = document.createElement('figure'),
        link = document.createElement('a'),
        img = document.createElement('img'),
        caption = document.createElement('figcaption');
      link.href = imageUrl(file.id);
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', 'Agrandir ' + file.name);
      img.src = link.href;
      img.alt = file.name;
      img.loading = 'lazy';
      link.append(img);
      caption.textContent = file.name;
      figure.append(link, caption);
      if (key === author) {
        const remove = document.createElement('button');
        remove.textContent = 'Retirer';
        remove.type = 'button';
        remove.setAttribute('aria-label', 'Retirer ' + file.name);
        remove.onclick = async () => {
          if (!confirm('Retirer cette image de votre feedback ?')) return;
          remove.disabled = true;
          try {
            await api(imageUrl(file.id), { method: 'DELETE' });
            await load(false);
          } catch (e) {
            fail(e);
            remove.disabled = false;
          }
        };
        figure.append(remove);
      }
      c.images.append(figure);
    }
  }
  async function load(reset = false) {
    const target = active,
      ticket = ++generation;
    loading = true;
    error.textContent = '';
    try {
      const data = await api('/api/community/review?' + new URLSearchParams(params(target)));
      if (ticket !== generation) return;
      if (author && author !== data.author) {
        drafts.clear();
        draftsLoaded = false;
      }
      author = data.author;
      if (!draftsLoaded) {
        draftsLoaded = true;
        try {
          for (const [key, draft] of JSON.parse(
            localStorage.getItem('bee-review-drafts-' + author) || '[]'
          ))
            if (
              typeof key === 'string' &&
              typeof draft.body === 'string' &&
              Number.isSafeInteger(draft.version)
            )
              drafts.set(key, draft);
        } catch {}
        persistDrafts();
      }
      document.getElementById('review-identity').textContent =
        'Vous contribuez comme ' + names[author] + '. Les deux retours sont visibles ensemble.';
      document.getElementById('feedback-context').textContent =
        document.getElementById('role').selectedOptions[0].text +
        ' · ' +
        document.getElementById('page').selectedOptions[0].text;
      for (const [key, c] of Object.entries(cards)) {
        const row = data.feedback.find((f) => f.author === key) || { body: '', version: 0 };
        const mine = key === author;
        const draft = mine ? drafts.get(target) : null;
        c.version = draft && !reset ? draft.version : row.version;
        c.saved = row.body;
        c.text.value = draft ? draft.body : row.body;
        c.card.querySelector('.server-copy')?.remove();
        if (draft && reset) {
          draft.version = row.version;
          const remote = document.createElement('details');
          remote.className = 'server-copy';
          remote.open = true;
          const title = document.createElement('summary');
          title.textContent = 'Version enregistrée · comparez et fusionnez avant d’enregistrer';
          const text = document.createElement('p');
          text.style.whiteSpace = 'pre-wrap';
          text.textContent = row.body || '(Aucun texte enregistré)';
          remote.append(title, text);
          c.card.append(remote);
          persistDrafts();
        }
        c.text.disabled = false;
        c.text.readOnly = !mine;
        c.files.disabled = !mine || uploading;
        c.save.hidden = !mine;
        c.save.disabled = !mine || c.text.value === c.saved;
        c.card.classList.toggle('is-mine', mine);
        c.card.querySelector('.feedback-actions').hidden = !mine;
        c.card.querySelector('.feedback-owner').textContent = mine ? 'Votre espace' : 'Son espace';
        c.text.placeholder = mine
          ? 'Ce qui fonctionne, ce qui manque, ce que vous souhaitez changer…'
          : 'Aucun feedback pour cet écran pour le moment.';
        c.status.textContent =
          draft
            ? 'Modifications non enregistrées'
            : row.updated_at
              ? 'Enregistré · ' +
                new Date(row.updated_at).toLocaleString('fr-FR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })
              : 'Aucun retour pour cet écran.';
        displayImages(
          c,
          data.images.filter((f) => f.author === key),
          key
        );
      }
      const reviewed = new Set(data.summary.map((s) => s.role + '/' + s.page));
      document.getElementById('review-count').textContent =
        reviewed.size + ' / 498 écrans commentés';
    } catch (e) {
      if (ticket === generation) fail(e);
    } finally {
      if (ticket === generation) loading = false;
    }
  }
  async function save() {
    if (!author || loading) return false;
    const c = cards[author],
      target = active;
    if (c.busy) return false;
    if (c.text.value === c.saved) {
      drafts.delete(target);
      persistDrafts();
      return true;
    }
    const body = c.text.value;
    c.busy = true;
    lockNavigation(true);
    c.save.disabled = true;
    c.status.textContent = 'Enregistrement…';
    error.textContent = '';
    try {
      const result = await api('/api/community/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params(target), author, body, version: c.version }),
      });
      c.version = result.version;
      c.saved = body;
      c.card.querySelector('.server-copy')?.remove();
      if (active === target) {
        if (c.text.value === body) {
          drafts.delete(target);
          c.status.textContent = 'Enregistré et partagé';
        } else {
          drafts.set(target, { body: c.text.value, version: c.version });
          c.status.textContent = 'Nouvelles modifications à enregistrer';
        }
      }
      persistDrafts();
      return !drafts.has(target);
    } catch (e) {
      fail(e);
      c.status.textContent = 'Non enregistré · votre texte est conservé';
      return false;
    } finally {
      c.busy = false;
      lockNavigation(false);
      c.save.disabled = c.text.value === c.saved;
    }
  }
  async function optimize(file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      throw Error(file.name + ' : utilisez une image JPG, PNG ou WebP.');
    if (file.size > 20000000) throw Error(file.name + ' : choisissez une image de moins de 20 Mo.');
    const bitmap = await createImageBitmap(file);
    try {
      const ratio = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * ratio);
      canvas.height = Math.round(bitmap.height * ratio);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
      if (!blob || blob.size > 3145728)
        throw Error(file.name + ' : réduisez les dimensions de cette image.');
      return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
    } finally {
      bitmap.close();
    }
  }
  async function upload(files) {
    if (!files.length || !author) return;
    const c = cards[author],
      target = active;
    if (!(await save())) return;
    uploading = true;
    lockNavigation(true);
    c.files.disabled = true;
    c.text.readOnly = true;
    c.save.disabled = true;
    error.textContent = '';
    let count = 0;
    try {
      for (const file of files) {
        c.status.textContent = 'Envoi des images · ' + (count + 1) + ' / ' + files.length;
        const optimized = await optimize(file),
          form = new FormData();
        const p = params(target);
        form.append('role', p.role);
        form.append('page', p.page);
        form.append('author', author);
        form.append('file', optimized);
        await api('/api/community/review/images', { method: 'POST', body: form });
        count++;
      }
    } catch (e) {
      fail(Error(count + ' image(s) ajoutée(s). ' + e.message));
    } finally {
      const message = error.textContent;
      uploading = false;
      lockNavigation(false);
      c.files.value = '';
      await load(false);
      if (message) error.textContent = message;
      else c.status.textContent = count + ' image(s) enregistrée(s) et partagée(s).';
    }
  }
  document.getElementById('review-refresh').onclick = () => {
    if (!uploading && !Object.values(cards).some((c) => c.busy)) load(true);
  };
  // Preserve drafts across role/page navigation; explicit save prevents accidental publication of unfinished notes.
  document.addEventListener('review:screen', () => {
    active = location.hash.replace('#view/', '');
    for (const c of Object.values(cards)) {
      c.text.disabled = true;
      c.files.disabled = true;
      c.save.disabled = true;
      c.status.textContent = 'Chargement…';
    }
    load();
  });
  document.addEventListener(
    'change',
    (e) => {
      if (!uploading) return;
      if (['role', 'stage', 'page'].includes(e.target.id)) {
        e.stopImmediatePropagation();
        location.hash = '#view/' + active;
        error.textContent = 'Patientez pendant l’envoi des images.';
      }
    },
    true
  );
  document.addEventListener(
    'click',
    (e) => {
      if (uploading && e.target.closest('#prev,#next')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        error.textContent = 'Patientez pendant l’envoi des images.';
      }
    },
    true
  );
  window.addEventListener('beforeunload', (e) => {
    if (drafts.size || uploading) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !uploading && !drafts.size) load();
  });
  setInterval(() => {
    if (
      !document.hidden &&
      !uploading &&
      !loading &&
      !drafts.size &&
      !Object.values(cards).some((c) => c.busy)
    )
      load();
  }, 30000);
  active = location.hash.replace('#view/', '');
  load();
})();
