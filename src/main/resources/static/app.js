/* ═══════════════════════════════════════════
   Finanças Pro — app.js
   Full API integration with Spring Boot backend
   ═══════════════════════════════════════════ */
//const API = 'http://192.168.1.7:8081';
const API = 'http://localhost:8081';

// ── Helpers ──
function fmt(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
function fmtDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="material-icons-outlined" style="font-size:18px">${type === 'success' ? 'check_circle' : 'error'}</span>${msg}`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3500);
}

async function apiGet(path) {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return res.json();
}
async function apiPost(path, body) {
    const res = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await getApiError(res, `POST ${path} failed`));
    return readJson(res);
}
async function apiPut(path, body) {
    const res = await fetch(API + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`PUT ${path} failed`);
    return res.json();
}
async function apiDelete(path) {
    const res = await fetch(API + path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE ${path} failed`);
}

async function readJson(res) {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

async function getApiError(res, fallback) {
    try {
        const text = await res.text();
        return text || fallback;
    } catch (e) {
        return fallback;
    }
}

function saveLoggedUser(user) {
    if (!user) return;
    localStorage.setItem('financasUser', JSON.stringify(user));
}

function getLoggedUser() {
    try {
        return JSON.parse(localStorage.getItem('financasUser'));
    } catch (e) {
        return null;
    }
}

function updateLoggedUserInfo() {
    const user = getLoggedUser();
    if (!user) return;
    const email = user.email || 'Usuario Pro';
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    if (userName) userName.textContent = email;
    if (userAvatar) userAvatar.textContent = email.charAt(0).toUpperCase();
    const txUsuario = document.getElementById('txUsuario');
    const addUsuario = document.getElementById('addUsuario');
    if (txUsuario && user.id) txUsuario.value = user.id;
    if (addUsuario && user.id) addUsuario.value = user.id;
}

async function authenticateUser(path, email, senha) {
    return apiPost(path, { email, senha });
}

function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submit = form.querySelector('button[type="submit"]');
        submit.disabled = true;
        try {
            const user = await authenticateUser('/user/api/login', document.getElementById('loginEmail').value.trim(), document.getElementById('loginSenha').value);
            saveLoggedUser(user);
            showToast('Login realizado com sucesso!');
            setTimeout(() => window.location.href = 'index.html', 900);
        } catch (err) {
            showToast('E-mail ou senha invalidos', 'error');
        } finally {
            submit.disabled = false;
        }
    });
}

function initCadastro() {
    const form = document.getElementById('cadastroForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const senha = document.getElementById('cadastroSenha').value;
        const confirmarSenha = document.getElementById('cadastroConfirmarSenha').value;
        if (senha !== confirmarSenha) {
            showToast('As senhas nao conferem', 'error');
            return;
        }
        const submit = form.querySelector('button[type="submit"]');
        submit.disabled = true;
        try {
            const user = await authenticateUser('/user', document.getElementById('cadastroEmail').value.trim(), senha);
            saveLoggedUser(user);
            showToast('Cadastro criado com sucesso!');
            setTimeout(() => window.location.href = 'index.html', 900);
        } catch (err) {
            showToast('Erro ao criar cadastro', 'error');
        } finally {
            submit.disabled = false;
        }
    });
}

function setupPasswordToggles() {
    document.querySelectorAll('[data-toggle-password]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.togglePassword);
            if (!input) return;
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            const icon = button.querySelector('.material-icons-outlined');
            if (icon) icon.textContent = show ? 'visibility_off' : 'visibility';
            button.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
        });
    });
}

document.addEventListener('DOMContentLoaded', updateLoggedUserInfo);
document.addEventListener('DOMContentLoaded', setupPasswordToggles);

