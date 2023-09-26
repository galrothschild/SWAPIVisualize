const genderMap = new Map([["male", "👨🏻"], ["female", "👱🏻‍♀️"], ["n/a", "🤖"], ["none", "🤖"]]);
const peopleArray = [];
const cacheMap = new Map();
let personID = 0;
function showLoader() {
    document.getElementById("loader").style.display = "block";
}
function hideLoader() {
    document.getElementById("loader").style.display = "none";
}
async function getPeople() {
    let next = "https://swapi.dev/api/people";
    try {
        while (true) {
            if (next === null) {
                break;
            }
            const apiResponse = await fetch(next);
            if (!apiResponse.ok) {
                throw new Error("Couldn't reach server");
            }
            const responseJSON = await apiResponse.json();
            if (next === "https://swapi.dev/api/people") {
                hideLoader();
            }
            next = responseJSON["next"];
            addPeopletoList(responseJSON.results);
            peopleArray.push(...responseJSON.results);
        }
    }
    catch (error) {
        console.error(error);
    }
}
getPeople();
function addPeopletoList(peopleArray) {
    const peopleListElement = document.getElementById("people-list");
    peopleArray.forEach(person => {
        let personItem = document.createElement("li");
        personItem.setAttribute("data-id", `${personID}`);
        personItem.addEventListener("click", evt => {
            let element = evt.currentTarget;
            getPersonData(element.attributes["data-id"].value);
        });
        personID++;
        personItem.innerText = `${person.name} `;
        personItem.appendChild(createEyeIcon(person.eye_color));
        personItem.appendChild(createGenderIcon(person.gender));
        peopleListElement.appendChild(personItem);
    });
}
function hideLoaderIfListsAreFull() {
    if (document.getElementById("vehicle-list").innerHTML.length > 0 &&
        document.getElementById("starship-list").innerHTML.length > 0 &&
        document.getElementById("film-list").innerHTML.length > 0 &&
        document.getElementById("homeworld-div").innerHTML.length > 0) {
        hideLoader();
    }
}
function getPersonData(personID) {
    showLoader();
    const person = peopleArray[personID];
    const vehiclesElement = document.getElementById("vehicle-list");
    const starshipsElement = document.getElementById("starship-list");
    const filmsElement = document.getElementById("film-list");
    const homeworldElement = document.getElementById("homeworld-div");
    vehiclesElement.innerHTML = "";
    starshipsElement.innerHTML = "";
    filmsElement.innerHTML = "";
    homeworldElement.innerHTML = "";
    fetch(person["homeworld"])
        .then(response => response.json()
        .then(result => {
        homeworldElement.textContent = result["name"];
        hideLoaderIfListsAreFull();
    }));
    fetchDataFromUrlArray(person.films, "title")
        .then(dataArray => {
        addToList(filmsElement, dataArray);
    })
        .catch(error => console.error(error));
    fetchDataFromUrlArray(person.vehicles, "name")
        .then(dataArray => {
        addToList(vehiclesElement, dataArray);
    })
        .catch(error => console.error(error));
    fetchDataFromUrlArray(person.starships, "name")
        .then(dataArray => {
        addToList(starshipsElement, dataArray);
    })
        .catch(error => console.error(error));
}
async function fetchDataFromUrlArray(urls, property) {
    const promises = urls.map(url => fetch(url).then(response => response.json().then(result => result[property])));
    const data = await Promise.all(promises);
    return data;
}
function addToList(element, array) {
    element.innerHTML = "";
    if (array.length === 0) {
        array.push("none");
    }
    array.forEach((value) => {
        let listItem = document.createElement("li");
        listItem.textContent = value;
        element.appendChild(listItem);
    });
    hideLoaderIfListsAreFull();
}
function createEyeIcon(eyeColor) {
    const eyeIcon = document.createElement('span');
    eyeIcon.title = eyeColor;
    eyeIcon.style.borderRadius = "50%";
    eyeColor === "blue-gray" ? eyeColor = "#6699CC" : "";
    eyeColor === "hazel" ? eyeColor = "#AE734E" : "";
    eyeIcon.classList.add('icon');
    if (eyeColor === "unknown") {
        eyeIcon.textContent = '❔';
    }
    else {
        eyeIcon.textContent = '👁️';
    }
    if (eyeColor.includes(",")) {
        eyeIcon.style.background = `linear-gradient(to right, ${eyeColor.replace(",", " 50%,")} 50%)`;
    }
    else {
        eyeIcon.style.backgroundColor = `${eyeColor}`;
    }
    return eyeIcon;
}
function createGenderIcon(gender) {
    const genderIcon = document.createElement("span");
    genderIcon.title = gender;
    let text = genderMap.get(gender);
    text === undefined ? text = "❔" : "";
    genderIcon.textContent = text;
    return genderIcon;
}
