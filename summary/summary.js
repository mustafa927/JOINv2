function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
  }
  
  document.addEventListener("click", function (e) {
    const profile = document.querySelector(".profile-wrapper");
    if (!profile.contains(e.target)) {
      document.getElementById("dropdownMenu").classList.remove("show");
    }
  });