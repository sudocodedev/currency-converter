//Elements Selection
const exchange_rate_block = document.querySelector(".exchange-rate");
const from_currency_select = document.querySelector(".from-currency select");
const to_currency_select = document.querySelector(".to-currency select");
const from_currency_input = document.getElementById("from-currency-amount");
const to_currency_input = document.getElementById("to-currency-amount");
const from_flag = document.getElementById("from-flag");
const to_flag = document.getElementById("to-flag");
const main = document.getElementById("main");
const error = document.getElementById('error');
const theme = document.getElementById('theme');
const html = document.querySelector('html');

//Theme lists
const themes = {'theme1': 'emerald', 'theme2': 'sunset', 'theme3': 'cyberpunk'};

//constants & variables
let exchange_rate, currencies, user_currency, storedFlags;
const DEFAULT_CURRENCY_CODE = "USD";
const DATA_PRECISION_CODE = 2;

// API details
const ipdata = {
  API_KEY: "94569ba61648f564dd24483f5251356415d7c847cb6b0b4521ce77d5",
  BASE_URL: "https://api.ipdata.co",
  userCurrency: function () {
    return `${this.BASE_URL}/currency?api-key=${this.API_KEY}`;
  }
}

// API details
const exchangeRate = {
  API_KEY: "309865ccb7f06aff142ad66f",
  BASE_URL: "https://v6.exchangerate-api.com/v6",
  convert: function (from_currency, to_currency, amount) {
    return `${this.BASE_URL}/${this.API_KEY}/pair/${from_currency}/${to_currency}/${amount}`
  },
  lists: function () {
    return `${this.BASE_URL}/${this.API_KEY}/codes`;
  }
}

//Helper functions
let get_from_currency_code = () => from_currency_select.value;

let get_to_currency_code = () => to_currency_select.value;

//Returns user's currency based on IP address
async function getUserCurrency() {
  const res = await fetch(ipdata.userCurrency());
  const data = await res.json()
  return data.code;
}

//Return exchange rate between two currencies
async function getExchangeRate(from_currency, to_currency) {
  const amount = 1;
  const res = await fetch(exchangeRate.convert(from_currency, to_currency, amount));
  const data = await res.json();
  return data.conversion_rate;
}

//Get all the currency lists from API for select option
async function getCurrencies() {
  const res = await fetch(exchangeRate.lists());
  const data = await res.json();
  return data.supported_codes;
}

//Getting flags for the into localstorage
async function LoadFlags(url) {
  if(!("flags" in localStorage)){
    const res = await fetch(url);
    const data = await res.json()
    let output={};
    data.forEach(item => {
      let key = item["code"];
      let value = {...item};
      output[key] = value;
    });
    localStorage.setItem("flags", JSON.stringify(output));
  } else {
    console.log("'flags' values already present in localStorage.");
  }
}

//Render exchange rate between two currencies from the API
function renderExchangeRate(from_currency, to_currency, conversion_rate) {
  let converted_value = conversion_rate.toFixed(DATA_PRECISION_CODE);

  to_currency_input.value = converted_value; //Assigning the final value to to_currency input field
  let plural = conversion_rate === 1 ? '' : 's';
  exchange_rate_block.innerHTML = `<p class="text-xl">1 ${currencies[from_currency]} equals <span class="text-xl font-bold">${converted_value} ${currencies[to_currency]}${plural}</span></p>`;
}

//Render currency options in the 'from & to' select fields
function renderSelectOptions() {

  let selected_from_currency, selected_to_currency;
  //Iterating over currencies to render select options
  for (code in currencies) {
    //Making USD & INR as default selected option when initialized
    selected_from_currency = code === DEFAULT_CURRENCY_CODE ? "selected" : "";
    selected_to_currency = code === user_currency ? "selected" : "";

    from_currency_select.innerHTML += `<option value=${code} ${selected_from_currency}>${code} - ${currencies[code]}</option>`;
    to_currency_select.innerHTML += `<option value=${code} ${selected_to_currency}>${code} - ${currencies[code]}</option>`;
  }
}

