const cardsData = [
    { id: 1, image: "./assets/card-1.png" },
    { id: 2, image: "./assets/card-2.png" },
    { id: 3, image: "./assets/card-3.png" },
    { id: 4, image: "./assets/card-4.png" },
    { id: 5, image: "./assets/card-5.png" },
    { id: 6, image: "./assets/card-6.png" },
    { id: 7, image: "./assets/card-7.png" },
    { id: 8, image: "./assets/card-8.png" },
];

const CARD_BACK_IMAGE = "./assets/back.png";
const CARD_OPEN_DELAY = 200;
const CARD_CLOSE_DELAY = 1000;
const TOTAL_PAIRS = cardsData.length;
const VICTORY_RESULTS_STORAGE_KEY = "memoryGameVictoryResults";
const MAX_LEADERBOARD_RESULTS = 10;

const cards = cardsData.flatMap((card) => [
    { ...card, id: `${card.id}-a`, pairId: card.id },
    { ...card, id: `${card.id}-b`, pairId: card.id },
]);

let gameBoard;
let headerElement;
let movesCountElement;
let matchedPairsElement;
let victoryModal;
let victoryMovesElement;
let leaderboardModal;
let leaderboardListElement;
let leaderboardEmptyElement;
let activeModal = null;
let selectedCards = [];
let matchedPairs = new Set();
let movesCount = 0;
let isBoardLocked = false;
let isGameWon = false;
let openCardTimerIds = new Set();
let closeMismatchTimerId = null;

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function createButton(text) {
    const button = createElement("button", "header__button", text);
    button.type = "button";
    return button;
}

function createHeader() {
    const header = createElement("header", "header");
    const title = createElement("h1", "header__title", "One Punch Man Memory Game");
    const stats = createElement("div", "header__stats");
    const movesStat = createElement("span", "header__stat");
    const pairsStat = createElement("span", "header__stat");
    const actions = createElement("div", "header__actions");
    const newGameButton = createButton("Новая игра");
    const leaderboardButton = createButton("Лидеры");

    newGameButton.addEventListener("click", renderCards);
    leaderboardButton.addEventListener("click", showLeaderboardModal);

    movesCountElement = createElement("span");
    matchedPairsElement = createElement("span");
    movesStat.append("Ходы: ", movesCountElement);
    pairsStat.append("Пары: ", matchedPairsElement);
    stats.append(movesStat, pairsStat);
    actions.append(newGameButton, leaderboardButton);
    header.append(title, stats, actions);
    document.body.append(header);
    headerElement = header;
}

function updateStats() {
    movesCountElement.textContent = movesCount;
    matchedPairsElement.textContent = `${matchedPairs.size} из ${TOTAL_PAIRS}`;
}

function getStoredVictoryResults() {
    try {
        const storedResults = JSON.parse(localStorage.getItem(VICTORY_RESULTS_STORAGE_KEY));
        return Array.isArray(storedResults) ? sortVictoryResults(storedResults).slice(0, MAX_LEADERBOARD_RESULTS) : [];
    } catch {
        return [];
    }
}

function sortVictoryResults(results) {
    return [...results].sort((firstResult, secondResult) => {
        const movesDifference = firstResult.moves - secondResult.moves;

        if (movesDifference !== 0) {
            return movesDifference;
        }

        return new Date(firstResult.wonAt).getTime() - new Date(secondResult.wonAt).getTime();
    });
}

function saveStoredVictoryResults(results) {
    try {
        localStorage.setItem(
            VICTORY_RESULTS_STORAGE_KEY,
            JSON.stringify(sortVictoryResults(results).slice(0, MAX_LEADERBOARD_RESULTS))
        );
    } catch (error) {
        console.warn("Unable to save victory results.", error);
    }
}

function saveVictoryResult() {
    if (isGameWon) {
        return;
    }

    isGameWon = true;

    const victoryResult = {
        moves: movesCount,
        matchedPairs: matchedPairs.size,
        wonAt: new Date().toISOString(),
    };
    const victoryResults = getStoredVictoryResults();

    saveStoredVictoryResults([...victoryResults, victoryResult]);
}

function finishGame() {
    saveVictoryResult();
    isBoardLocked = true;

    gameBoard.querySelectorAll(".card").forEach((cardElement) => {
        cardElement.disabled = true;
    });

    showVictoryModal();
}

function showVictoryModal() {
    victoryMovesElement.textContent = movesCount;
    openModal(victoryModal);
}

function renderLeaderboard() {
    const victoryResults = getStoredVictoryResults();

    leaderboardListElement.replaceChildren();
    leaderboardEmptyElement.hidden = victoryResults.length > 0;

    victoryResults.forEach((result, index) => {
        const item = createElement("li", "leaderboard__item");
        const place = createElement("span", "leaderboard__place", `${index + 1}.`);
        const moves = createElement("span", "leaderboard__moves", `${result.moves} ходов`);
        const date = createElement("time", "leaderboard__date", new Date(result.wonAt).toLocaleDateString("ru-RU"));

        date.dateTime = result.wonAt;
        item.append(place, moves, date);
        leaderboardListElement.append(item);
    });
}

function showLeaderboardModal() {
    renderLeaderboard();
    openModal(leaderboardModal);
}

function openModal(modalElement) {
    if (activeModal && activeModal !== modalElement) {
        closeModal(activeModal);
    }

    activeModal = modalElement;
    modalElement.hidden = false;
    modalElement.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    headerElement.inert = true;
    gameBoard.inert = true;

    const closeButton = modalElement.querySelector("[data-modal-close]");
    closeButton?.focus();
}

