const headerCityButton = document.querySelector(".header__city-button");
const cartListGoods = document.querySelector(".cart__list-goods");
const cartTotalCost = document.querySelector(".cart__total-cost");

let hash = location.hash.substring(1);

headerCityButton.textContent =
    localStorage.getItem("lomoda-location") || "Ваш город";

headerCityButton.addEventListener("click", (e) => {
    const city = prompt("Укажите ваш город");
    headerCityButton.textContent = city;
    localStorage.setItem("lomoda-location", city);
});

const getLocalStorage = () =>
    JSON?.parse(localStorage.getItem("lomoda-cart")) || [];
const setLocalStorage = (data) =>
    localStorage.setItem("lomoda-cart", JSON.stringify(data));

const renderCart = () => {
    cartListGoods.innerHTML = "";
    const cartItems = getLocalStorage();

    let totalPrice = 0;

    cartItems.forEach((item, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
			<td>${i + 1}</td>
			<td>${item.brand} ${item.name}</td>
			<td>${item.color ? item.color : "-"}</td>
			<td>${item.size ? item.size : "-"}</td>
			<td>${item.cost} &#8381;</td>
			<td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
		`;
        totalPrice += item.cost;
        cartListGoods.append(tr);
    });
    cartTotalCost.innerHTML = `${totalPrice} &#8381;`;
};

const deleteItemCart = (id) => {
    const cartItems = getLocalStorage();
    const newCartItems = cartItems.filter((item) => item.id !== id);
    setLocalStorage(newCartItems);
};

cartListGoods.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches(".btn-delete")) {
        deleteItemCart(target.dataset.id);
        renderCart();
    }
});

// блокировка скроллинга

const disableScroll = () => {
    const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
    document.body.dataset.scrollY = window.scrollY;
    document.body.style.cssText = `
		position: fixed;
		width: 100%;
		height: 100vh;
		top: ${-window.scrollY}px;
		overflow: hidden;
		padding-right: ${scrollBarWidth}px;
	`;
};
const enableScroll = () => {
    document.body.style.cssText = "";
    window.scroll({ top: document.body.dataset.scrollY });
    document.body.dataset.scrollY = "";
};

// модальное окно

const subheaderCart = document.querySelector(".subheader__cart");
const cartOverlay = document.querySelector(".cart-overlay");

const cartModalOpen = () => {
    cartOverlay.classList.add("cart-overlay-open");
    disableScroll();
    renderCart();
};

const cartModalClose = (e) => {
    const target = e.target;
    if (
        target.classList.contains("cart-overlay") ||
        target.classList.contains("cart__btn-close")
    ) {
        cartOverlay.classList.remove("cart-overlay-open");
        enableScroll();
    }
};

// запрос данных

const getData = async () => {
    //async перед объявлением функции говорит за себя
    const data = await fetch("db.json"); //await - блокирует выполнение далее до возврата данных асинхронной функцией?
    if (data.ok) {
        return data.json();
    } else {
        throw new Error(
            `Данные не получены, ошибка ${data.status} ${data.statusText}`
        );
    }
};

const getGoods = (callback, prop, value) => {
    getData()
        .then((data) => {
            if (value) {
                callback(data.filter((item) => item[prop] === value));
            } else {
                callback(data);
            }
        })
        .catch((err) => {
            console.error(err);
        });
};
getGoods((data) => {
    console.warn(data);
});

// подписки на браузерные события

subheaderCart.addEventListener("click", cartModalOpen);
cartOverlay.addEventListener("click", cartModalClose);
cartOverlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        cartOverlay.classList.remove("cart-overlay-open");
        enableScroll();
    }
});

// для страницы товаров

