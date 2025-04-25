document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('darkModeToggle');
    const disabledPaths = ['/register', '/', '/login'];
    const isDarkModePreferred = localStorage.getItem('darkMode') === 'true';
    const isDarkModeAllowed = !disabledPaths.includes(window.location.pathname);
  
    if (isDarkModeAllowed && isDarkModePreferred) {
      document.body.classList.add('dark-mode');
      if (toggle) toggle.checked = true;
    }
  
    if (!isDarkModeAllowed && toggle) {
      toggle.style.display = 'none'; // hide the toggle if it's not meant for this page
    }

    if (toggle) {
        // Save the user's preferred state
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            toggle.checked = true; 
        } else {
            document.body.classList.remove('dark-mode'); // light mode
            toggle.checked = false;
        }

        toggle.addEventListener('change', function () {
            if (toggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }

    // function changeUsername() {
    //   const newUsername = prompt("Enter new username:");
    //   if (newUsername) {
    //     alert(`Username changed to ${newUsername}!`);
    //   }
    // }

    // function changePassword() {
    //   const newPassword = prompt("Enter new password:");
    //   if (newPassword) {
    //     alert("Password changed!");
    //   }
    // }


});