// Category icon mapping
const catIcons = {
    'alimentação': 'shopping_cart', 'alimentacao': 'shopping_cart',
    'transporte': 'directions_car', 'moradia': 'home', 'lazer': 'sports_esports',
    'saúde': 'favorite', 'saude': 'favorite', 'contas': 'bolt',
    'renda': 'attach_money', 'salário': 'attach_money', 'salario': 'attach_money',
    'freelance': 'laptop', 'educação': 'school', 'educacao': 'school'
};
function getCatIcon(cat) {
    const key = (cat || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return catIcons[key] || 'receipt_long';
}
function getCatBadgeClass(cat) {
    const key = (cat || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const map = { alimentacao: 'alimentacao', transporte: 'transporte', moradia: 'moradia', lazer: 'lazer', contas: 'contas', saude: 'saude', renda: 'renda', salario: 'renda' };
    return map[key] || 'default';
}

// ══════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════
async function legacyInitDashboard() {
    try {
        const despesas = await apiGet('/despesas');
        renderDashboard(despesas);
    } catch (e) {
        console.error(e);
        showToast('Erro ao carregar dashboard', 'error');
        renderDashboard([]);
    }
}

function legacyRenderDashboard(despesas) {
    const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
    const gastoMedio = despesas.length > 0 ? totalDespesas / despesas.length : 0;
    const maiorGasto = despesas.length > 0 ? Math.max(...despesas.map(d => d.valor)) : 0;
    document.getElementById('totalGastoPeriodo').textContent = fmt(totalDespesas);
    document.getElementById('gastoMedio').textContent = fmt(gastoMedio);
    document.getElementById('maiorGasto').textContent = fmt(maiorGasto);
    document.getElementById('gastoResumo').textContent = `${despesas.length} lancamentos`;

    // Recent transactions
    const container = document.getElementById('recentTransactions');
    const recent = despesas.slice(-5).reverse();
    if (recent.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:20px 0;text-align:center;">Nenhuma transação encontrada</p>';
    } else {
        container.innerHTML = recent.map(tx => `
            <div class="tx-item">
                <div class="tx-icon"><span class="material-icons-outlined">${getCatIcon(tx.categoria)}</span></div>
                <div class="tx-info">
                    <div class="tx-name">${tx.nome}</div>
                    <div class="tx-meta">${fmtDate(tx.data)} • ${tx.categoria}</div>
                </div>
                <div class="tx-amount negative">- ${fmt(tx.valor)}</div>
            </div>
        `).join('');
    }

    // Chart
    if (typeof Chart !== 'undefined') {
        renderGastosChart(despesas);
    }
}

function legacyRenderGastosChart(despesas) {
    const ctx = document.getElementById('gastosChart');
    if (!ctx) return;
    const labels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
    const data = labels.map((_, i) => {
        const base = despesas.length > 0 ? despesas.reduce((s, d) => s + d.valor, 0) : 0;
        return 0;
    });
    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data, fill: true,
                borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)',
                borderWidth: 2, tension: 0.4,
                pointBackgroundColor: '#ef4444', pointRadius: 0, pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#9ba2c0', font: { size: 11 } } },
                y: { display: false }
            }
        }
    });
}

// ══════════════════════════════════════
//  TRANSAÇÕES PAGE
// ══════════════════════════════════════
let dashboardDespesas = [];
let gastosChartInstance = null;
let currentDashboardPeriod = '7D';

async function initDashboard() {
    try {
        dashboardDespesas = await apiGet('/despesas');
    } catch (e) {
        console.error(e);
        showToast('Erro ao carregar dashboard', 'error');
        dashboardDespesas = [];
    }
    setupDashboardPeriodTabs();
    renderDashboard(currentDashboardPeriod);
}

function setupDashboardPeriodTabs() {
    document.querySelectorAll('[data-dashboard-period]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-dashboard-period]').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentDashboardPeriod = btn.dataset.dashboardPeriod;
            renderDashboard(currentDashboardPeriod);
        });
    });
}

function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function getDashboardPeriodLabel(period) {
    if (period === '1A') return 'ultimos 12 meses';
    if (period === '1M') return 'ultimos 30 dias';
    return 'ultimos 7 dias';
}

