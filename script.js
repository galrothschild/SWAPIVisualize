const genderMap = new Map([["male", "👨🏻"], ["female", "👱🏻‍♀️"], ["n/a", "🤖"], ["none", "🤖"]]);
const peopleArray = [];
let cacheMap = new Map();
let personID = 0;
function showLoader() {
    document.getElementById("loader").style.display = "block";
}
function hideLoader() {
    document.getElementById("loader").style.display = "none";
}
function updateCacheMap() {
    localStorage.setItem("cacheMap", JSON.stringify([...cacheMap.entries()]));
}
if (localStorage.getItem("cacheMap") === null) {
    updateCacheMap();
}
else {
    cacheMap = new Map(JSON.parse(localStorage.getItem("cacheMap")));
}
async function getPeople() {
    let next = "https://swapi.dev/api/people";
    try {
        while (true) {
            if (next === null) {
                hideLoader();
                break;
            }
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
function addPeopletoList(peopleArray) {
    const peopleListElement = document.getElementById("people-list");
    peopleArray.forEach(person => {
        let personItem = document.createElement("li");
        personItem.setAttribute("data-id", `${personID}`);
        personItem.addEventListener("click", evt => {
            if (document.getElementById("loader").style.display === "none") {
                let element = evt.currentTarget;
                getPersonData(element.attributes["data-id"].value);
            }
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
    if (cacheMap.has(person["homeworld"])) {
        homeworldElement.textContent = cacheMap.get(person["homeworld"]);
    }
    else {
        fetch(person["homeworld"])
            .then(response => response.json()
            .then(result => {
            homeworldElement.textContent = result["name"];
            hideLoaderIfListsAreFull();
            cacheMap.set(person["homeworld"], result["name"]);
        }));
    }
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
    const promises = urls.map(url => {
        if (cacheMap.has(url)) {
            return cacheMap.get(url);
        }
        else {
            return fetch(url).then(response => response.json().then(result => {
                cacheMap.set(result["url"], result[property]);
                updateCacheMap();
                return result[property];
            })).catch(error => {
                console.error(error);
                hideLoader();
            });
        }
    });
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
