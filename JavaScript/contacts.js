let allContacts = [];
let avatarColors = [
  "#FF7A00", "#FF5C01", "#FFBB2E", "#0095FF", "#6E52FF", "#9327FF",
  "#00BEE8", "#1FD7C1", "#FF4646", "#FFC700", "#BEE800"
];
let currentlyOpenContact = null;


let justOpenedMenu = false;


function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash % avatarColors.length)];
}

function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

async function fetchData() {
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/.json");
  let data = await res.json();
  allContacts = Object.values(data.person || {});
  renderContacts();
  document.getElementById('new-contact').classList.remove('d_none');
}

function renderContacts() {
  let panel = document.getElementById("contactPanel");
  panel.innerHTML = "";

  allContacts.sort((a, b) => a.name.localeCompare(b.name));
  let grouped = groupByLetter(allContacts);

  for (let letter in grouped) {
    panel.innerHTML += contactGroupTemplate(letter);
    grouped[letter].forEach(c => {
      panel.innerHTML += contactCardTemplate(c, getInitials(c.name));
    });
  }
}

function groupByLetter(contacts) {
  let grouped = {};
  for (let c of contacts) {
    let letter = c.name[0].toUpperCase();
    grouped[letter] = grouped[letter] || [];
    grouped[letter].push(c);
  }
  return grouped;
}

function toggleShowContact(name) {
  let allContactElements = document.querySelectorAll('.contact-list');
  allContactElements.forEach(el => el.classList.remove('active'));

  if (window.innerWidth < 768) {
    toggleShowContactMobile(name);
    return;
  }

  if (currentlyOpenContact === name) {
    closeContactOverlay();
  } else {
    showContact(name);
    currentlyOpenContact = name;

    let contactElement = Array.from(allContactElements).find(el =>
      el.textContent.includes(name)
    );
    if (contactElement) contactElement.classList.add('active');
  }
}

function closeContactOverlay() {
  document.getElementById("overlay").innerHTML = "";
  currentlyOpenContact = null;
}

function showContact(name) {
  let contact = allContacts.find(c => c.name === name);
  let overlay = document.getElementById("overlay");
  overlay.innerHTML = contactDetailTemplate(contact);
}

function addContact() {
  clearOverlay();
  openModal("modalBackdrop");
  document.getElementById("addContactForm").innerHTML = contactAddFormTemplate();

  let contactImage = document.getElementById("contactImage");
  if (window.innerWidth <= 768) {
    contactImage.src = "./svg/AddContactProfile.svg";
  } else {
    contactImage.src = "./svg/person.svg";
  }
}

function editContact(name) {
  let contact = allContacts.find(c => c.name === name);
  clearOverlay();
  openModal("modalBackdrop");
  document.getElementById("addContactForm").innerHTML = contactEditFormTemplate(contact);
}

async function saveContact() {
  let { name, email, phone } = getInputValues();
  let errorBox = document.getElementById("contactError");

  if (!name || !email || !phone) return showFormError(errorBox);

  let newContact = { name, email, phone };

  await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json", {
    method: "POST",
    body: JSON.stringify(newContact),
    headers: { "Content-Type": "application/json" }
  });

  fetchData();
  closeOverlay();
  showSuccessMessage();
}

function getInputValues() {
  return {
    name: document.getElementById("inputName").value.trim(),
    email: document.getElementById("inputEmail").value.trim(),
    phone: document.getElementById("inputPhone").value.trim()
  };
}

function showFormError(errorBox) {
  errorBox.textContent = "❗ Alle drei Felder (Name, E-Mail, Telefonnummer) sind Pflicht!";
  errorBox.style.display = "block";
  setTimeout(() => {
    errorBox.style.display = "none";
    errorBox.textContent = "";
  }, 3000);
}

async function updateContact(name) {
  let { name: newName, email, phone } = getInputValues();
  let errorBox = document.getElementById("contactError");

  if (!newName || !email || !phone) return showFormError(errorBox);

  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();

  let [key] = Object.entries(data || {}).find(([_, val]) => val.name === name) || [];

  if (!key) return alert("Kontakt wurde nicht gefunden.");

  await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${key}.json`, {
    method: "PUT",
    body: JSON.stringify({ name: newName, email, phone }),
    headers: { "Content-Type": "application/json" }
  });

  await fetchData();
  closeOverlay();
  showContact(newName);
}

async function deleteContact(name) {
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();
  let [key] = Object.entries(data || {}).find(([_, val]) => val.name === name) || [];

  if (!key) return;

  await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${key}.json`, {
    method: "DELETE"
  });

  closeContactOverlay();
  fetchData();
  closeOverlay();
}

function closeOverlay(event) {
  if (event && event.target.id !== "modalBackdrop") return;
  clearOverlay();
  closeModal("modalBackdrop");
}

function closeOverlayDirectly() {
  clearOverlay();
  closeModal("modalBackdrop");
}

function clearOverlay() {
  document.getElementById("addContactForm").innerHTML = "";
  document.getElementById("overlay").innerHTML = "";
}

function openModal(id) {
  document.getElementById(id).classList.remove("d_none");
  document.body.classList.add("modal-open");
}

function closeModal(id) {
  document.getElementById(id).classList.add("d_none");
  document.body.classList.remove("modal-open");
}

function showSuccessMessage() {
  let toast = document.getElementById("successMessage");
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

function toggleShowContactMobile(name) {
  let contact = allContacts.find(c => c.name === name);
  if (!contact) return;

  currentlyOpenContact = name; // <- HINZUGEFÜGT!

  document.getElementById("addContactForm").innerHTML = contactDetailTemplate(contact);
  openModal("modalBackdrop");
}

function toggleContactMenu() {
  const menu = document.getElementById("contactMenu");

  console.log("[toggle] clicked toggle icon");
  console.log("[toggle] menu currently:", menu?.style.display);

  if (menu.style.display === "flex") {
    menu.style.display = "none";
    menu.style.animation = "";
    console.log("[toggle] → closed");
  } else {
    menu.style.display = "flex";
    menu.style.animation = "slideInFromRight 0.6s ease-out forwards";
    console.log("[toggle] → opened");
  }
}



window.addEventListener("resize", function () {
  let backdrop = document.getElementById("modalBackdrop");
  let addContactForm = document.getElementById("addContactForm");

  let isMobileContactOpen =
    backdrop &&
    backdrop.style.display !== "none" &&
    addContactForm.innerHTML.includes("contact-info-box");

  if (isMobileContactOpen && window.innerWidth > 768) {
    closeOverlayDirectly();
    if (currentlyOpenContact) {
      showContact(currentlyOpenContact);
    }
  }
});


function showSuccessImage() {
  let imageBox = document.getElementById("contactCreatedImage");
  imageBox.classList.remove("d_none");

  setTimeout(() => {
    imageBox.classList.add("d_none");
  }, 3000);
}

document.addEventListener("click", function (event) {
  const form = document.getElementById("addContactForm");
  const menu = document.getElementById("contactMenu");
  const toggle = document.getElementById("menu-contact-options");

  if (!form || !menu || !toggle) return;

  const clickedInsideForm = form.contains(event.target);
  const menuIsVisible = menu.style.display === "flex";
  const clickedOnToggle = toggle.contains(event.target);

  if (clickedInsideForm && menuIsVisible && !clickedOnToggle) {
    console.log("✅ Click inside form, menu open, NOT toggle → toggling menu");
    toggleContactMenu();
  } else if (clickedOnToggle) {
    console.log("🟡 Clicked toggle icon → allow native toggle");
  }
}, true);
