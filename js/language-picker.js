(() => {
  function initLanguagePicker(select) {
    if (!select || select.dataset.pickerReady === '1') return;
    select.dataset.pickerReady = '1';
    const wrapper = document.createElement('div');
    wrapper.className = 'language-picker';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-picker-button';
    button.setAttribute('aria-expanded', 'false');
    wrapper.insertBefore(button, select);

    const menu = document.createElement('div');
    menu.className = 'language-picker-menu hidden';
    wrapper.appendChild(menu);

    const selected = () => [...select.options].filter(o => o.selected).map(o => o.value);
    const refreshLabel = () => {
      const values = selected();
      button.innerHTML = values.length
        ? `<span>${values.map(v => escapeHtml(v)).join(' • ')}</span><span class="language-picker-chevron">⌄</span>`
        : '<span class="muted">Select languages</span><span class="language-picker-chevron">⌄</span>';
    };

    const renderMenu = () => {
      menu.innerHTML = [...select.options].map(o => `
        <button type="button" class="language-option${o.selected ? ' selected' : ''}" data-value="${escapeHtml(o.value)}">
          <span>${escapeHtml(o.value)}</span><span class="language-check">${o.selected ? '✓' : ''}</span>
        </button>`).join('');
      menu.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
          const value = option.dataset.value;
          const target = [...select.options].find(o => o.value === value);
          if (!target) return;
          target.selected = !target.selected;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          renderMenu();
          refreshLabel();
        });
      });
    };

    button.addEventListener('click', () => {
      const open = !menu.classList.contains('hidden');
      document.querySelectorAll('.language-picker-menu').forEach(m => m.classList.add('hidden'));
      document.querySelectorAll('.language-picker-button').forEach(b => b.setAttribute('aria-expanded', 'false'));
      if (!open) {
        renderMenu();
        menu.classList.remove('hidden');
        button.setAttribute('aria-expanded', 'true');
      }
    });

    select.addEventListener('change', () => { renderMenu(); refreshLabel(); });
    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) {
        menu.classList.add('hidden');
        button.setAttribute('aria-expanded', 'false');
      }
    });

    refreshLabel();
    renderMenu();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  document.querySelectorAll('#driverLanguages, #driverLanguagesProfile').forEach(initLanguagePicker);
})();
