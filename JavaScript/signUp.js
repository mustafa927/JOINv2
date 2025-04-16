// In deiner bestehenden JavaScript-Datei oder im <script>-Tag
document.querySelector('.signup-button').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'signUp.html'; // oder per AJAX laden
});