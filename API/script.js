//General vars.
let timer = null;
let currentAndNextDay = ' (Today)';

//Create weather tabs.
let title;
let date;
let condition;
let description;
let temp;
let icon;

//Slideshow of images.
let pic = document.querySelector('.pictures');
let parent1 = document.querySelector('#parent1');
let parent2 = document.querySelector('#parent2');
let c1Index = 0; //0 2 4 6
let c2Index = 1; //1 3 5 7
let slideTimer = null;
let switchAround = true;
let c1;
let c2;
let doOnce = true;
let tempIndex = 0;

/* FETCH DATA FROM API */
const getData = async (resource) => {
    const response = await fetch(resource);
    if (response.status !== 200) {
      throw new Error('Cannot fetch the data');
    }
    const data = await response.json();
    return data;
};

/* DOGGY DOG */
/* PRINT ALL BREEDS WITH A TIMEOUT */
// Object.keys returns an array
const div = document.querySelector('div');
let index = 0;
getData('https://dog.ceo/api/breeds/list/all')
    .then(data => {
        printBreeds(Object.keys(data.message), index)
    })
    .catch(err => console.log('Rejected:', err.message));

function printBreeds(data, index) {
    if (index !== 0 && index !== data.length-1) {
        div.innerHTML += `<label>${data[index]}</label>, `; 
    } else {
        div.innerHTML += `<label>${data[index]}</label>.`;
    }  
    if (index !== data.length-1) {
        index++;  
        setTimeout(printBreeds, 100, data, index);
    }
};

/* SELECT */
const select = document.createElement('select');
select.className = 'select';
document.querySelector('.selectDiv').appendChild(select);

getData('https://dog.ceo/api/breeds/list/all')
    .then(data => addDataToSelect(data.message))
    .catch(err => console.log('Rejected2:', err.message));

function addDataToSelect(data) {
    document.querySelector('.select').innerHTML = `
    <option>Choose a breed</option>
    ${Object.keys(data).map(function (breed) {
        return `<option>${breed}</option>`
    }).join('')}`;
} 

/* IMAGESLIDESHOW */
select.addEventListener('change', () => {
    if (select.value === 'Choose a breed') {
        removeAllChilds(parent1);
        removeAllChilds(parent2);
        resetSlides(); 
        return;
    }
    resetSlides();
    getData(`https://dog.ceo/api/breed/${select.value}/images`)
    .then(data => {
        parent1.innerHTML = `<img src="${data.message[0]}">`; //Append the first child (the image) to parent1 (the container) to be showed in the browser.
        fadeIn(parent1); //FadeIn the first child.
        slideShowOfImages(data.message)}) //Start the slideshow of images.
    .catch(err => console.log(err.message));
});

function slideShowOfImages(img) {
    //console.log("Switch ", switchAround, " c1Index ",c1Index,  " c2Index ", c2Index, " img-len ", img.length-1);
    if (img.length > 1 && c2Index <= img.length-1 && c1Index <= img.length-1) {
        parent1.innerHTML = `<img src="${img[c1Index]}">`;
        parent2.innerHTML = `<img src="${img[c2Index]}">`; 
        if (switchAround) {
            if (tempIndex > 0) parent1.innerHTML = `<img src="${img[tempIndex]}">`;
            c1 = parent1;
            c2 = parent2;
            c1Index += 2;
            switchAround = false;
        } else {
            if (tempIndex > 0) parent2.innerHTML = `<img src="${img[tempIndex]}">`;
            c1 = parent2;
            c2 = parent1;
            c2Index += 2;
            switchAround = true;
        }   
        tempIndex = 0;
        setTimeout(fadeOut, 2000, c1);
        setTimeout(fadeIn, 2000, c2);
        slideTimer = setTimeout(slideShowOfImages, 4000, img);
    } else if (img.length == 1) {
        pic.innerHTML = `<img src="${img[c1Index]}">`;
    } else if (img.length != 0) {
        tempIndex = img.length-1;
        c1Index = 0;
        c2Index = 1;
        clearTimeout(slideTimer);
        slideShowOfImages(img);
    } 
}

function resetSlides() {
    c1Index = 0;
    c2Index = 1;
    clearTimeout(slideTimer);
}

/* WEAHTER API FETCH */
let searchBtn = document.getElementById('btn');
let inputField = document.getElementById('field');
let error = document.getElementById('error');
const parentContainer = document.querySelector('.weeklyWeather');

/* SHOW FETCHED DATA IN THE CONSOLE */
getData('https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/koege?unitGroup=metric&key=API_KEY&contentType=json')
    .then(data => console.log(data))
    .catch(err => console.log('Rejected3:', err.message));