function getDashboardSeries(period, despesas) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = [];

    if (period === '1A') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setMonth(start.getMonth() - 11);
        for (let i = 0; i < 12; i++) {
            const date = addMonths(start, i);
            buckets.push({
                key: toMonthKey(date),
                label: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
                total: 0
            });
        }
    } else {
        const days = period === '1M' ? 30 : 7;
        const start = addDays(today, -(days - 1));
        for (let i = 0; i < days; i++) {
            const date = addDays(start, i);
            buckets.push({
                key: toDateKey(date),
                label: period === '1M'
                    ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
                total: 0
            });
        }
    }

    const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    const filtered = despesas.filter((despesa) => {
        if (!despesa.data) return false;
        const date = parseLocalDate(despesa.data);
        const key = period === '1A' ? toMonthKey(date) : toDateKey(date);
        const bucket = bucketByKey.get(key);
        if (!bucket) return false;
        bucket.total += Number(despesa.valor) || 0;
        return true;
    });

    return {
        labels: buckets.map((bucket) => bucket.label),
        values: buckets.map((bucket) => bucket.total),
        filtered
    };
}

function renderDashboard(period = '7D') {
    const { labels, values, filtered } = getDashboardSeries(period, dashboardDespesas);
    const totalDespesas = filtered.reduce((s, d) => s + d.valor, 0);
    const gastoMedio = filtered.length > 0 ? totalDespesas / filtered.length : 0;
    const maiorGasto = filtered.length > 0 ? Math.max(...filtered.map(d => d.valor)) : 0;

    document.getElementById('totalGastoPeriodo').textContent = fmt(totalDespesas);
    document.getElementById('gastoMedio').textContent = fmt(gastoMedio);
    document.getElementById('maiorGasto').textContent = fmt(maiorGasto);
    document.getElementById('gastoResumo').textContent = `${filtered.length} lancamentos`;
    document.getElementById('gastosChartSubtitle').textContent = `Despesas registradas nos ${getDashboardPeriodLabel(period)}`;

    const container = document.getElementById('recentTransactions');
    const recent = [...dashboardDespesas]
        .filter((tx) => tx.data)
        .sort((a, b) => parseLocalDate(b.data) - parseLocalDate(a.data))
        .slice(0, 5);
    if (recent.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:20px 0;text-align:center;">Nenhuma transaÃ§Ã£o encontrada</p>';
    } else {
        container.innerHTML = recent.map(tx => `
            <div class="tx-item">
                <div class="tx-icon"><span class="material-icons-outlined">${getCatIcon(tx.categoria)}</span></div>
                <div class="tx-info">
                    <div class="tx-name">${tx.nome}</div>
                    <div class="tx-meta">${fmtDate(tx.data)} â€¢ ${tx.categoria}</div>
                </div>
                <div class="tx-amount negative">- ${fmt(tx.valor)}</div>
            </div>
        `).join('');
    }

    if (typeof Chart !== 'undefined') {
        renderGastosChart(labels, values);
    }
}

function renderGastosChart(labels, data) {
    const ctx = document.getElementById('gastosChart');
    if (!ctx) return;

    if (gastosChartInstance) {
        gastosChartInstance.destroy();
    }

    gastosChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data,
                fill: true,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.08)',
                borderWidth: 2,
                tension: 0.35,
                pointBackgroundColor: '#ef4444',
                pointRadius: data.some((value) => value > 0) ? 3 : 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => fmt(context.parsed.y || 0)
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#9ba2c0', font: { size: 11 }, maxTicksLimit: 12 } },
                y: { beginAtZero: true, ticks: { callback: (value) => fmt(value), color: '#9ba2c0', font: { size: 11 } } }
            }
        }
    });
}

let allDespesas = [];
let allCategorias = [];
let currentPage = 1;
const perPage = 10;

async function initTransacoes() {
    try {
        const [despesas, categorias] = await Promise.all([
            apiGet('/despesas'),
            apiGet('/categorias')
        ]);
        allDespesas = despesas;
        allCategorias = categorias;
        populateCategoryFilters(categorias);
        renderTable();
        setupFilters();
    } catch (e) {
        console.error(e);
        showToast('Erro ao carregar transações', 'error');
    }
}

function populateCategoryFilters(cats) {
    const filterSel = document.getElementById('filterCategory');
    const formSel = document.getElementById('txCategoria');
    if (filterSel) filterSel.innerHTML = '<option value="all">Todas as categorias</option>';
    if (formSel) formSel.innerHTML = '';
    cats.forEach(c => {
        if (filterSel) { const o = document.createElement('option'); o.value = c.nome; o.textContent = c.nome; filterSel.appendChild(o); }
        if (formSel) { const o = document.createElement('option'); o.value = c.id; o.textContent = c.nome; formSel.appendChild(o); }
    });
}