//Currency Conversion
function convert(direction) {
  let f_value = parseFloat(from_currency_input.value);
  let t_value = parseFloat(to_currency_input.value);
  let rate = parseFloat(exchange_rate);

  //Display error if both input fields are empty or contains invalid data
  if (isNaN(f_value) && isNaN(t_value)) {

    //Making outline of input field as red to make it as an error occured
    from_currency_input.classList.add("input-error");
    to_currency_input.classList.add("input-error");
    if (error.style.display === "none") { error.style.display = "block"; }
    return;

  } 

  if (direction === "from->to") {
    
    //Display error if 'from' input fields are empty or contains invalid data
    if (isNaN(f_value)) {

      //Making outline of input field as red to make it as an error occured
      from_currency_input.classList.add("input-error");
      if (error.style.display === "none") { error.style.display = "block"; }
      return;
  
    }

    //If 'from' input field contains proper data, proceeding with conversion and removing error checks
    if (error.style.display === "block") {
      error.style.display = 'none';
      from_currency_input.classList.remove("input-error");

      if (from_currency_input.classList.contains('input-error')) {
        from_currency_input.classList.remove("input-error");
      }
    }

    to_currency_input.value = (f_value * rate).toFixed(DATA_PRECISION_CODE);

  } 
  else if (direction === "to->from") {

    //Display error if 'to' input fields are empty or contains invalid data
    if (isNaN(t_value)) {

      //Making outline of input field as red to make it as an error occured
      to_currency_input.classList.add("input-error");
      if (error.style.display === "none") { error.style.display = "block"; }
      return;
  
    }

    //If 'to' input field contains proper data, proceeding with conversion and removing error checks
    if (error.style.display === "block") {
      error.style.display = 'none';
      to_currency_input.classList.remove("input-error");

      if (from_currency_input.classList.contains('input-error')) {
        from_currency_input.classList.remove("input-error");
      }
    }

    from_currency_input.value = (t_value / rate).toFixed(DATA_PRECISION_CODE);

  }
}

//Loads selected currency codes flags in the HTML page
async function renderFlags() {
  await LoadFlags('./currencies_code.json');
  storedFlags = JSON.parse(localStorage.getItem("flags"));
  let f_curr = get_from_currency_code();
  let t_curr = get_to_currency_code();
  from_flag.src = storedFlags[f_curr]['flag'];
  to_flag.src = storedFlags[t_curr]['flag'];
  from_flag.classList.remove('fa-spinner', 'fa-spin-pulse');
  to_flag.classList.remove('fa-spinner', 'fa-spin-pulse');
}

//Initializes the setup
async function init() {

  //Setting up default theme
  if (!('theme' in localStorage)) {
    localStorage.setItem('theme','emerald');
    html.dataset.theme = localStorage.getItem('theme');
  }

  html.dataset.theme = localStorage.getItem('theme'); 

  //Getting user's currency using ipdata API
  user_currency = await getUserCurrency();

  //Storing currency lists into local storage to prevent multiple API calls
  if (!("currencies" in localStorage)) {

    //if localstorage is empty  
    let cache = await getCurrencies();
    localStorage.setItem("currencies", JSON.stringify(Object.fromEntries(cache)));

  } else {

    //If data inside localstorage is not correct then
    let storedCurrencies = localStorage.getItem("currencies");
    if (storedCurrencies.length < 1000) {
      localStorage.removeItem("currencies");
      let cache = await getCurrencies();
      localStorage.setItem("currencies", JSON.stringify(Object.fromEntries(cache)));
    }

  }

  currencies = JSON.parse(localStorage.getItem("currencies"));
  exchange_rate = await getExchangeRate(DEFAULT_CURRENCY_CODE, user_currency);

  //Render Exhange Rate between currencies in html page
  renderExchangeRate(DEFAULT_CURRENCY_CODE, user_currency, exchange_rate);

  //Render Flags for the selected currencies
  renderFlags();

  //Render currencies for select option
  renderSelectOptions();
}

init();

//User Interactivity
from_currency_input.addEventListener("input", () => {
  convert("from->to");
})

to_currency_input.addEventListener("input", () => {
  convert("to->from");
})

from_currency_select.addEventListener("change", async () => {
  //Getting currency codes from input field
  let f_curr = get_from_currency_code();
  let t_curr = get_to_currency_code();

  //calling API to get new exchange_rate for selected currencies & render it in HTML
  exchange_rate = await getExchangeRate(f_curr, t_curr);
  renderExchangeRate(f_curr, t_curr, exchange_rate);

  //Re-rendering flag
  from_flag.src = storedFlags[f_curr]["flag"];

  //Conversion
  convert("from->to");
})

to_currency_select.addEventListener("change", async () => {
  //Getting currency codes from input field
  let f_curr = get_from_currency_code();
  let t_curr = get_to_currency_code();

  //calling API to get new exchange_rate for selected currencies & render it in HTML
  exchange_rate = await getExchangeRate(f_curr, t_curr);
  renderExchangeRate(f_curr, t_curr, exchange_rate);

  //Re-rendering flag
  to_flag.src = storedFlags[t_curr]["flag"];

  //Conversion
  convert("to->from");
})


//Selecting theme
theme.addEventListener('click', (e) =>{
  console.log(e.target.id);
  if (e.target.id in themes) {
    html.dataset.theme = themes[e.target.id];
    localStorage.setItem('theme',themes[e.target.id]);
  }
});