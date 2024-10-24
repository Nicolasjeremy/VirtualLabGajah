const canvas = document.getElementById("river-simulation");
const ctx = canvas.getContext("2d");

const riverWidth = 950;
const riverHeight = 600;
const boatWidth = 50;
const boatHeight = 30;
const riverFlowSpeed = 1.5;
let boatSpeed = 0;
let timeElapsed = 0;
let boatX = 50;
let boatY = 500;

function drawRiver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#F4A460";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "blue";
    ctx.fillRect(100, 100, riverWidth, riverHeight);
    
    ctx.fillStyle = "red";
    ctx.fillRect(boatX, boatY, boatWidth, boatHeight);
    
    ctx.fillStyle = "green";
    ctx.fillRect(950, 100, 10, 100);
}

function startSimulation() {
    boatSpeed = parseFloat(document.getElementById("boat-speed").value);
    if (isNaN(boatSpeed) || boatSpeed <= 0) {
        document.getElementById("result-message").innerText = "Masukkan kecepatan perahu yang valid!";
        return;
    }
    
    timeElapsed = 0;
    boatX = 50;
    boatY = 500;
    document.getElementById("result-message").innerText = "";
    requestAnimationFrame(simulateBoatMovement);
}

function updateSpeedValue(value) {
    document.getElementById('speed-value').innerText = value + " m/s";
}

function simulateBoatMovement() {
    let boatSpeedX = boatSpeed;
    let boatSpeedY = riverFlowSpeed;
    
    timeElapsed += 0.02;

    boatX = 50 + boatSpeedX * timeElapsed * 30;
    boatY = 500 - boatSpeedY * timeElapsed * 30;
    
    drawRiver();
    
    if (boatX >= 950 && boatY >= 100 && boatY <= 150) { 
        document.getElementById("result-message").innerText = "Perahu berhasil mencapai tujuan!";
    } else if (boatY < 100) { 
        document.getElementById("result-message").innerText = "Perahu keluar dari jalur!";
    } else if (boatX >= riverWidth + 100) {
        document.getElementById("result-message").innerText = "Perahu tidak sampai tujuan!";
    } else {
        requestAnimationFrame(simulateBoatMovement);
    }
}
drawRiver();