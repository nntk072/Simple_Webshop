/**
 * TODO: 8.4 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */
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
