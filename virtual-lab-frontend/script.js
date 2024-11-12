async function getFirebaseConfig() {
    const response = await fetch('/firebase-config');
    if (!response.ok) {
        throw new Error('Failed to fetch Firebase configuration');
    }
    return await response.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const firebaseConfig = await getFirebaseConfig();
        firebase.initializeApp(firebaseConfig);

        // Initialize Firestore
        firebase.firestore();

        auth.init();
        simulation.init();
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
});



firebase.initializeApp(firebaseConfig);

// Auth Module
const auth = {
    ui: new firebaseui.auth.AuthUI(firebase.auth()),
    currentUser: null,

    init() {
        this.ui.start('#firebaseui-auth', {
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                signInSuccessWithAuthResult: (authResult) => {
                    this.currentUser = authResult.user; // Save the logged-in user
                    this.hideLogin();
                    this.displayUserInfo();
                    this.loadCoins(authResult.user);
                    return false; // Avoid redirect
                }
            }
        });

        firebase.auth().onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                document.getElementById('app-content').style.display = 'block';
                this.displayUserInfo();
                this.loadCoins(user);
            } else {
                document.getElementById('app-content').style.display = 'none';
                document.getElementById('user-greeting').style.display = 'none';
            }
        });
    },

    async loadCoins(user) {
        const userId = user.uid;
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
    
        // Initialize coins if no record exists
        const coins = userDoc.exists ? userDoc.data().coins : 0;
    
        // Update simulation with the loaded coins
        simulation.updateCoins(coins);
    
        // Save initial coins back to Firestore if this is a new user
        if (!userDoc.exists) {
            await firebase.firestore().collection('users').doc(userId).set({ coins });
        }
    },

    async saveCoins(coins) {
        if (!this.currentUser) return;
    
        const userId = this.currentUser.uid;
        await firebase.firestore().collection('users').doc(userId).set(
            { coins },
            { merge: true } // Merge coins with existing data
        );
    }
    ,

    displayUserInfo() {
        const userGreeting = document.getElementById('user-greeting');
        const email = this.currentUser.email || "User";

        userGreeting.textContent = `Hello, ${email}!`; // Display user email as a greeting
        userGreeting.style.display = 'block'; // Make the greeting visible
    },

    showLogin() {
        document.getElementById('auth-container').style.display = 'flex';
    },

    hideLogin() {
        document.getElementById('auth-container').style.display = 'none';
    },

    logout() {
        firebase.auth().signOut();
        this.currentUser = null;
        document.getElementById('user-greeting').style.display = 'none';
    }
};


// Simulation Module
const simulation = {
    canvas: null,
    ctx: null,
    boat: { x: 50, y: 500, width: 50, height: 30 },
    river: { flow: 1.5 },
    animation: null,
    coins: 0,

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
        document.getElementById('result-message').textContent = '';
        this.animate();
    },

    animate() {
        const speed = document.getElementById('boat-speed').value;
        this.boat.x += speed * 0.5;
        this.boat.y -= this.river.flow * 0.5;

        this.draw();

        if (this.checkCollision()) {
            this.addCoins(10);
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
    },

    addCoins(amount) {
        this.coins += amount;
        this.updateCoins(this.coins);
        auth.saveCoins(this.coins);
    },

    updateCoins(coins) {
        this.coins = coins;
        document.getElementById('coin-counter').textContent = `Coins: ${coins}`;
    }
};

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    simulation.init();
});