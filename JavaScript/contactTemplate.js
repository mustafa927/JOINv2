function contactCardTemplate(contact, initials) {
    const color = getColorForName(contact.name);
    return `
      <div class="contact-list" onclick="toggleShowContact('${contact.name}')">
        <div class="avatar" style="background:${color}">${initials}</div>
        <div class="contact-name">
          <div><strong>${contact.name}</strong></div>
          <div class="contact-email">${contact.email}</div>
        </div>
      </div>`;
  }
  
  function contactGroupTemplate(letter) {
    return `<div class="contact-group-letter">${letter}</div>`;

  }
  
  function contactDetailTemplate(contact) {
    const initials = getInitials(contact.name);
    const bg = getColorForName(contact.name);
    return `
    <div class="contact-responsive-header">
      <div><h1>Contacts</h1>
      <span class="header-infoline">Better with a team
      </div>
      <div class="arrow-back" onclick="closeOverlayDirectly()"> &#8592;</div>
      </div>
      <div class="contact-info-box slide-in" >
        <div style="display:flex;align-items:center;gap:20px;">
          <div class="edit-contact-avatar" style="background:${bg};">
          ${initials}</div>
          <div><h2 style="margin:0;">${contact.name}</h2>
          <div style="display:flex;margin-top:5px;">
          <button onclick="editContact('${contact.name}')" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:10px;">
            <img style="height:15px;width:15px;" src="./svg/edit-black.svg" alt="Edit">Edit
          </button>
          <button onclick="deleteContact('${contact.name}')" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:10px;">
            <img style="height:15px;width:15px;" src="./svg/delete.svg" alt="Delete">Delete
          </button>
          </div>
          </div>
        </div>
        <div>
          <h3 style="font-weight:200;">Contact Information</h3><br>
          <p><strong>Email</strong></p><a href="mailto:${contact.email}">${contact.email}</a>
          <p><strong>Phone</strong></p><p>${contact.phone}</p>
        </div>
      </div>`;
  }
  
  function contactAddFormTemplate() {
    return `
      <div class="add-contact-overlay">
        <div class="add-contact-left">
          <img src="./svg/Capa 1.svg" class="add-contact-logo">
          <h2>Add contact</h2>
          <p>Tasks are better with a team!</p>
          <div class="underline"></div>
        </div>
        <div class="add-contact-right">
          <img id="contactImage" src="./svg/person.svg" class="profile-responsive-middle" alt="Contact Icon">
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
          <div id="contactError" class="contact-error"></div>
          <div class="add-contact-buttons">
            <button class="cancel-btn" onclick="closeOverlay()">Cancel <span>&times;</span></button>
            <button class="create-btn" onclick="saveContact()">Create contact <span>&check;</span></button>
          </div>
        </div>
      </div>`;
  }
  
  function contactEditFormTemplate(contact) {
    return `
      <div class="add-contact-overlay" style="position: relative;">
        <div style="position:absolute; top:20px; right:20px; cursor:pointer; font-size:24px;" onclick="closeOverlayDirectly()">&times;</div>
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
            <div id="contactError" class="contact-error"></div>
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
            <button class="cancel-btn" onclick="deleteContact('${contact.name}');">Delete <span>&times;</span></button>
            <button class="create-btn" onclick="updateContact('${contact.id || contact.name}')">Save <span>&check;</span></button>
          </div>
        </div>
      </div>`;
  }
  