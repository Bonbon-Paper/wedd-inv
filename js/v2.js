((w, d) => {
    const raw = w.location.search.split('to=');
    let name = null;

    if (raw.length > 1 && raw[1].length >= 1) {
        name = w.decodeURIComponent(raw[1]);
    }

    const overlay = d.getElementById('guest-name');
    if (overlay && name) {
        overlay.textContent = name;
    }
})(window, document);
