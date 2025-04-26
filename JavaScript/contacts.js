export let allContacts = [];

const avatarColors = [
  "#FF7A00",
  "#FF5C01",
  "#FFBB2E",
  "#0095FF",
  "#6E52FF",
  "#9327FF",
  "#00BEE8",
  "#1FD7C1",
  "#FF4646",
  "#FFC700",
  "#BEE800",
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

export async function fetchData() {
  let res = await fetch(
    "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/.json"
  );
  let data = await res.json();
  allContacts = Object.values(data.person || {});
  renderContacts();
  document.getElementById('new-contact').classList.remove('d_none');
}

function renderContacts() {
  const panel = document.getElementById("contactPanel");
  panel.innerHTML = "";
  allContacts.sort((a, b) => a.name.localeCompare(b.name));
  let grouped = groupByLetter(allContacts);
  for (let letter in grouped) {
    panel.innerHTML += `<div style="margin:20px 0 10px;font-weight:bold;">${letter}</div>`;
    grouped[letter].forEach((c) => {
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
    <div class="contact-list" onclick="toggleShowContact('${contact.name}')">
      <div class="avatar" style="background:${color}">${initials}</div>
      <div>
        <div><strong>${contact.name}</strong></div>
        <div style="font-size:12px;color:#0077cc;">${contact.email}</div>
      </div>
    </div>`;
}

let currentlyOpenContact = null;

export function toggleShowContact(name) {
  const allContactElements = document.querySelectorAll('.contact-list');

  // Entferne alle aktiven Klassen
  allContactElements.forEach(el => el.classList.remove('active'));

  if (currentlyOpenContact === name) {
    // Wenn derselbe Kontakt erneut angeklickt wird: schließen
    document.getElementById("overlay").innerHTML = "";
    currentlyOpenContact = null;
  } else {
    // Neuer Kontakt anzeigen und markieren
    showContact(name);
    currentlyOpenContact = name;

    // Markiere den aktiven Kontakt im Panel
    const contactElement = Array.from(allContactElements).find(el =>
      el.textContent.includes(name)
    );
    if (contactElement) {
      contactElement.classList.add('active');
    }
  }
}


function showContact(name) {
  let c = allContacts.find((c) => c.name === name);
  let overlay = document.getElementById("overlay");
  let initials = getInitials(c.name);
  let bg = getColorForName(c.name);
  overlay.innerHTML = `
    <div class="contact-info-box slide-in" style="display:flex;flex-direction:column;gap:20px;max-width:400px;">
      <div style="display:flex;align-items:center;gap:20px;">
        <div style="width:60px;height:60px;border-radius:50%;background:${bg};color:white;
        display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;">
        ${initials}</div>
        <div><h2 style="margin:0;">${c.name}</h2>
        <div style="display:flex;margin-top:5px;">
        <button onclick="editContact('${name}')" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:10px;">
          <img style="height:15px;width:15px;" src="./svg/edit-black.svg" alt="Edit" width="70">Edit
        </button>
        <button onclick="deleteContact('${name}')" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:10px;">
          <img style="height:15px;width:15px;" src="./svg/delete.svg" alt="Delete" width="70">Delete
        </button>
      </div>
        </div>
      </div>
      
      <div>
      <h3 style="font-weight:200";>Contact Information</h3>
      <br>
      <div>
        <p><strong>Email</strong></p><a href="mailto:${c.email}">${c.email}</a>
        </div>
        <div>
        <p><strong>Phone</strong></p>
        <p>${c.phone}</p>
        </div>
      </div>
    </div>`;
}

export function addContact() {
  const form = document.getElementById("addContactForm");
  const modal = document.getElementById("modalBackdrop");

  // Vorherigen Inhalt und Overlay zurücksetzen
  form.innerHTML = "";
  document.getElementById("overlay").innerHTML = "";
  modal.classList.remove("d_none");
  document.body.classList.add("modal-open");

  form.innerHTML = `
    <div class="add-contact-overlay">
      <div class="add-contact-left">
        <img src="./svg/Capa 1.svg" class="add-contact-logo">
        <h2>Add contact</h2>
        <p>Tasks are better with a team!</p>
        <div class="underline"></div>
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

        <div id="contactError" class="contact-error"></div> <!-- Hinweisbox -->

        <div class="add-contact-buttons">
          <button class="cancel-btn" onclick="closeOverlay()">Cancel <span>&times;</span></button>
          <button class="create-btn" onclick="saveContact()">Create contact <span>&check;</span></button>
        </div>
      </div>
    </div>
  `;
}

function editContact(name) {
  const contact = allContacts.find((c) => c.name === name);
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
            <input id="inputName" type="text" placeholder="Name" value="${
              contact.name
            }">
            <img src="./svg/person.svg" class="input-icon">
          </div>
          <div id="contactError" class="contact-error"></div>
          <div class="input-wrapper">
            <input id="inputEmail" type="email" placeholder="Email" value="${
              contact.email
            }">
            <img src="./svg/mail.svg" class="input-icon">
          </div>
          <div class="input-wrapper">
            <input id="inputPhone" type="tel" placeholder="Phone" value="${
              contact.phone || ""
            }">
            <img src="./svg/call.svg" class="input-icon">
          </div>
        </div>
          <div id="contactError" class="contact-error"></div>
        <div class="add-contact-buttons">
          <button class="cancel-btn" onclick="closeOverlay(); showContact('${name}');">Cancel <span>&times;</span></button>
          <button class="create-btn" onclick="updateContact('${
            contact.id || name
          }')">Save <span>&check;</span></button>
        </div>
      </div>
    </div>  
`;
}

async function saveContact() {
  const name = document.getElementById("inputName").value.trim();
  const email = document.getElementById("inputEmail").value.trim();
  const phone = document.getElementById("inputPhone").value.trim();
  const errorBox = document.getElementById("contactError");

  if (!name || !email || !phone) {
    errorBox.textContent = "❗ Alle drei Felder (Name, E-Mail, Telefonnummer) sind Pflicht!";
    errorBox.style.display = "block";

    // Fehler verschwindet nach 3 Sekunden
    setTimeout(() => {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    }, 3000);

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
  showSuccessMessage();
}


async function updateContact(name) {
  const inputName = document.getElementById("inputName").value.trim();
  const inputEmail = document.getElementById("inputEmail").value.trim();
  const inputPhone = document.getElementById("inputPhone").value.trim();
  const errorBox = document.getElementById("contactError");

  if (!inputName || !inputEmail || !inputPhone) {
    errorBox.textContent = "❗ Alle drei Felder (Name, E-Mail, Telefonnummer) sind Pflicht!";
    errorBox.style.display = "block";

    setTimeout(() => {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    }, 3000);

    return;
  }

  // Firebase laden
  const res = await fetch(
    "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json"
  );
  const data = await res.json();

  const entries = Object.entries(data || {});
  const match = entries.find(([_, value]) => value.name === name);

  if (!match) {
    alert("Kontakt wurde nicht gefunden.");
    return;
  }

  const [key] = match;

  const updatedContact = {
    name: inputName,
    email: inputEmail,
    phone: inputPhone,
  };

  await fetch(
    `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${key}.json`,
    {
      method: "PUT",
      body: JSON.stringify(updatedContact),
      headers: { "Content-Type": "application/json" },
    }
  );

  await fetchData();
  closeOverlay();
  showContact(inputName);
}


export function closeOverlay(event) {
  if (event && event.target.id !== "modalBackdrop") return;
  document.getElementById("modalBackdrop").classList.add("d_none");
  document.getElementById("addContactForm").innerHTML = "";
  document.getElementById("overlay").innerHTML = "";
  document.body.classList.remove("modal-open");
}

async function deleteContact(name) {
  // 1. Alle Daten aus Firebase laden
  const res = await fetch(
    "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json"
  );
  const data = await res.json();

  // 2. Einträge in ein Array umwandeln, um .find() zu verwenden
  const entries = Object.entries(data || {}); // [ [key, value], ... ]

  // 3. Den passenden Kontakt anhand des Namens finden
  const match = entries.find(([key, value]) => value.name === name);

  const [keyToDelete] = match;

  // 4. Lösche den Kontakt per DELETE
  await fetch(
    `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${keyToDelete}.json`,
    {
      method: "DELETE",
    }
  );

  

  // 5. Aktualisieren und Overlay schließen
  fetchData();
  closeOverlay();
}

function showSuccessMessage() {
  const toast = document.getElementById("successMessage");
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000); // nach 3 Sekunden ausblenden
}

document.addEventListener('DOMContentLoaded', fetchData);
