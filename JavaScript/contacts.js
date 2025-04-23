let allContacts = [];

const avatarColors = [
  "#FF7A00", "#FF5C01", "#FFBB2E", "#0095FF",
  "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1",
  "#FF4646", "#FFC700", "#BEE800"
];

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
  let initials = parts[0][0];
  if (parts.length > 1) initials += parts[1][0];
  return initials.toUpperCase();
}

async function fetchData() {
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/.json");
  let data = await res.json();
  allContacts = Object.values(data.person || {});
  renderContacts();
}

function renderContacts() {
  const panel = document.getElementById("contactPanel");
  panel.innerHTML = "";
  allContacts.sort((a, b) => a.name.localeCompare(b.name));
  let grouped = groupByLetter(allContacts);
  for (let letter in grouped) {
    panel.innerHTML += `<div style="margin:20px 0 10px;font-weight:bold;">${letter}</div>`;
    grouped[letter].forEach(c => {
      panel.innerHTML += contactCardTemplate(c, getInitials(c.name));
    });
  }
}

function groupByLetter(contacts) {
  let grouped = {};
  for (let c of contacts) {
    let letter = c.name[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(c);
  }
  return grouped;
}

function contactCardTemplate(contact, initials) {
  let color = getColorForName(contact.name);
  return `
    <div class="contact-list" onclick="showContact('${contact.name}')">
      <div class="avatar" style="background:${color}">${initials}</div>
      <div>
        <div><strong>${contact.name}</strong></div>
        <div style="font-size:12px;color:#0077cc;">${contact.email}</div>
      </div>
    </div>`;
}

function showContact(name) {
  let c = allContacts.find(c => c.name === name);
  let overlay = document.getElementById("overlay");
  let initials = getInitials(c.name);
  let bg = getColorForName(c.name);
  overlay.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:20px;max-width:400px;">
      <div style="display:flex;align-items:center;gap:20px;">
        <div style="width:60px;height:60px;border-radius:50%;background:${bg};color:white;
        display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;">
        ${initials}</div><h2 style="margin:0;">${c.name}</h2>
      </div>
      <div style="display:flex;justify-content:end;gap:15px; padding-right: 160px;">
        <button onclick="editContact('${name}')" style="background:none;border:none;cursor:pointer;">
          <img src="./svg/edit contacts.svg" alt="Edit" width="70">
        </button>
        <button onclick="deleteContact('${name}')" style="background:none;border:none;cursor:pointer;">
          <img src="./svg/Delete contact.svg" alt="Delete" width="70">
        </button>
      </div>
      <div>
      <h1><strong>Contact Information </strong></h1>
      <br>
        <p><strong>Email</strong><br><a href="mailto:${c.email}">${c.email}</a></p>
        <p><strong>Phone</strong><br>${c.phone}</p>
      </div>
    </div>`;
}

function addContact() {
  createContact();
}

function createContact() {
  const form = document.getElementById("addContactForm");
  const modal = document.getElementById("modalBackdrop");
  form.innerHTML = "";
  document.getElementById("overlay").innerHTML = "";
  modal.classList.remove("d_none");
  document.body.classList.add("modal-open");

  form.innerHTML = `
    <div class="add-contact-overlay">
      <div class="add-contact-left">
        <img src="./svg/Capa 1.svg" class="add-contact-logo"><h2>Add contact</h2>
        <p>Tasks are better with a team!</p><div class="underline"></div>
      </div>
      <div class="add-contact-right">
        <div class="add-contact-avatar"><img src="./svg/person.svg"></div>
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
    </div>`;
}

function editContact(name) {
  const contact = allContacts.find(c => c.name === name);
  const form = document.getElementById("addContactForm");
  const modal = document.getElementById("modalBackdrop");
  form.innerHTML = "";
  modal.classList.remove("d_none");
  document.body.classList.add("modal-open");

  form.innerHTML = `
    <div class="add-contact-overlay">
      <div class="add-contact-left">
        <img src="./svg/Capa 1.svg" class="add-contact-logo"><h2>Edit contact</h2>
        <div class="underline"></div>
      </div>
      <div class="add-contact-right">
        <div class="add-contact-avatar"><img src="./svg/person.svg"></div>
        <div class="add-contact-inputs">
          <div class="input-wrapper">
            <input id="inputName" type="text" placeholder="Name" value="${contact.name}">
            <img src="./svg/person.svg" class="input-icon">
          </div>
          <div class="input-wrapper">
            <input id="inputEmail" type="email" placeholder="Email" value="${contact.email}">
            <img src="./svg/mail.svg" class="input-icon">
          </div>
          <div class="input-wrapper">
            <input id="inputPhone" type="tel" placeholder="Phone" value="${contact.phone || ""}">
            <img src="./svg/call.svg" class="input-icon">
          </div>
        </div>
        <div class="add-contact-buttons">
          <button class="cancel-btn" onclick="closeOverlay(); showContact('${name}');">Cancel <span>&times;</span></button>
          <button class="create-btn" onclick="updateContact('${contact.id || name}')">Save changes <span>&check;</span></button>
        </div>
      </div>
    </div>`;
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
  await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json", {
    method: "POST",
    body: JSON.stringify(newContact),
    headers: { "Content-Type": "application/json" }
  });
  fetchData();
  closeOverlay();
}

async function updateContact(name) {
  const inputName = document.getElementById("inputName").value;
  const inputEmail = document.getElementById("inputEmail").value;
  const inputPhone = document.getElementById("inputPhone").value;

  if (!inputName || !inputEmail) {
    alert("Name und Email sind Pflichtfelder!");
    return;
  }

  // 1. Lade alle Daten aus Firebase
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();

  // 2. Suche den Key (Firebase-ID) des Kontakts mit dem Namen
  let foundKey = null;
  for (let key in data) {
    if (data[key].name === name) {
      foundKey = key;
      break;
    }
  }

  if (!foundKey) {
    alert("Kontakt wurde nicht gefunden.");
    return;
  }

  // 3. Neue Daten speichern (überschreiben)
  const updatedContact = {
    name: inputName,
    email: inputEmail,
    phone: inputPhone
  };

  await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${foundKey}.json`, {
    method: "PUT",
    body: JSON.stringify(updatedContact),
    headers: { "Content-Type": "application/json" }
  });

  fetchData(); // Aktualisiere Liste
}

function closeOverlay(event) {
  if (event && event.target.id !== "modalBackdrop") return;
  document.getElementById("modalBackdrop").classList.add("d_none");
  document.getElementById("addContactForm").innerHTML = "";
  document.getElementById("overlay").innerHTML = "";
  document.body.classList.remove("modal-open");
}


async function deleteContact(name) {

  // 1. Alle Daten aus Firebase laden
  const res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  const data = await res.json();

  // 2. Einträge in ein Array umwandeln, um .find() zu verwenden
  const entries = Object.entries(data || {}); // [ [key, value], ... ]

  // 3. Den passenden Kontakt anhand des Namens finden
  const match = entries.find(([key, value]) => value.name === name);

  const [keyToDelete] = match;

  // 4. Lösche den Kontakt per DELETE
  await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${keyToDelete}.json`, {
    method: "DELETE"
  });

  // 5. Aktualisieren und Overlay schließen
  fetchData();
  closeOverlay();
}


// function die mir das overlay beim schließen von edit wieder anzeigt