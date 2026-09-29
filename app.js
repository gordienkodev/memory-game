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

const cards = cardsData.flatMap((card) => [
    { ...card, id: `${card.id}-a`, pairId: card.id },
    { ...card, id: `${card.id}-b`, pairId: card.id },
]);

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
    const title = createElement("h1", "header__title", "RS Game");
    const actions = createElement("div", "header__actions");
    const newGameButton = createButton("Новая игра");
    const leaderboardButton = createButton("Лидеры");

    actions.append(newGameButton, leaderboardButton);
    header.append(title, actions);
    document.body.append(header);
}

createHeader();
