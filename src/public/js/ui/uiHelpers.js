export function switchTab(tab) {
    document.querySelectorAll('.type-tab')
        .forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content-pane')
        .forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('pane-' + tab).classList.add('active');
}

export function switchProfileTab(tab, el) {
    document.querySelectorAll('.profile-tab')
        .forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane-content')
        .forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('pane-' + tab).classList.add('active');
}

export function togglePass(id, btn) {
    const inp = document.getElementById(id);
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    btn.innerHTML = isPass
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
}