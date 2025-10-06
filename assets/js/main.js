document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Image loading script initialized');
    
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const placeholders = document.querySelectorAll(
        '.image-placeholder[data-filename], .logo-placeholder[data-filename]'
    );

    console.log(`📋 Found ${placeholders.length} image placeholders to process`);

    const imageStats = {
        total: placeholders.length,
        loaded: 0,
        failed: 0,
        pending: placeholders.length
    };

    placeholders.forEach((placeholder, index) => {
        const filename = placeholder.dataset.filename;
        if (!filename) {
            console.warn(`⚠️  Placeholder #${index} has no filename attribute`, placeholder);
            imageStats.pending--;
            return;
        }

        const fallbackContent = placeholder.innerHTML;
        const isLogo = placeholder.classList.contains('logo-placeholder');
        const label = placeholder.dataset.label || placeholder.textContent.trim();
        const altText = isLogo ? 'Borscht of Energy logo' : label || '';
        const imagePath = `assets/images/${filename}`;

        console.log(`🔄 [${index + 1}/${placeholders.length}] Loading: ${imagePath}`, {
            label: label || '(no label)',
            isLogo,
            placeholder
        });

        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';  // Changed from lazy to ensure load event fires
        img.alt = altText;

        img.addEventListener('load', () => {
            imageStats.loaded++;
            imageStats.pending--;
            console.log(`✅ Loaded: ${imagePath}`, {
                dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
                stats: `${imageStats.loaded} loaded, ${imageStats.failed} failed, ${imageStats.pending} pending`
            });
            placeholder.innerHTML = '';
            placeholder.appendChild(img);
            placeholder.classList.add('has-image');
        });

        img.addEventListener('error', (e) => {
            imageStats.failed++;
            imageStats.pending--;
            console.error(`❌ Failed to load: ${imagePath}`, {
                label: label || '(no label)',
                error: e,
                stats: `${imageStats.loaded} loaded, ${imageStats.failed} failed, ${imageStats.pending} pending`
            });
            placeholder.classList.remove('has-image');
            placeholder.innerHTML = fallbackContent;
        });

        img.src = imagePath;
    });

    // Summary after a short delay to let images attempt to load
    setTimeout(() => {
        console.log('📊 Image Loading Summary:', imageStats);
        if (imageStats.failed > 0) {
            console.warn(`⚠️  ${imageStats.failed} image(s) failed to load. Check the errors above for details.`);
        }
    }, 2000);
});
