// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyA0HOwbwQ23fNa1ixBwhQNIzyjVNt2H7-0",
    authDomain: "virtual-lab-gajah.firebaseapp.com",
    projectId: "virtual-lab-gajah",
    storageBucket: "virtual-lab-gajah.firebasestorage.app",
    messagingSenderId: "339466008423",
    appId: "1:339466008423:web:91c9e26644a1ea599161c2",
    measurementId: "G-CGCQQG2C0S"
  };

firebase.initializeApp(firebaseConfig);

// Auth Module
const auth = {
    ui: new firebaseui.auth.AuthUI(firebase.auth()),
    
    init() {
        this.ui.start('#firebaseui-auth', {
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                signInSuccessWithAuthResult: () => {
                    this.hideLogin();
                    document.getElementById('app-content').style.display = 'block';
                    return false;
                }
            }
        });

        firebase.auth().onAuthStateChanged(user => {
            document.getElementById('app-content').style.display = user ? 'block' : 'block'//! UBAH JADI NONE;
        });
    },

    showLogin() {
        document.getElementById('auth-container').style.display = 'flex';
    },

    hideLogin() {
        document.getElementById('auth-container').style.display = 'none';
    },

    logout() {
        firebase.auth().signOut();
    }
};

// Simulation Module
const simulation = {
    canvas: null,
    ctx: null,
    boat: { x: 50, y: 500, width: 50, height: 30 },
    river: { flow: 1.5 },
    animation: null,

    init() {
        this.canvas = document.getElementById('simulation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.draw();
        
        document.getElementById('boat-speed').addEventListener('input', (e) => {
            document.getElementById('speed-value').textContent = `${e.target.value} m/s`;
        });
    },

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw river
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = 'blue';
        ctx.fillRect(100, 100, 950, 600);

        // Draw boat
        ctx.fillStyle = 'red';
        ctx.fillRect(this.boat.x, this.boat.y, this.boat.width, this.boat.height);

        // Draw target
        ctx.fillStyle = 'green';
        ctx.fillRect(950, 100, 10, 100);
    },

    start() {
        if (!firebase.auth().currentUser) {
            alert('Please login first');
            return;
        }

        this.boat = { x: 50, y: 500, width: 50, height: 30 };
        this.animate();
    },

    animate() {
        const speed = document.getElementById('boat-speed').value;
        this.boat.x += speed * 0.5;
        this.boat.y -= this.river.flow * 0.5;

        this.draw();

        if (this.checkCollision()) {
            document.getElementById('result-message').textContent = 'Perahu berhasil mencapai tujuan!';
            return;
        }

        if (this.boat.y < 100 || this.boat.x > 1050) {
            document.getElementById('result-message').textContent = 'Perahu keluar jalur!';
            return;
        }

        requestAnimationFrame(() => this.animate());
    },

    checkCollision() {
        return this.boat.x >= 950 && this.boat.y >= 100 && this.boat.y <= 200;
    }
};

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    simulation.init();
});

