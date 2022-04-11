// variable to hold db connection
let db;

// establish a connection to IndexedDb database called 'budget_tracker' and set it to version 1
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) called 'new_transaction`
    // set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true });
}

// upon a successful
request.onsuccess = function (event) {
    // when db is successfully created with its object store (from code above) or
    // simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        console.log("app is online. running uploadTransaction fucntion.")
        uploadTransaction()
    }
};

// if unsuccessful, log error
request.onerror = function (event) {
    console.log(event.target.errorCode);
};

// if we attempt to submit a new transaction and there is no internet connection
// we are passing in record which is the data we were trying to 'POST'
function saveRecord(record) {
    console.log("no internet connection")
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store for `new_transaction`
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with add method
    transactionObjectStore.add(record);
    console.log("saved record in db: " + record)
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    const getAll = transactionObjectStore.getAll();

    // upon successful .getAll() execution
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    transactionObjectStore.clear();

                    alert('All saved transactions has been submitted.')
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
};

// listen for app coming back on online
window.addEventListener('online', uploadTransaction);