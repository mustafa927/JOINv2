<<<<<<< Updated upstream
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
=======
const user = {
    firstName: "",
    lastName: "",
    todo: null,
    done: null,
    urgent: null,
    deadline: null,
    inBoard: null,
    inProgress: null,
    awaiting: null
  };
  
  function loadUserData(user) {
    const initials = (user.firstName && user.lastName)
      ? user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()
      : '--';
  
    document.getElementById('userInitials').innerText = initials;
    document.getElementById('userName').innerText = user.firstName + " " + user.lastName;
  
    document.getElementById('todoCount').innerText = user.todo ?? '-';
    document.getElementById('doneCount').innerText = user.done ?? '-';
    document.getElementById('urgentCount').innerText = user.urgent ?? '-';
    document.getElementById('deadlineDate').innerText = user.deadline ?? '-';
    document.getElementById('taskBoardCount').innerText = user.inBoard ?? '-';
    document.getElementById('taskProgressCount').innerText = user.inProgress ?? '-';
    document.getElementById('awaitingFeedbackCount').innerText = user.awaiting ?? '-';
  }
  
  // Initial leer laden
  loadUserData(user);
  
>>>>>>> Stashed changes
