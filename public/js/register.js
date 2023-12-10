document.querySelector('#register-form').addEventListener('submit', e => {
    e.preventDefault();
    const form = document.querySelector('#register-form');
    const password = form.elements.password.value;
    const passwordConfirmation = form.elements.passwordConfirmation.value;

    if (password !== passwordConfirmation) {
        createNotification('Passwords do not match', 'notifications-container', false);
    }
    else {
        const user = {
            name: form.elements.name.value,
            email: form.elements.email.value,
            password: password
        };
        postOrPutJSON('/api/register', 'POST', user);
    }
    form.reset();
});
