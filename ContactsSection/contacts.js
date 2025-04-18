let allContacts = [];
      console.log("Script wurde geladen");

      async function fetchData() {
        console.log("fetchData gestartet");
        let response = await fetch(
          "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/.json"
        );
        let data = await response.json();
        let contacts = Object.values(data.person); // Array aus dem Objekt machen
        allContacts=[];
        for (let index = 0; index < contacts.length; index++) {
            allContacts.push(contacts[index]);            
        }
        renderContacts();
      }

      function renderContacts() {
        const contactPanel = document.getElementById("contactPanel");
        contactPanel.innerHTML = "";

        // 1. Kontakte alphabetisch sortieren
        allContacts.sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });

        // 2. Gruppieren nach Anfangsbuchstaben (klassische Schleife)
        let grouped = {};
        for (let i = 0; i < allContacts.length; i++) {
          let contact = allContacts[i];
          let firstLetter = contact.name[0].toUpperCase();

          if (grouped[firstLetter] === undefined) {
            grouped[firstLetter] = [];
          }
          grouped[firstLetter].push(contact);
        }

        // 3. Rendern: erst Buchstabe, dann alle zugehörigen Kontakte
        let letters = Object.keys(grouped).sort();

        for (let i = 0; i < letters.length; i++) {
          let letter = letters[i];
          contactPanel.innerHTML += `
      <div style="margin: 20px 0 10px; font-weight: bold; border-bottom: 1px solid #ddd;">${letter}</div>
    `;

          let group = grouped[letter];
          for (let j = 0; j < group.length; j++) {
            let contact = group[j];
            let initials = getInitials(contact.name);
            let contactCard = contactCardTemplate(contact, initials);
            contactPanel.innerHTML += contactCard;
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
        let parts = name.trim().split(" "); // trim entfernt leerzeichen, split trennet vor und nachname
        let initials = parts[0][0]; // anfangsbuchstabe erstes wort
        if (parts.length > 1) initials += parts[1][0]; // anfangsbuchstabe der folgewörter
        return initials.toUpperCase();
      }


      
function showContact(name) {

    let contact = allContacts.find(her => her.name === name);
    
    let initials = getInitials(contact.name);
  
    let overlay = document.getElementById("overlay");
    overlay.innerHTML = `
    <div class="overlay-name">
      <div class="avatar avatar-big" style="width:60px; height:60px; font-size:20px;">${initials}</div>
      <div>
        <h2>${contact.name}</h2>
        <div class="action-icons">
          <span style="cursor:pointer;" onclick="editContact('${name}')">Edit</span>
          <span style="cursor:pointer;" onclick="deleteContact('${name}')">Delete</span>
        </div>
      </div>
    </div>

    <div class="contact-info" style="margin-top:20px;">
      <h4>Contact information</h4>
      <p><strong>Email</strong><br><a href="mailto:${contact.email}">${contact.email}</a></p>
      <p><strong>Phone</strong><br>${contact.phone}</p>
    </div>
  `;
}
      // 🟢 Hier einfach nur den Fetch starten

      function createContact() {
        const addContact = document.getElementById("addContactForm");
      
        addContact.innerHTML = `
          <div>
            <h2>Add contact</h2>
            <p>Tasks are better with a team!</p>
      
            <div>
              <input id="inputName" type="text" placeholder="Name">
            </div>
            <div>
              <input id="inputEmail" type="email" placeholder="Email">
            </div>
            <div>
              <input id="inputPhone" type="tel" placeholder="Phone">
            </div>
      
            <div>
              <button onclick="cancelContact()">Cancel</button>
              <button onclick="saveContact()">Create contact</button>
            </div>
          </div>
        `;
      }

      function addContact() {
        let addContact = document.getElementById("addContactForm");
        addContact.classList.remove("d_none");
      }
     
      async function saveContact() {
        const name = document.getElementById("inputName").value;
        const email = document.getElementById("inputEmail").value;
        const phone = document.getElementById("inputPhone").value;
      
        if (!name || !email) {
          alert("Name und Email sind Pflichtfelder!");
          return;
        }
      
        const newContact = {
          name: name,
          email: email,
          phone: phone
        };
      
        try {
          await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json", {
            method: "POST",
            body: JSON.stringify(newContact),
            headers: {
              "Content-Type": "application/json"
            }
          });
      
          console.log("Kontakt gespeichert:", newContact);
      
          // UI zurücksetzen oder schließen
          document.getElementById("inputName").value ="";
          document.getElementById("inputEmail").value="";
          document.getElementById("inputPhone").value="";
      
          // Liste neu laden
          fetchData();
      
        } catch (error) {
          console.error("Fehler beim Speichern:", error);
        }

        let addContact = document.getElementById("addContactForm");
        addContact.classList.add("d_none");
      }
      
      function cancelContact() {
        let addContact = document.getElementById("addContactForm");
        document.getElementById("inputName").value ="";
        document.getElementById("inputEmail").value="";
        document.getElementById("inputPhone").value="";
        addContact.classList.add("d_none");
      }
      
      createContact();
    