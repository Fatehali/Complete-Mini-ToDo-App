// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import * as FS from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDDCeOqCIltYZEJ9ZgYF9LKVet5M3tANAI",
    authDomain: "fir-1-55f46.firebaseapp.com",
    projectId: "fir-1-55f46",
    storageBucket: "fir-1-55f46.appspot.com",
    messagingSenderId: "578884030003",
    appId: "1:578884030003:web:f311c324793159d1c1dd46",
    measurementId: "G-GRBJEFPXJ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// getting the database | Initializing Cloud Firestore and 
//  getting the reference to the service
const db = FS.getFirestore(app);
// console.log(db);

const defaultDoc = FS.doc(db, 'TodoData', 'user1');

// setting a document within the collection 'TodoData'
await FS.setDoc( defaultDoc, {
    userID: 1,
});

// console.log(arr);

// sortArr(objArr) sorts an array of objects of the following form:
//   example: 
//      arr = [ { id: "todo_2" }, { id: "user_1" }, { id: "user_0" }, ... ] ==>
//      arr = [ { id: "todo_0" }, { id: "user_1" }, { id: "user_2" }, ... ]
function sortArr(objArr) {
    return [...objArr].sort( 
        (a, 
            b) => {
            let p = Number(a.id.slice(5)); 
            let q = Number(b.id.slice(5));
            // console.log("a", Number(a.id.slice(5)), "b", Number(b.id.slice(5)));
            return p - q;
        });
}

// updateDatabase(data) takes a string data li element and adds it as a string
//  to the firebase firestore.
const updateDatabase = async (data, optionalID = null, isCompleted = false) => {
    let str = optionalID; 
    if (str === null) {
        let initialIndex = data.indexOf(`"`) + 1;
        let finalIndex = data.indexOf(`">`);
        str = 'todo_' + data.slice(initialIndex, finalIndex);
    }
    await FS.setDoc( FS.doc(db, 'TodoData', 'user1', "todoList", str) , {
        todoElement : data,
        taskDone: isCompleted, 
        elementID: str,
    });
};

// deleteDoc(subDocName, mainDocName?) takes string mainDocName and subDocName and deletes the doc subDocName
//  from within the collections "todoList" of the main Doc mainDocName
// The function returns a promise
//        (Doc) "user1"  ==>  (collection) "todoList"  ==> (Doc) "todo_0"   <example> 
const deleteDoc = async (subDocName, mainDocName = 'user1') => {
    if (!(Boolean(mainDocName) && Boolean(subDocName))) {
        return new Promise(rej => rej("Doc deletion fails: Input TypeError!"));
    }
    console.log("subDocName:", subDocName);  
    await FS.deleteDoc( FS.doc(db, 'TodoData', mainDocName, "todoList", subDocName) );
    return new Promise((res) => res("Doc deletion successful!"));
};

/** 
 *  nullifyField(subDocName, mainDocName?) takes string mainDocName and subDocName and nullifies the todoElement field
 *      from within the doc subDocName within "todoList" of the main Doc mainDocName  
 */
const nullifyField = async (subDocName, mainDocName = 'user1') => {
    if (!(Boolean(mainDocName) && Boolean(subDocName))) {
        return new Promise(rej => rej("Doc nullification fails: Input TypeError!"));
    }  
    await FS.setDoc( FS.doc(db, 'TodoData', 'user1', "todoList", subDocName) , {
        todoElement : null,
        elementID: subDocName,
    });
    // await FS.deleteDoc( FS.doc(db, 'TodoData', mainDocName, "todoList", subDocName) );
    return new Promise(res => res("Doc successfully nullified!"));
};


// This self-invoking async function gets all the data from the database and
//  returns the dataObjArr
//(async function () {
    
// Getting the data and displaying it... Bringing the data once
const dataCollection = FS.collection(db, 'TodoData');
const allDocsObject = await FS.getDocs(dataCollection);
const allDocsArr = allDocsObject.docs;

// Getting subCollections
const myDoc = FS.doc(db, 'TodoData', 'user1');
const allDocsWithinSubcollection = await FS.getDocs(FS.collection(myDoc, 'todoList'));
const allSubDocsArr = allDocsWithinSubcollection.docs;

// Then we sort the array and get the final array dataObjArr
const sortedArr = sortArr(allSubDocsArr);
const dataObjArr = sortedArr.map(item => item.data());
const dataStrArr = dataObjArr.map(item => item.todoElement);

console.log("dataObjArr", dataObjArr);
console.log("dataStrArr", dataStrArr);

const ulElement = document.getElementById('listOfItems');

// This will only run once
if (ulElement.children.length === 0) {
    document.getElementById('fa-spin-icon').remove();
    dataStrArr.forEach(strEle => {
        if (strEle) ulElement.innerHTML += strEle;
    })
    if (dataStrArr.every(val => val == null)) {
        const divEle = document.createElement('div');
        divEle.setAttribute('class', 'border');
        divEle.setAttribute('id', 'fa-spin-icon');
        
        const spanEle = document.createElement('span');
        spanEle.setAttribute('id', 'loadingMessage');

        const errorMsg = document.createTextNode("Sorry, Todo history not found!");

        spanEle.appendChild(errorMsg);
        divEle.appendChild(spanEle);
        divEle.style.visibility = "visible";
        divEle.style.marginTop = "6rem";
        document.getElementById('displayArea').insertAdjacentElement("beforeend", divEle);

        setTimeout(() => {
            document.getElementById('fa-spin-icon').remove();
        }, 3000);
    }
}

// Now setting events at the end of script.js once everything is loaded...


export { updateDatabase, dataObjArr, dataStrArr, deleteDoc, nullifyField };