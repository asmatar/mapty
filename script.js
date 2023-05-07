'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type'); // runing o cycling
const inputDistance = document.querySelector('.form__input--distance'); //distance
const inputDuration = document.querySelector('.form__input--duration'); // duration
const inputCadence = document.querySelector('.form__input--cadence'); // cadence
const inputElevation = document.querySelector('.form__input--elevation'); // elevation
const workoutTag =[...document.querySelectorAll('.workout')]; // elevation
console.log(workoutTag)
const runningArr = []
const cyclingArr = []
let map;
let lat;
let lng;

const getCurrentLatLong = async () => {
    const getCurrentPosition = () => new Promise((resolve, error) => navigator.geolocation.getCurrentPosition(resolve, error));
    try {
        const Data = await getCurrentPosition();
        return displayMap(Data);
    } catch (error) {
        console.log("getCurrentLatLong::catcherror =>", error);
    }
};
const getLocalstorage = () => {
    
    const runningData = JSON.parse(localStorage.getItem('running'));
    const cyclingData = JSON.parse(localStorage.getItem('cycling'));
    if (!cyclingData && !runningData) return;
    runningData?.forEach((el)=>{
        runningArr.push(el)
        updateUi(el.distance, el.duration, el.type, el.month, el.day, el.lat, el.lng, el.cadence)
    })
    cyclingData?.forEach((el)=>{
        updateUi(el.distance, el.duration, el.type, el.month, el.day, el.lat, el.lng, el.elevation)
    })
} 
const showForm = (e)=>{
    lat = Number(e.latlng.lat)
    lng = Number(e.latlng.lng)
    form.classList.remove("hidden");
}
const updateUi = (distance, duration, type, month, day, lat, lng, cadence = 2, elevation=2 ) => {
    let html = `
    <li class="workout workout--${type}" data-id="1">
    <h2 class="workout__title">${type} on ${month }  ${day}</h2>
    <div class="workout__details">
    <span class="workout__icon">${
        type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
    }</span>
    <span class="workout__value">${distance}</span>
    <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${duration}</span>
    <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${(duration / distance).toFixed(2)}.</span>
    <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
    <span class="workout__icon"> ${type === "running"? "🦶🏼" : "⛰" }</span>
    <span class="workout__value">${type === "running" ? cadence : elevation}</span>
    <span class="workout__unit">spm</span>
    </div>
    </li>
    ` 
    form.insertAdjacentHTML("afterend", html)
    showOnMap(lat, lng, type, month, day)
}
const resetForm = (lat, lng, type, month, day) => {
    form.classList.add("hidden");
    inputType.value = "running"
    inputDistance.value = ""
    inputDuration.value = ""
    inputCadence.value = ""
    inputCadence.value = ""
    inputElevation.value = ""
    showOnMap(type, month, day)
}
const createWorkout = (distance, duration, type, month, day, lat, lng, cadence = 2, elevation = 5) =>{
    if (type === "running") {
        runningArr.push({
            distance,
            duration,
            type,
            month,
            day, 
            lat,
            lng,
            cadence
        })
        updateUi(distance, duration, type, month, day, lat, lng, cadence)
        localStorage.setItem('running', JSON.stringify(runningArr));
    }
    if (type === "cycling") {
        cyclingArr.push({
            distance,
            duration,
            type,
            month,
            day,
            lat,
            lng,
            elevation
        })
        updateUi(distance, duration, type, month, day, lat, lng, elevation)
        localStorage.setItem('cycling', JSON.stringify(cyclingArr));
    }
    resetForm()
}

const createDate = () =>{
    const now = new Date()
    const month = now.toLocaleString('default', { month: 'long' })
    const day = now.getDate()
    return ({month, day})
}
const trackType = () => {
    inputElevation.parentElement.classList.remove("form__row--hidden")
    inputCadence.parentElement.classList.remove("form__row--hidden")
    if (inputType.value === "running") inputElevation.parentElement.classList.add("form__row--hidden")
    if (inputType.value === "cycling") inputCadence.parentElement.classList.add("form__row--hidden")
}
const checkInput = () => {
    if (inputType.value === "running") {
        let distance = +inputDistance.value
        let duration = +inputDuration.value
        let cadence = +inputCadence.value
        let type = inputType.value
        let runningInputs = [distance, duration, cadence]
        const isPositive = runningInputs.every((currentValue) => currentValue > 0)
        const isNumber = runningInputs.every(el => isFinite(el) === true)
        if (!isPositive || !isNumber) return
        const currentDate = createDate()
        let month = currentDate.month
        let day = currentDate.day
        createWorkout(distance, duration, type, month, day, lat, lng, cadence)
    }
    if (inputType.value === "cycling") {
        let distance = +inputDistance.value
        let duration = +inputDuration.value
        let elevation = +inputElevation.value
        let type = inputType.value
        let cyclingInputs = [distance, duration, elevation]
        const isPositive = cyclingInputs.every((currentValue) => currentValue > 0)
        const isNumber = cyclingInputs.every(el => isFinite(el) === true)
        if (!isPositive || !isNumber) return
        const currentDate = createDate()
        let month = currentDate.month
        let day = currentDate.day
        createWorkout(distance, duration, type, month, day, lat, lng, elevation)
    }
}
const submitForm = (e) => {
    e.preventDefault()
    checkInput()
}

const showOnMap = (lat, lng, type, month, day) => {
    L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`${type} on ${month } ${day}`,
    {
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${type}-popup`,
    }
    ).openPopup()
}

const displayMap = (data) => {
    map = L.map('map').setView([data?.coords?.latitude, data?.coords?.longitude], 14);
    getLocalstorage()
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    map.on('click', showForm);
    checkInput()
}
function centerMapOnMarker() {
    console.log("first")
    map.setView(marker.getLatLng(), zoomLevel);
  }
  workoutTag?.forEach((workout)=>{
    workout.addEventListener("click", centerMapOnMarker)
  })
inputType.addEventListener("change", trackType)
form.addEventListener('submit', submitForm)
getCurrentLatLong()
