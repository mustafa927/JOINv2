let allContacts = [];

console.log("Script wurde geladen");

async function fetchData() {
  console.log("fetchData gestartet");
  let response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/.json");
  let data = await response.json();
  let contacts = Object.values(data.person || {});
  allContacts = contacts;
  renderContacts();
}

function renderContacts() {
  const contactPanel = document.getElementById("contactPanel");
  contactPanel.innerHTML = "";

  allContacts.sort((a, b) => a.name.localeCompare(b.name));

  let grouped = {};
  for (let contact of allContacts) {
    let firstLetter = contact.name[0].toUpperCase();
    if (!grouped[firstLetter]) grouped[firstLetter] = [];
    grouped[firstLetter].push(contact);
  }

  let letters = Object.keys(grouped).sort();
  for (let letter of letters) {
    contactPanel.innerHTML += `
      <div style="margin: 20px 0 10px; font-weight: bold; border-bottom: 1px solid #ddd;">${letter}</div>
    `;
    for (let contact of grouped[letter]) {
      let initials = getInitials(contact.name);
      contactPanel.innerHTML += contactCardTemplate(contact, initials);
    }
  }
}

function contactCardTemplate(contact, initials) {
  return `
    <div class="contact-list" onclick="showContact('${contact.name}')">
      <div class="avatar">${initials}</div>
      <div>
        <div><strong>${contact.name}</strong></div>
        <div style="font-size: 12px; color: #0077cc;">${contact.email}</div>
      </div>
    </div>
  `;
}

function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  let initials = parts[0][0];
  if (parts.length > 1) initials += parts[1][0];
  return initials.toUpperCase();
}

function showContact(name) {
  let contact = allContacts.find(c => c.name === name);
  let overlay = document.getElementById("overlay");

  closeOverlay(); // sicherheitshalber zuerst alles schließen

  overlay.innerHTML = `
    <div class="contact-overlay-card">
      <img src="./img/j_emoji.png" alt="Avatar" class="contact-avatar-img">
      <h2 class="contact-name">${contact.name}</h2>
      <div class="contact-icons">
        <img src="./img/edit_icon.png" alt="Edit" onclick="editContact('${name}')">
        <img src="./img/delete_icon.png" alt="Delete" onclick="deleteContact('${name}')">
      </div>
      <div class="contact-details">
        <p><strong>Email</strong><br><a href="mailto:${contact.email}">${contact.email}</a></p>
        <p><strong>Phone</strong><br>${contact.phone}</p>
      </div>
    </div>
  `;

  document.getElementById("modalBackdrop").classList.add("d_none");
  document.getElementById("addContactForm").innerHTML = "";
  document.body.classList.remove("modal-open");
}

function addContact() {
  createContact();
}

function createContact() {
  const addContactForm = document.getElementById("addContactForm");
  const modalBackdrop = document.getElementById("modalBackdrop");

  document.getElementById("overlay").innerHTML = "";
  addContactForm.innerHTML = "";

  modalBackdrop.classList.remove("d_none");
  document.body.classList.add("modal-open");

  addContactForm.innerHTML = `
    <div class="add-contact-overlay">
      <div class="add-contact-left">
        <img src="./svg/Capa 1.svg" class="add-contact-logo" alt="Join Logo">
        <h2>Add contact</h2>
        <p>Tasks are better with a team!</p>
        <div class="underline"></div>
      </div>
      <div class="add-contact-right">
        <div class="add-contact-avatar">
          <img src="./svg/person.svg" alt="Avatar">
        </div>
        <div class="add-contact-inputs">
          <div class="input-wrapper">
            <input id="inputName" type="text" placeholder="Name">
            <img src="./svg/person.svg" class="input-icon">
          </div>
          <div class="input-wrapper">
            <input id="inputEmail" type="email" placeholder="Email">
            <img src="./svg/mail.svg" class="input-icon">
          </div>
          <div class="input-wrapper">
            <input id="inputPhone" type="tel" placeholder="Phone">
            <img src="./svg/call.svg" class="input-icon">
          </div>
        </div>
        <div class="add-contact-buttons">
          <button class="cancel-btn" onclick="closeOverlay()">Cancel <span>&times;</span></button>
          <button class="create-btn" onclick="saveContact()">Create contact <span>&check;</span></button>
        </div>
      </div>
    </div>
  `;
}

async function saveContact() {
  const name = document.getElementById("inputName").value;
  const email = document.getElementById("inputEmail").value;
  const phone = document.getElementById("inputPhone").value;

  if (!name || !email) {
    alert("Name und Email sind Pflichtfelder!");
    return;
  }

  const newContact = { name, email, phone };

  try {
    await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json", {
      method: "POST",
      body: JSON.stringify(newContact),
      headers: { "Content-Type": "application/json" }
    });
    console.log("Kontakt gespeichert:", newContact);
    fetchData();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }

  closeOverlay();
}

function closeOverlay(event) {
  // Modal schließen
  if (event && event.target.id !== "modalBackdrop") return;

  document.getElementById("modalBackdrop").classList.add("d_none");
  document.getElementById("addContactForm").innerHTML = "";
  document.getElementById("overlay").innerHTML = "";
  document.body.classList.remove("modal-open");
}

document.addEventListener("click", function (event) {
  const overlayCard = document.querySelector(".contact-overlay-card");
  const overlay = document.getElementById("overlay");

  if (overlayCard && !overlayCard.contains(event.target)) {
    overlay.innerHTML = "";
  }
});
