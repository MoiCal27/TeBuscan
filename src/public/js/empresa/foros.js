// ── HELPERS ────────────────────────────────────────────────────
window.toggleNuevaPub = () => {
    const panel = document.getElementById('panelNuevaPub');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};

window.selectCat = (btn) => {
    document.querySelectorAll('.foro-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.selectOrden = (btn) => {
    document.querySelectorAll('.foro-ordenar-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.selectEstado = (btn) => {
    document.querySelectorAll('.foro-estado-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.toggleRespuestas = (card) => {
    const panel = card.querySelector('.foro-respuestas-panel');
    if (!panel) return;
    const abierto = panel.style.display !== 'none';
    panel.style.display = abierto ? 'none' : 'block';
};