let articles = [];
let activeCat = 'alle';

async function load() {
  try {
    const res = await fetch('artikel/articles.json');
    articles = await res.json();
  } catch(e){ articles = []; }
  render();
}

function render() {
  const q = document.getElementById('search').value.toLowerCase();
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  const filtered = articles.filter(a => {
    const matchCat = activeCat === 'alle' || a.category === activeCat;
    const matchSearch = a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.tags || []).join(' ').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if(filtered.length === 0) grid.innerHTML = '<p style="color:#aaa">Noch kein Artikel gefunden. Erstelle einen über "Neuer Artikel"!</p>';

  filtered.forEach(a => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${a.icon}" onerror="this.src='https://mc-heads.net/avatar/MHF_Creeper/100'">
      <span class="cat">${a.category}</span>
      <h3>${a.title}</h3>
      <p>${a.description}</p>
    `;
    card.onclick = () => openArticle(a);
    grid.appendChild(card);
  });
}

async function openArticle(a) {
  const res = await fetch(a.file);
  const md = await res.text();
  document.getElementById('grid').classList.add('hidden');
  document.getElementById('main-header').classList.add('hidden');
  const view = document.getElementById('article-view');
  view.classList.remove('hidden');
  document.getElementById('article-icon').src = a.icon;
  document.getElementById('article-content').innerHTML = marked.parse(md);
  window.scrollTo(0,0);
}

document.getElementById('back').onclick = () => {
  document.getElementById('article-view').classList.add('hidden');
  document.getElementById('grid').classList.remove('hidden');
  document.getElementById('main-header').classList.remove('hidden');
};

document.getElementById('search').addEventListener('input', render);
document.querySelectorAll('#filter button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('#filter button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    render();
  }
});

load();
