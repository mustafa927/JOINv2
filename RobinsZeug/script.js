window.addEventListener('load', () => {
  setTimeout(() => {
    const logo = document.getElementById('logo-container');
    logo.classList.add('shrink');

    // Jetzt Header, Form und Footer einblenden
    document.querySelector('header').classList.add('visible');
    document.querySelector('main').classList.add('visible');
    document.querySelector('footer').classList.add('visible');
  }, 1000); // Logo wartet 1 Sekunde, dann bewegt es sich UND Inhalte erscheinen
});
