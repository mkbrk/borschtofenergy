document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const placeholders = document.querySelectorAll(
        '.image-placeholder[data-filename], .logo-placeholder[data-filename]'
    );

    placeholders.forEach((placeholder) => {
        const filename = placeholder.dataset.filename;
        if (!filename) {
            return;
        }

        const fallbackContent = placeholder.innerHTML;
        const isLogo = placeholder.classList.contains('logo-placeholder');
        const label = placeholder.dataset.label || placeholder.textContent.trim();
        const altText = isLogo ? 'Borscht of Energy logo' : label || '';

        const img = new Image();
        img.decoding = 'async';
        img.loading = placeholder.closest('.hero') ? 'eager' : 'lazy';
        img.alt = altText;

        img.addEventListener('load', () => {
            placeholder.innerHTML = '';
            placeholder.appendChild(img);
            placeholder.classList.add('has-image');
        });

        img.addEventListener('error', () => {
            placeholder.classList.remove('has-image');
            placeholder.innerHTML = fallbackContent;
        });

        img.src = `assets/images/${filename}`;
    });
});
