const genderMap = new Map([["male", "👨🏻"], ["female", "👱🏻‍♀️"], ["n/a", "🤖"], ["none", "🤖"]]);
const peopleArray = [];
const cacheMap = new Map();
let personID = 0;
async function getPeople() {
    let next = "https://swapi.dev/api/people";
    try {
        while (true) {
            if (next === null) {
                break;
            }
            console.log(next);
            const apiResponse = await fetch(next);
            if (!apiResponse.ok) {
                throw new Error("Couldn't reach server");
            }
            const responseJSON = await apiResponse.json();
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
const films = [
    "https://swapi.dev/api/films/1/",
    "https://swapi.dev/api/films/2/",
    "https://swapi.dev/api/films/3/"
];
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
function getPersonData(personID) {
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
    if (array.length === 0) {
        array.push("none");
    }
    array.forEach((value) => {
        let listItem = document.createElement("li");
        listItem.textContent = value;
        element.appendChild(listItem);
    });
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
