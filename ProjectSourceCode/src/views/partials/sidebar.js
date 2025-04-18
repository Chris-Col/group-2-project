const openBtn = document.getElementById('openSidebarBtn');
const closeBtn = document.getElementById('closeSidebarBtn');
const overlay = document.getElementById('sidebarOverlay');
const panel = document.getElementById('sidebarPanel');

openBtn.addEventListener('click', () => {
  overlay.classList.add('show');
  panel.classList.add('show');
});

closeBtn.addEventListener('click', () => {
  overlay.classList.remove('show');
  panel.classList.remove('show');
});

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    overlay.classList.remove('show');
    panel.classList.remove('show');
  }
});

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function changeUsername() {
  const newUsername = prompt("Enter new username:");
  if (newUsername) {
    alert(`Username changed to ${newUsername}!`);
  }
}

function changePassword() {
  const newPassword = prompt("Enter new password:");
  if (newPassword) {
    alert("Password changed!");
  }
}