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
