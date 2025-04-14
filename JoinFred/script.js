window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('logo-container').classList.add('shrink');
    document.querySelector('header').classList.add('visible');
    document.querySelector('main').classList.add('visible');
    document.querySelector('footer').classList.add('visible');
  }, 1000);

  const passwordInput = document.getElementById('password-input');
  const lockIcon = document.getElementById('lock-icon');
  const eyeIcon = document.getElementById('eye-icon');

  passwordInput.addEventListener('focus', () => {
    lockIcon.style.display = 'none';
    eyeIcon.style.display = 'inline';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  });

  passwordInput.addEventListener('blur', () => {
    if (passwordInput.value === '') {
      eyeIcon.style.display = 'none';
      lockIcon.style.display = 'inline';
      passwordInput.type = 'password';
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  });

  eyeIcon.addEventListener('click', () => {
    const currentlyClosed = eyeIcon.classList.contains('fa-eye-slash');

    if (currentlyClosed) {
      passwordInput.type = 'text';
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    } else {
      passwordInput.type = 'password';
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    }
  });
});