function closeModal(modalElement = activeModal) {
    if (!modalElement) {
        return;
    }

    modalElement.hidden = true;
    modalElement.setAttribute("aria-hidden", "true");

    if (activeModal === modalElement) {
        activeModal = null;
        document.body.classList.remove("modal-open");
        headerElement.inert = false;
        gameBoard.inert = false;
    }
}

function shuffleCards() {
    const shuffledCards = [...cards];

    for (let i = shuffledCards.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[randomIndex]] = [shuffledCards[randomIndex], shuffledCards[i]];
    }

    return shuffledCards;
}

function clearOpenCardTimers() {
    openCardTimerIds.forEach((timerId) => window.clearTimeout(timerId));
    openCardTimerIds.clear();
}

function createCard(card) {
    const cardElement = createElement("button", "card");
    const cardImage = createElement("img", "card__image");

    cardElement.type = "button";
    cardElement.dataset.id = card.id;
    cardElement.dataset.pairId = card.pairId;
    cardElement.dataset.image = card.image;

    cardImage.src = CARD_BACK_IMAGE;
    cardImage.alt = "Card back";

    cardElement.append(cardImage);
    cardElement.addEventListener("click", handleCardClick);

    return cardElement;
}

function openCard(cardElement) {
    cardElement.classList.add("is-opening");
    selectedCards.push(cardElement);

    if (selectedCards.length === 2) {
        isBoardLocked = true;
    }

    const openCardTimerId = window.setTimeout(() => {
        openCardTimerIds.delete(openCardTimerId);

        const cardImage = cardElement.querySelector(".card__image");

        cardImage.src = cardElement.dataset.image;
        cardImage.alt = `Card ${cardElement.dataset.pairId}`;
        cardElement.classList.remove("is-opening");
        cardElement.classList.add("is-open");

        if (selectedCards.length === 2 && selectedCards.every((card) => !card.classList.contains("is-opening"))) {
            checkSelectedPair();
        }
    }, CARD_OPEN_DELAY);

    openCardTimerIds.add(openCardTimerId);
}

function closeCard(cardElement) {
    const cardImage = cardElement.querySelector(".card__image");

    cardImage.src = CARD_BACK_IMAGE;
    cardImage.alt = "Card back";
    cardElement.classList.remove("is-open");
}

function checkSelectedPair() {
    const [firstCard, secondCard] = selectedCards;
    const isPairMatched = firstCard.dataset.pairId === secondCard.dataset.pairId;

    movesCount += 1;

    if (isPairMatched) {
        matchedPairs.add(firstCard.dataset.pairId);
        firstCard.classList.add("is-matched");
        secondCard.classList.add("is-matched");
        firstCard.disabled = true;
        secondCard.disabled = true;
        updateStats();
        selectedCards = [];

        if (matchedPairs.size === TOTAL_PAIRS) {
            finishGame();
            return;
        }

        isBoardLocked = false;
        return;
    }

    updateStats();

    closeMismatchTimerId = window.setTimeout(() => {
        closeCard(firstCard);
        closeCard(secondCard);
        selectedCards = [];
        isBoardLocked = false;
        closeMismatchTimerId = null;
    }, CARD_CLOSE_DELAY);
}

function handleCardClick(event) {
    const cardElement = event.currentTarget;

    if (
        isGameWon ||
        isBoardLocked ||
        cardElement.classList.contains("is-open") ||
        cardElement.classList.contains("is-opening") ||
        cardElement.classList.contains("is-matched")
    ) {
        return;
    }

    openCard(cardElement);
}

function createGameBoard() {
    gameBoard = createElement("main", "game-board");
    document.body.append(gameBoard);
}

function createModal(titleText) {
    const modal = createElement("div", "modal");
    const modalContent = createElement("section", "modal__content");
    const title = createElement("h2", "modal__title", titleText);
    const body = createElement("div", "modal__body");
    const actions = createElement("div", "modal__actions");
    const closeButton = createButton("Закрыть");

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    closeButton.dataset.modalClose = "true";
    closeButton.addEventListener("click", () => closeModal(modal));
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });

    actions.append(closeButton);
    modalContent.append(title, body, actions);
    modal.append(modalContent);
    document.body.append(modal);

    return { modal, body, actions };
}

function createVictoryModal() {
    const { modal, body, actions } = createModal("Победа!");
    const message = createElement("p", "modal__message", "Все пары найдены.");
    const moves = createElement("p", "modal__moves");
    const newGameButton = createButton("Новая игра");

    victoryModal = modal;
    victoryMovesElement = createElement("span");
    moves.append("Итоговое число ходов: ", victoryMovesElement);
    newGameButton.addEventListener("click", renderCards);

    actions.prepend(newGameButton);
    body.append(message, moves);
}

function createLeaderboardModal() {
    const { modal, body } = createModal("Лидеры");

    leaderboardModal = modal;
    leaderboardEmptyElement = createElement("p", "modal__message", "Результатов пока нет.");
    leaderboardListElement = createElement("ol", "leaderboard");

    body.append(leaderboardEmptyElement, leaderboardListElement);
}

function renderCards() {
    clearOpenCardTimers();

    if (closeMismatchTimerId !== null) {
        window.clearTimeout(closeMismatchTimerId);
        closeMismatchTimerId = null;
    }

    selectedCards = [];
    matchedPairs = new Set();
    movesCount = 0;
    isBoardLocked = false;
    isGameWon = false;
    closeModal();
    updateStats();
    gameBoard.replaceChildren(...shuffleCards().map(createCard));
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

createHeader();
createGameBoard();
createVictoryModal();
createLeaderboardModal();
renderCards();
