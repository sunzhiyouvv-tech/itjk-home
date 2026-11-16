const state = { all: [], query: '', suffix: 'all', page: 1, pageSize: 12 };

const el = {
  grid: document.querySelector('#domainGrid'),
  search: document.querySelector('#searchInput'),
  filters: document.querySelector('#suffixFilters'),
  count: document.querySelector('#resultCount'),
  pagination: document.querySelector('#pagination'),
  empty: document.querySelector('#emptyState'),
  clear: document.querySelector('#clearBtn'),
  toast: document.querySelector('#toast'),
};

const escapeHtml = value => String(value).replace(/[&<>"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
}[char]));

const filtered = () => state.all.filter(domain =>
  (state.suffix === 'all' || domain.suffix === state.suffix) &&
  (!state.query || `${domain.domain} ${domain.meaning}`.toLowerCase().includes(state.query))
);

function card(domain) {
  const subject = encodeURIComponent(`咨询域名：${domain.domain}`);
  const body = encodeURIComponent(`你好，我对域名 ${domain.domain} 感兴趣，请联系我洽谈。`);
  return `<article class="domain-card">
    <div class="card-top">
      <span class="suffix">.${escapeHtml(domain.suffix)} DOMAIN</span>
      <button class="copy-btn" data-copy="${escapeHtml(domain.domain)}" aria-label="复制 ${escapeHtml(domain.domain)}">⧉</button>
    </div>
    <h3>${escapeHtml(domain.domain)}</h3>
    <p>${escapeHtml(domain.meaning || '优质品牌域名')}</p>
    <a class="inquiry" href="mailto:mail@itjk.com?subject=${subject}&body=${body}">立即询价 <span>↗</span></a>
  </article>`;
}

function pageItems(totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages, state.page - 1, state.page, state.page + 1]);
  const sorted = [...pages].filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((page, index) => {
    if (index && page - sorted[index - 1] > 1) items.push('ellipsis');
    items.push(page);
  });
  return items;
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    el.pagination.innerHTML = '';
    return;
  }
  const pages = pageItems(totalPages).map(item => item === 'ellipsis'
    ? '<span class="page-ellipsis" aria-hidden="true">…</span>'
    : `<button class="page-btn${item === state.page ? ' active' : ''}" data-page="${item}" type="button"${item === state.page ? ' aria-current="page"' : ''}>${item}</button>`
  ).join('');
  el.pagination.innerHTML = `
    <button class="page-btn page-nav" data-page="${state.page - 1}" type="button" ${state.page === 1 ? 'disabled' : ''}>← 上一页</button>
    ${pages}
    <button class="page-btn page-nav" data-page="${state.page + 1}" type="button" ${state.page === totalPages ? 'disabled' : ''}>下一页 →</button>`;
}

function render() {
  const data = filtered();
  const totalPages = Math.max(1, Math.ceil(data.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * state.pageSize;
  const visible = data.slice(start, start + state.pageSize);
  el.grid.innerHTML = visible.map(card).join('');
  el.count.textContent = data.length
    ? `找到 ${data.length} 个域名 · 第 ${state.page} / ${totalPages} 页`
    : '没有找到匹配域名';
  el.empty.hidden = data.length > 0;
  renderPagination(data.length ? totalPages : 0);
}

function setSuffix(suffix) {
  state.suffix = suffix;
  state.page = 1;
  document.querySelectorAll('.filter-btn').forEach(button =>
    button.classList.toggle('active', button.dataset.suffix === suffix)
  );
  render();
}

function initFilters() {
  const counts = state.all.reduce((result, domain) => {
    result[domain.suffix] = (result[domain.suffix] || 0) + 1;
    return result;
  }, {});
  const suffixes = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  el.filters.innerHTML = `<button class="filter-btn active" data-suffix="all">全部 ${state.all.length}</button>` +
    suffixes.map(([suffix, count]) => `<button class="filter-btn" data-suffix="${suffix}">.${suffix} ${count}</button>`).join('');
}

fetch('domains.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    state.all = data;
    document.querySelector('#totalMetric').textContent = `${data.length}+`;
    document.querySelector('#suffixMetric').textContent = new Set(data.map(domain => domain.suffix)).size;
    initFilters();
    render();
  })
  .catch(() => {
    el.count.textContent = '域名数据加载失败，请刷新重试';
  });

el.search.addEventListener('input', event => {
  state.query = event.target.value.trim().toLowerCase();
  state.page = 1;
  render();
});

el.filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-suffix]');
  if (button) setSuffix(button.dataset.suffix);
});

el.pagination.addEventListener('click', event => {
  const button = event.target.closest('button[data-page]');
  if (!button || button.disabled) return;
  state.page = Number(button.dataset.page);
  render();
  document.querySelector('#domains').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

el.clear.addEventListener('click', () => {
  el.search.value = '';
  state.query = '';
  setSuffix('all');
});

el.grid.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  await navigator.clipboard.writeText(button.dataset.copy);
  el.toast.textContent = `已复制 ${button.dataset.copy}`;
  el.toast.classList.add('show');
  setTimeout(() => el.toast.classList.remove('show'), 1800);
});

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    el.search.focus();
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

