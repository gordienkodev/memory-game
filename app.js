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
const CARD_OPEN_DELAY = 300;

const cards = cardsData.flatMap((card) => [
    { ...card, id: `${card.id}-a`, pairId: card.id },
    { ...card, id: `${card.id}-b`, pairId: card.id },
]);

let gameBoard;

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (text) {
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
    const actions = createElement("div", "header__actions");
    const newGameButton = createButton("Новая игра");
    const leaderboardButton = createButton("Лидеры");

    newGameButton.addEventListener("click", renderCards);

    actions.append(newGameButton, leaderboardButton);
    header.append(title, actions);
    document.body.append(header);
}

function shuffleCards() {
    const shuffledCards = [...cards];

    for (let i = shuffledCards.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[randomIndex]] = [shuffledCards[randomIndex], shuffledCards[i]];
    }

    return shuffledCards;
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

function handleCardClick(event) {
    const cardElement = event.currentTarget;

    if (cardElement.classList.contains("is-open") || cardElement.classList.contains("is-opening")) {
        return;
    }

    cardElement.classList.add("is-opening");

    window.setTimeout(() => {
        const cardImage = cardElement.querySelector(".card__image");

        cardImage.src = cardElement.dataset.image;
        cardImage.alt = `Card ${cardElement.dataset.pairId}`;
        cardElement.classList.remove("is-opening");
        cardElement.classList.add("is-open");
    }, CARD_OPEN_DELAY);
}

function createGameBoard() {
    gameBoard = createElement("main", "game-board");
    document.body.append(gameBoard);
}

function renderCards() {
    gameBoard.replaceChildren(...shuffleCards().map(createCard));
}

createHeader();
createGameBoard();
renderCards();