searchBtn.addEventListener('click', () => {
    if (inputField.value !== "") {
        let city = inputField.value.toLowerCase();
        let cityURL = '';
        if (city.includes("æ")) {
            cityURL = city.replaceAll("æ","ae");
            city = cityURL;
        }
        if (city.includes("ø")) {
            cityURL = city.replaceAll("ø","oe");
            city = cityURL;
        }
        if (city.includes("å")) {
            cityURL = city.replaceAll("å","aa");
        }
        getData(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityURL}?unitGroup=metric&key=API_KEY&contentType=json`)
            .then(data => {         
                error.textContent = '';
                if (parentContainer.firstChild) {
                    removeAllChilds(parentContainer);
                    addWeatherTab(data) 
                } else addWeatherTab(data)})           
            .catch(() => error.innerHTML = 'Kunne ikke finde temperaturen for den indtastede by. Prøv igen');
        } else error.innerHTML = 'Indtast en by for at få en temperatur vist.'  
});

function removeAllChilds(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    };
}

async function addWeatherTab(data) {
    console.time("Loop_sleep"); 
    for(let i = 0; i < 5; i++) {
        if (i < 5) {
            if (i === 1) currentAndNextDay = ' (Tomorrow)';
            else if (i > 0) currentAndNextDay = '';
            createWeatherTab(
                getDay(data.days[i].datetime)+currentAndNextDay,
                formatDate(data.days[i].datetime),
                data.days[i].conditions,
                data.days[i].description,
                data.days[i].temp,
                getWeatherIcon(data.days[i].icon));
        }  
        await sleep(300, i).then(iterationNum => console.log("Loop_sleep - iteration num: ", iterationNum));
    }
    console.timeEnd("Loop_sleep"); 
}

function sleep(milliseconds, iterationCounter) { 
    return new Promise(res => setTimeout(res, milliseconds, iterationCounter));
}

function createWeatherTab(day, dat, con, des, tem, ico) {
    const weatherWrapper = document.createElement('div');
    weatherWrapper.className = 'weatherWrapper';
    weatherWrapper.style.opacity = 0;

    const headerWrapper = document.createElement('header');
    headerWrapper.className = 'headerWrapper';

    weatherWrapper.appendChild(headerWrapper);

    const headerTitle = document.createElement('div');
    headerTitle.className = 'headerTitle';
    title = document.createElement('span');
    title.textContent = day;
    headerTitle.appendChild(title);

    const headerDate = document.createElement('div');
    headerDate.className = 'headerDate';
    date = document.createElement('span');
    date.textContent = dat;
    headerDate.appendChild(date);

    headerWrapper.appendChild(headerTitle);
    headerWrapper.appendChild(headerDate);

    const weatherInfoWrapper = document.createElement('div');
    weatherInfoWrapper.className = 'weatherInfoWrapper';

    const weatherInfo = document.createElement('div');
    weatherInfo.className = 'weatherInfo';

    condition = document.createElement('label');
    condition.id = 'condition';
    condition.innerHTML = `<Strong>Condition:</Strong><br> ${con}`;

    description = document.createElement('label');
    description.id = 'description';
    description.innerHTML = `<Strong>Description:</Strong><br> ${des}`;

    temp = document.createElement('label');
    temp.id = tem;
    temp.innerHTML = `<Strong>Tempature:</Strong><br> ${tem}°C`; 

    weatherInfo.appendChild(condition);
    weatherInfo.appendChild(description);
    weatherInfo.appendChild(temp);

    const weatherIcon = document.createElement('div');
    weatherIcon.className = 'weatherIcon';
    icon = document.createElement('img');
    icon.src = ico;
    icon.alt = 'weather_icon';
    weatherIcon.appendChild(icon);

    weatherInfoWrapper.appendChild(weatherInfo);
    weatherInfoWrapper.appendChild(weatherIcon);
    weatherWrapper.appendChild(weatherInfoWrapper);
    document.querySelector('.weeklyWeather').appendChild(weatherWrapper);
   
    fadeIn(weatherWrapper);
};

function fadeIn(element) {
    let opa = 0;
    let timer = setInterval(() => {
        opa++;
        element.style.opacity = opa * 0.1;
        if(opa == 10) {
            clearInterval(timer);
        }
    }, 50);
};

function fadeOut(element) {
    let opa = 10;
    let timer = setInterval(() => {
        opa--;
        element.style.opacity = opa * 0.1;
        if(opa == 0) {
            clearInterval(timer);
        }
    }, 50);
};

function getDay(date) {
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let day = new Date(date);
    return weekDays[day.getDay()];
};

function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear(); 
    return `${day} / ${month} - ${year}`;
};

function getWeatherIcon(icon) {
    if(icon == 'partly-cloudy-day') 
        return './img/partly_cloudy.png';
    else if(icon == 'rain') 
        return './img/rain.png';
    else if (icon == 'cloudy') 
        return './img/cloud.png';
    else
        return './img/cloud.png';
};