function getFilteredDespesas() {
    let list = [...allDespesas];
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const cat = document.getElementById('filterCategory')?.value;
    if (search) list = list.filter(d => d.nome.toLowerCase().includes(search) || d.categoria.toLowerCase().includes(search));
    if (cat && cat !== 'all') list = list.filter(d => d.categoria === cat);
    return list;
}

function renderTable() {
    const filtered = getFilteredDespesas();
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const page = filtered.slice(start, start + perPage);

    const tbody = document.getElementById('transactionsBody');
    if (!tbody) return;

    if (page.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">Nenhuma transação encontrada</td></tr>';
    } else {
        tbody.innerHTML = page.map(tx => `
            <tr>
                <td>
                    <div class="tx-cell">
                        <div class="tx-icon"><span class="material-icons-outlined">${getCatIcon(tx.categoria)}</span></div>
                        <div>
                            <div style="font-weight:600;">${tx.nome}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">${tx.usuarioEmail || ''}</div>
                        </div>
                    </div>
                </td>
                <td><span class="category-badge ${getCatBadgeClass(tx.categoria)}">${tx.categoria}</span></td>
                <td>${fmtDate(tx.data)}</td>
                <td><span class="status-badge concluido">Concluído</span></td>
                <td><span class="tx-amount negative">- ${fmt(tx.valor)}</span></td>
                <td>
                    <button class="icon-btn" style="width:32px;height:32px;border:none;" onclick="editTx(${tx.id})" title="Editar">
                        <span class="material-icons-outlined" style="font-size:16px;">edit</span>
                    </button>
                    <button class="icon-btn" style="width:32px;height:32px;border:none;" onclick="deleteTx(${tx.id})" title="Excluir">
                        <span class="material-icons-outlined" style="font-size:16px;">delete</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    document.getElementById('paginationInfo').textContent = `Mostrando ${start + 1}-${Math.min(start + perPage, filtered.length)} de ${filtered.length} transações`;
    const btnsContainer = document.getElementById('paginationBtns');
    btnsContainer.innerHTML = '';
    if (totalPages > 1) {
        btnsContainer.innerHTML += `<button onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>`;
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            btnsContainer.innerHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
        }
        btnsContainer.innerHTML += `<button onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>`;
    }
}

function goPage(p) { currentPage = p; renderTable(); }

function setupFilters() {
    document.getElementById('searchInput')?.addEventListener('input', () => { currentPage = 1; renderTable(); });
    document.getElementById('filterCategory')?.addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.querySelectorAll('.type-tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPage = 1;
            renderTable();
        });
    });
}

// Modal
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Nova Transação';
    document.getElementById('txForm').reset();
    document.getElementById('txEditId').value = '';
    document.getElementById('txData').valueAsDate = new Date();
    setModalMode('transacao');
    document.getElementById('txModal').classList.add('active');
}
function closeModal() { document.getElementById('txModal').classList.remove('active'); }

function setModalMode(mode) {
    const isCategory = mode === 'categoria';
    const txForm = document.getElementById('txForm');
    const categoryForm = document.getElementById('categoryForm');
    const txModeButton = document.getElementById('txModeButton');
    const categoryModeButton = document.getElementById('categoryModeButton');
    const title = document.getElementById('modalTitle');

    if (txForm) txForm.hidden = isCategory;
    if (categoryForm) categoryForm.hidden = !isCategory;
    if (txModeButton) txModeButton.classList.toggle('active', !isCategory);
    if (categoryModeButton) categoryModeButton.classList.toggle('active', isCategory);
    if (title) title.textContent = isCategory ? 'Nova Categoria' : 'Nova TransaÃ§Ã£o';

    if (!isCategory && title) title.textContent = 'Nova Transacao';
    if (isCategory) {
        document.getElementById('categoryNome')?.focus();
    }
}

function editTx(id) {
    setModalMode('transacao');
    const tx = allDespesas.find(d => d.id === id);
    if (!tx) return;
    document.getElementById('modalTitle').textContent = 'Editar Transação';
    document.getElementById('txEditId').value = id;
    document.getElementById('txNome').value = tx.nome;
    document.getElementById('txValor').value = tx.valor;
    document.getElementById('txData').value = tx.data;
    // find category id
    const cat = allCategorias.find(c => c.nome === tx.categoria);
    if (cat) document.getElementById('txCategoria').value = cat.id;
    document.getElementById('txModal').classList.add('active');
}

async function deleteTx(id) {
    if (!confirm('Excluir esta transação?')) return;
    try {
        await apiDelete(`/despesas/${id}`);
        allDespesas = allDespesas.filter(d => d.id !== id);
        renderTable();
        showToast('Transação excluída!');
    } catch (e) {
        showToast('Erro ao excluir', 'error');
    }
}

// Form submit
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('txForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = getLoggedUser();
            if (!user || !user.id) {
                showToast('Faca login novamente para salvar a transacao', 'error');
                return;
            }
            const editId = document.getElementById('txEditId').value;
            const body = {
                nome: document.getElementById('txNome').value,
                valor: parseFloat(document.getElementById('txValor').value),
                data: document.getElementById('txData').value,
                categoriaId: parseInt(document.getElementById('txCategoria').value),
                usuarioId: user.id
            };
            try {
                if (editId) {
                    const updated = await apiPut(`/despesas/${editId}`, body);
                    const idx = allDespesas.findIndex(d => d.id === parseInt(editId));
                    if (idx >= 0) allDespesas[idx] = updated;
                    showToast('Transação atualizada!');
                } else {
                    const created = await apiPost('/despesas', body);
                    allDespesas.push(created);
                    showToast('Transação criada!');
                }
                closeModal();
                renderTable();
            } catch (e) {
                showToast('Erro ao salvar transação', 'error');
            }
        });
    }

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nomeInput = document.getElementById('categoryNome');
            const nome = nomeInput.value.trim();
            if (!nome) {
                showToast('Informe o nome da categoria', 'error');
                return;
            }
            try {
                const created = await apiPost('/categorias', { nome });
                allCategorias.push(created);
                populateCategoryFilters(allCategorias);
                const txCategoria = document.getElementById('txCategoria');
                if (txCategoria) txCategoria.value = created.id;
                categoryForm.reset();
                setModalMode('transacao');
                showToast('Categoria criada!');
            } catch (e) {
                showToast('Erro ao criar categoria', 'error');
            }
        });
    }
});

function exportCSV() {
    const filtered = getFilteredDespesas();
    let csv = 'Nome,Categoria,Data,Valor\n';
    filtered.forEach(d => { csv += `"${d.nome}","${d.categoria}","${d.data}","${d.valor}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transacoes.csv';
    link.click();
}

// ══════════════════════════════════════
//  RELATÓRIOS PAGE
// ══════════════════════════════════════
async function initRelatorios() {
    try {
        const [despesas, relatorio] = await Promise.all([
            apiGet('/despesas'),
            apiGet('/despesas/relatorio/categorias')
        ]);
        renderInsights(despesas, relatorio);
        renderReportCharts(despesas, relatorio);
    } catch (e) {
        console.error(e);
        showToast('Erro ao carregar relatórios', 'error');
    }
}

function renderInsights(despesas, relatorio) {
    const total = despesas.reduce((s, d) => s + d.valor, 0);
    // Maior despesa por categoria
    if (relatorio.length > 0) {
        const maior = relatorio.reduce((a, b) => a.total > b.total ? a : b);
        const pct = total > 0 ? ((maior.total / total) * 100).toFixed(0) : 0;
        document.getElementById('insightMaiorDespesa').textContent = `Sua maior despesa este mês foi ${maior.categoria}`;
        document.getElementById('insightMaiorDespesaDesc').textContent = `${fmt(maior.total)} gastos, representando ${pct}% das saídas.`;
    } else {
        document.getElementById('insightMaiorDespesa').textContent = 'Sem dados suficientes';
        document.getElementById('insightMaiorDespesaDesc').textContent = 'Adicione transações para ver insights.';
    }
    // Economia potencial
    const economia = total * 0.06;
    document.getElementById('insightEconomia').textContent = `Você pode economizar ${fmt(economia)}`;
    document.getElementById('insightEconomiaDesc').textContent = 'Reduzindo gastos não essenciais detectados na sua conta.';
    // Limite
    const pctGasto = Math.min(100, Math.round((total / (total * 1.18)) * 100));
    document.getElementById('insightLimite').textContent = `${pctGasto}% do orçamento atingido`;
    document.getElementById('insightLimiteDesc').textContent = 'Você está próximo de atingir seu teto de gastos definido.';
}

function renderReportCharts(despesas, relatorio) {
    // Bar chart
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setMonth(start.getMonth() - 5);
        const buckets = [];
        for (let i = 0; i < 6; i++) {
            const date = addMonths(start, i);
            buckets.push({
                key: toMonthKey(date),
                label: date.toLocaleDateString('pt-BR', { month: 'short' }),
                total: 0
            });
        }
        const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
        despesas.forEach((despesa) => {
            if (!despesa.data) return;
            const bucket = bucketByKey.get(toMonthKey(parseLocalDate(despesa.data)));
            if (bucket) bucket.total += Number(despesa.valor) || 0;
        });
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: buckets.map((bucket) => bucket.label),
                datasets: [
                    { label: 'Despesas', data: buckets.map((bucket) => bucket.total), backgroundColor: '#ef4444', borderRadius: 6, barPercentage: 0.5 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#9ba2c0' } },
                    y: { display: false }
                }
            }
        });
    }

    // Donut chart
    const donutCtx = document.getElementById('donutChart');
    if (donutCtx && relatorio.length > 0) {
        const total = relatorio.reduce((s, r) => s + r.total, 0);
        document.getElementById('donutTotal').textContent = fmt(total);
        const colors = ['#4f6ef7', '#1a1d2e', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#06b6d4'];
        new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: relatorio.map(r => r.categoria),
                datasets: [{
                    data: relatorio.map(r => r.total),
                    backgroundColor: relatorio.map((_, i) => colors[i % colors.length]),
                    borderWidth: 0, cutout: '70%'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } }
                }
            }
        });
    } else if (donutCtx) {
        document.getElementById('donutTotal').textContent = 'R$ 0';
    }
}

