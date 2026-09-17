const registrationFields = ['driverName','driverVehicle','driverCarModel','driverCarColor','driverPlate','driverSelfie','driverCarPhoto','driverLanguages'];

function setupDriverAuthUI() {
  const panel = document.querySelector('#driverAuth');
  const loginButton = document.querySelector('#driverLogin');
  const signupButton = document.querySelector('#driverSignup');
  if (!panel || !loginButton || !signupButton) return false;

  let switchButton = document.querySelector('#driverAuthSwitch');
  if (!switchButton) {
    switchButton = document.createElement('button');
    switchButton.id = 'driverAuthSwitch';
    switchButton.type = 'button';
    switchButton.className = 'link';
    panel.appendChild(switchButton);
  }

  let title = panel.querySelector('h3');
  let description = panel.querySelector('.muted');

  const setMode = mode => {
    const registering = mode === 'register';
    title.textContent = registering ? 'Driver registration' : 'Driver sign in';
    description.textContent = registering
      ? 'Create your driver account and add your vehicle details and photos.'
      : 'Sign in with your driver email and password to view matched jobs and manage your profile.';

    registrationFields.forEach(id => {
      const input = document.querySelector('#' + id);
      if (input?.closest('label')) input.closest('label').classList.toggle('hidden', !registering);
    });

    const languageHint = [...panel.querySelectorAll('.muted')].find(el => el !== description && el.textContent.includes('language field'));
    const photoHint = [...panel.querySelectorAll('.muted')].find(el => el !== description && el.textContent.includes('Photos are compressed'));
    if (languageHint) languageHint.classList.toggle('hidden', !registering);
    if (photoHint) photoHint.classList.toggle('hidden', !registering);

    signupButton.classList.toggle('hidden', !registering);
    loginButton.classList.toggle('hidden', registering);
    switchButton.textContent = registering ? 'Already have a driver account? Sign in' : 'New driver? Create an account';
  };

  switchButton.onclick = () => setMode(switchButton.textContent.startsWith('Already') ? 'login' : 'register');
  setMode('login');
  return true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDriverAuthUI, { once: true });
} else {
  setupDriverAuthUI();
}
