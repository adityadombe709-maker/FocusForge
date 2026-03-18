// get all the html elements needed
const whitelistInput = document.querySelector("#whitelistInput");
const addWhitelistBtn = document.querySelector("#addWhitelistBtn");
const whitelistContainer = document.querySelector("#whitelistContainer");

const blacklistInput = document.querySelector("#blacklistInput");
const addBlacklistBtn = document.querySelector("#addBlacklistBtn");
const blacklistContainer = document.querySelector("#blacklistContainer");

//load lists when popup opens
document.addEventListener("DOMContentLoaded", loadLists);

//add event listeners to buttons
addWhitelistBtn.addEventListener("click", () => addToList("whitelist"));
addBlacklistBtn.addEventListener("click", () => addToList("blacklist"));

//load lists from chrome storage and display
function loadLists() {
  chrome.storage.sync.get(["whitelist", "blacklist"], (result) => {
    const whitelist = result.whitelist || [];
    const blacklist = result.blacklist || [];

    displayList("whitelist", whitelist);
    displayList("blacklist", blacklist);
  });
}

//display a list
function displayList(listType, items) {
  const container =
    listType === "whitelist" ? whitelistContainer : blacklistContainer;

  container.innerHTML = "";

  //empty message
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-message">No items yet</div>';
    return;
  }

  items.forEach((item) => {
    const listItem = document.createElement("div");
    listItem.className = `list-item ${listType === "blacklist" ? "blacklist" : ""}`;

    listItem.innerHTML = `<span>${item}</span>`;
    //creating remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFromList(listType, item));
    listItem.appendChild(removeBtn);

    container.appendChild(listItem);
  });
}

function addToList(listType) {
  const input = listType === "whitelist" ? whitelistInput : blacklistInput;

  const domain = input.value.trim();

  if (!domain) {
    alert("Please enter a domain");
    return;
  }

  chrome.storage.sync.get([listType], (result) => {
    let list = result[listType] || [];

    //checking if domain already exists
    if (list.includes(domain)) {
      alert(`${domain} is already in the list`);
      return;
    }

    list.push(domain);

    chrome.storage.sync.set({ [listType]: list }, () => {
      console.log(`Added ${domain} to ${listType}`);
      input.value = "";
      loadLists();
    });
  });
}

function removeFromList(listType, domain) {
  chrome.storage.sync.get([listType], (result) => {
    let list = result[listType];
    list = list.filter((item) => domain !== item);

    chrome.storage.sync.set({ [listType]: list }, () => {
      console.log(`Removed ${domain} from ${listType}`);
      loadLists();
    });
  });
}