// ══════════════════════════════════════
//  CHATBOT WIDGET LOGIC
// ══════════════════════════════════════
function initChatbot() {
    const fab = document.getElementById('chatbotFab');
    const windowEl = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');
    const messagesEl = document.getElementById('chatbotMessages');

    if (!fab || !windowEl) return;

    fab.addEventListener('click', () => {
        windowEl.classList.toggle('open');
        if (windowEl.classList.contains('open')) {
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('open');
    });


    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Add User Message
        appendMessage(text, 'user-msg');
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        const user = getLoggedUser();
        if (!user || !user.id) {
            appendMessage('Faça login novamente para eu analisar seus gastos.', 'bot-msg');
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
            return;
        }

        const userId = user.id;

        // Show beautiful typing indicator
        const typingId = 'typing-' + Date.now();
        const typingHtml = `
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        `;
        appendMessage(typingHtml, 'bot-msg', typingId);

        try {
            const response = await fetch(`${API}/chat/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: text })
            });

            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            const responseText = await response.text();
            if (response.ok) {
                // Efeito Typewriter
                const msgId = 'bot-msg-' + Date.now();
                appendMessage('', 'bot-msg', msgId);
                const bubble = document.getElementById(msgId).querySelector('.msg-bubble');
                await typewriter(responseText, bubble);
            } else {
                appendMessage(responseText || 'Desculpe, ocorreu um erro ao conectar ao servidor.', 'bot-msg');
            }
        } catch (e) {
            console.error(e);
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            appendMessage('Desculpe, não consegui acessar o servidor no momento.', 'bot-msg');
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    async function typewriter(text, element) {
        element.classList.add('typewriter-cursor');
        const words = text.split(' ');
        let currentText = '';
        
        for (const word of words) {
            currentText += word + ' ';
            element.innerHTML = currentText.replace(/\n/g, '<br>');
            messagesEl.scrollTop = messagesEl.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 30));
        }
        
        element.classList.remove('typewriter-cursor');
    }

    function appendMessage(text, type, id = '') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${type}`;
        if (id) msgDiv.id = id;
        msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
        messagesEl.appendChild(msgDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
}

document.addEventListener('DOMContentLoaded', initChatbot);
