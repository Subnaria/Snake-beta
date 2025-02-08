let snake = [{ x: 5, y: 5 }];
let apple = { x: 10, y: 10 };
let score = 0;
let gameInterval;
let speed = 100;
let direction = "right";
let gridSize = 15;
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let touchStartX = 0;
let touchStartY = 0;

// Vérifier si l'utilisateur est sur mobile
let isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Si c'est un appareil mobile, réduire légèrement la vitesse
if (isMobile) {
    speed = 120;  // Vitesse réduite pour les téléphones
}

// Fonction pour dessiner le serpent
function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "rgb(0, 255, 0)" : "rgb(0, 200, 0)";
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

// Fonction pour dessiner la pomme
function drawApple() {
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize, gridSize);
}

// Fonction pour déplacer le serpent
function moveSnake() {
    const head = { ...snake[0] };

    switch (direction) {
        case "up": head.y--; break;
        case "down": head.y++; break;
        case "left": head.x--; break;
        case "right": head.x++; break;
    }

    snake.unshift(head);
    if (head.x === apple.x && head.y === apple.y) {
        score += 10; // Augmenter le score
        placeApple(); // Replacer la pomme
    } else {
        snake.pop(); // Supprimer la queue du serpent
    }

    if (checkCollision()) {
        stopGame(); // Arrêter le jeu si collision
    }

    update(); // Mettre à jour l'affichage
}

// Vérifier les collisions
function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// Placer une nouvelle pomme
function placeApple() {
    apple = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize)),
    };
}

// Mettre à jour l'affichage du jeu
function update() {
    drawSnake();
    drawApple();
    updateScoreDisplay();
}

// Mettre à jour l'affichage du score
function updateScoreDisplay() {
    const scoreDisplay = document.getElementById("scoreDisplay");
    scoreDisplay.textContent = "Score: " + score;

    // Mise à jour du meilleur score
    const bestScoreDisplay = document.getElementById("best-score-value");
    bestScoreDisplay.textContent = getBestScore();
    const bestScoreName = document.getElementById("best-score-name");
    bestScoreName.textContent = getBestScoreName();
}

// Arrêter le jeu et afficher les boutons de fin
function stopGame() {
    clearInterval(gameInterval);
    document.getElementById("game-over-buttons").style.display = "block"; // Afficher les boutons "Rejouer" et "Retour au menu"
    updateBestScore();
}

// Réinitialiser le jeu
function resetGame() {
    snake = [{ x: 5, y: 5 }];
    score = 0;
    placeApple();
    direction = "right";
    clearInterval(gameInterval);
    gameInterval = setInterval(moveSnake, speed);
}

// Démarrer le jeu
function startGame() {
    const username = document.getElementById("username").value;
    if (!username) {
        alert("Veuillez entrer un pseudo.");
        return;
    }

    // Masquer le menu et afficher le jeu
    document.getElementById("menu").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    document.getElementById("game-over-buttons").style.display = "none"; // Masquer les boutons au démarrage

    // Bloquer le défilement de la page pendant le jeu
    document.body.classList.add("no-scroll");

    // Réinitialiser et démarrer le jeu
    resetGame();

    // Ajouter l'écouteur pour les touches
    document.addEventListener("keydown", function(event) {
        if (event.key === "ArrowUp" && direction !== "down") direction = "up";
        if (event.key === "ArrowDown" && direction !== "up") direction = "down";
        if (event.key === "ArrowLeft" && direction !== "right") direction = "left";
        if (event.key === "ArrowRight" && direction !== "left") direction = "right";
    });

    // Ajouter l'écouteur pour les événements tactiles
    canvas.addEventListener("touchstart", handleTouchStart, false);
    canvas.addEventListener("touchmove", handleTouchMove, false);
}

// Gérer le début du toucher (touchstart)
function handleTouchStart(event) {
    event.preventDefault();
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

// Gérer le déplacement du doigt (touchmove)
function handleTouchMove(event) {
    event.preventDefault();
    let touchEndX = event.touches[0].clientX;
    let touchEndY = event.touches[0].clientY;

    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    // Détecter la direction du swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && direction !== "left") {
            direction = "right"; // Swipe vers la droite
        } else if (diffX < 0 && direction !== "right") {
            direction = "left"; // Swipe vers la gauche
        }
    } else {
        if (diffY > 0 && direction !== "up") {
            direction = "down"; // Swipe vers le bas
        } else if (diffY < 0 && direction !== "down") {
            direction = "up"; // Swipe vers le haut
        }
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
}

// Redémarrer le jeu
function restartGame() {
    resetGame();
    document.getElementById("game-over-buttons").style.display = "none";
}

// Revenir au menu
function returnToMenu() {
    document.getElementById("game-container").style.display = "none";
    document.getElementById("menu").style.display = "block";
    clearInterval(gameInterval);
    document.body.classList.remove("no-scroll");  // Réactiver le défilement
}

// Sauvegarder le meilleur score dans localStorage
function updateBestScore() {
    const currentBestScore = getBestScore();
    const username = document.getElementById("username").value;

    if (score > currentBestScore) {
        // Sauvegarder le nouveau meilleur score et le nom du joueur
        localStorage.setItem("bestScore", score);
        localStorage.setItem("bestScoreName", username);
    }
}

// Récupérer le meilleur score à partir de localStorage
function getBestScore() {
    return localStorage.getItem("bestScore") ? localStorage.getItem("bestScore") : 0;
}

// Récupérer le nom du joueur avec le meilleur score
function getBestScoreName() {
    return localStorage.getItem("bestScoreName") ? localStorage.getItem("bestScoreName") : "Aucun";
}

// Charger le meilleur score et le nom du joueur dès le début
window.onload = function() {
    document.getElementById("best-score-value").textContent = getBestScore();
    document.getElementById("best-score-name").textContent = getBestScoreName();

    // Ajouter un écouteur pour le bouton "Jouer"
    document.querySelector("button").addEventListener("click", startGame);

    // Gérer l'écran de chargement
    const loadingScreen = document.getElementById("loading-screen");
    const loadingText = document.getElementById("loading-text");

    // Afficher l'écran noir pendant 1 seconde
    setTimeout(() => {
        loadingText.style.opacity = "1"; // Faire apparaître "By Pacman"
        
        // Attendre 1,5 seconde et tout cacher
        setTimeout(() => {
            loadingScreen.style.opacity = "0"; // Faire disparaître l'écran en fondu
            loadingScreen.style.visibility = "hidden"; // Rendre invisible l'écran après l'animation
        }, 1500);
        
    }, 1000);
};