try {
    const goodsList = document.querySelector(".goods__list");
    if (!goodsList) {
        throw "not a goods page";
    }

    const goodsTitle = document.querySelector(".goods__title");

    const changeTitle = () => {
        const navLink = document.querySelector(`[href*=\\#${hash}]`);
        goodsTitle.textContent = hash && navLink ? navLink.textContent : "";
    };

    const createCard = ({ id, preview, cost, brand, name, sizes }) => {
        const li = document.createElement("li");
        li.classList.add("goods__item");

        li.innerHTML = `
		<article class="good">
		<a class="good__link-img" href="card-good.html#${id}">
		<img class="good__img" src="goods-image/${preview}" alt="">
		</a>
		<div class="good__description">
		<p class="good__price">${cost} &#8381;</p>
		<h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
		${
            sizes
                ? `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(
                      " "
                  )}</span></p>`
                : ""
        }
		<a class="good__link" href="card-good.html#${id}">Подробнее</a>
		</div>
		</article>`;

        return li;
    };

    const renderGoodsList = (data) => {
        goodsList.innerHTML = "";
        data.forEach((element) => {
            goodsList.appendChild(createCard(element));
        });
    };

    const prepareGoodsPage = () => {
        hash = window.location.hash.substring(1);
        console.log("hash:", hash.length);
        getGoods(renderGoodsList, "category", hash);
        console.log(goodsTitle.textContent);
        changeTitle();
        console.log(goodsTitle.textContent);
    };

    window.addEventListener("hashchange", prepareGoodsPage);

    prepareGoodsPage();
} catch (e) {
    console.warn(e);
}

//для страницы одного товара
try {
    if (!document.querySelector(".card-good")) {
        throw "not a card good page";
    }

    const cardGoodImage = document.querySelector(".card-good__image");
    const cardGoodBrand = document.querySelector(".card-good__brand");
    const cardGoodTitle = document.querySelector(".card-good__title");
    const cardGoodPrice = document.querySelector(".card-good__price");
    const cardGoodColor = document.querySelector(".card-good__color");
    const cardGoodColorList = document.querySelector(".card-good__color-list");
    const cardGoodSizes = document.querySelector(".card-good__sizes");
    const cardGoodSizesList = document.querySelector(".card-good__sizes-list");
    const cardGoodBuy = document.querySelector(".card-good__buy");

    const cardGoodSelects = document.querySelectorAll(
        ".card-good__select__wrapper"
    );

    const generateList = (arr) =>
        arr.reduce(
            (html, item, i) =>
                `${html}<li class="card-good__select-item" data-id="${i}">${item}</li>`,
            ""
        );

    const renderCardGood = ([
        { brand, name, cost, color, sizes, photo, id },
    ]) => {
        const data = { brand, name, cost, id };

        cardGoodImage.src = `goods-image/${photo}`;
        cardGoodImage.alt = `${brand} ${name}`;
        cardGoodBrand.textContent = brand;
        cardGoodTitle.textContent = name;

        cardGoodPrice.textContent = `${cost} ₽`;
        if (color) {
            cardGoodColor.textContent = color[0];
            cardGoodColor.dataset.id = 0;
            cardGoodColorList.innerHTML = generateList(color);
        } else {
            cardGoodColor.style.display = "none";
        }

        if (sizes) {
            cardGoodSizes.textContent = sizes[0];
            cardGoodSizes.dataset.id = 0;
            cardGoodSizesList.innerHTML = generateList(sizes);
        } else {
            cardGoodSizes.style.display = "none";
        }

        if (getLocalStorage().some((item) => item.id === id)) {
            cardGoodBuy.classList.add("delete");
            cardGoodBuy.textContent = "Удалить из корзины";
        }

        cardGoodBuy.addEventListener("click", () => {
            if (cardGoodBuy.classList.contains("delete")) {
                deleteItemCart(id);
                cardGoodBuy.classList.remove("delete");
                cardGoodBuy.textContent = "Добавить в корзину";
                return;
            }

            if (color) data.color = cardGoodColor.textContent;
            if (sizes) data.size = cardGoodSizes.textContent;

            cardGoodBuy.classList.add("delete");
            cardGoodBuy.textContent = "Удалить из корзины";

            const cardData = getLocalStorage();
            cardData.push(data);
            setLocalStorage(cardData);
        });
    };

    cardGoodSelects.forEach((item) => {
        item.addEventListener("click", (e) => {
            const target = e.target;
            if (target.closest(".card-good__select")) {
                target.classList.toggle("card-good__select__open");
            }
            if (target.closest(".card-good__select-item")) {
                const cardGoodSelect = item.querySelector(".card-good__select");
                cardGoodSelect.textContent = target.textContent;
                cardGoodSelect.dataset.id = target.dataset.id;
                cardGoodSelect.classList.remove("card-good__select__open");
            }
        });
    });

    getGoods(renderCardGood, "id", hash);
} catch (e) {
    console.warn(e);
}
