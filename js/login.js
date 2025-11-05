// Login functionality
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        // Redirect to the dashboard
        window.location = 'index.html';
    } catch (error) {
        document.getElementById('errorMessage').innerText = error.message;
    }
});