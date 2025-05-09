document.addEventListener('DOMContentLoaded', () => {
    const fields = [
        {
            input: document.getElementById('password'),
            toggle: document.getElementById('togglePassword'),
            lock: document.getElementById('lockIconPassword')
        },
        {
            input: document.getElementById('confirmPassword'),
            toggle: document.getElementById('toggleConfirmPassword'),
            lock: document.getElementById('lockIconConfirm')
        }
    ];

    const lookOn = 'svg/visibility_off.svg';
    const lookOff = 'svg/visibility.svg';

    fields.forEach(field => setupPasswordField(field, lookOn, lookOff));
});

function setupPasswordField(field, lookOn, lookOff) {
    if (field.input && field.toggle && field.lock) {
        field.input.addEventListener('input', () => handleInput(field, lookOn));
        field.toggle.addEventListener('click', () => togglePassword(field, lookOn, lookOff));
        initialIconState(field, lookOn);
    }
}

function handleInput(field, lookOn) {
    if (field.input.value.length > 0) {
        field.toggle.style.display = 'block';
        field.lock.style.visibility = 'hidden';
    } else {
        resetField(field, lookOn);
    }
}

function togglePassword(field, lookOn, lookOff) {
    if (field.input.type === 'password') {
        field.input.type = 'text';
        field.toggle.src = lookOff;
    } else {
        field.input.type = 'password';
        field.toggle.src = lookOn;
    }
}

function initialIconState(field, lookOn) {
    if (field.input.value.length > 0) {
        field.toggle.style.display = 'block';
        field.lock.style.visibility = 'hidden';
    } else {
        resetField(field, lookOn);
    }
}

function resetField(field, lookOn) {
    field.toggle.style.display = 'none';
    field.lock.style.visibility = 'visible';
    field.input.type = 'password';
    field.toggle.src = lookOn;
}