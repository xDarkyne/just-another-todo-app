// DISCLAIMER: functions that are not used within this file and are not removed are called from the html file
var Datastore = require('nedb')
var db = new Datastore({
    filename: "./db/data.db",
    autoload: true
})

document.addEventListener("DOMContentLoaded", function() {
    printAllLists()
});

function clearListSpace() {
    let listSpace = document.getElementById('list-space')
    listSpace.innerHTML = ""
}

function printAllLists() {
    clearListSpace()
    db.find({}, function(err, docs) {
        if (null != err) {
            console.log(err)
        } else {
            let listSpace = document.getElementById('list-space')
            docs.forEach(doc => {
                let tmpList = new TaskList(doc.name, doc.tasks)
                tmpList.printList(listSpace)
            })
        }
    })
}

function createList() {
    let listName = document.getElementById('list-name-input').value
    if (listName == "") {
        return
    } else {
        db.findOne({name: listName}, function(err, doc) {
            console.log(doc)
            if (null != err || null != doc) {
                console.log(err)
            } else {
                let tmpList = new TaskList(listName)
                db.insert(tmpList, function(err, doc) {
                    if (null != err) {
                        console.log(err)
                    } else {
                        printAllLists()
                    }
                })
            }
        })
    }
}

function deleteList(listName) {
    db.findOne({name: listName}, function(err, doc) {
        if (null != err) {
            console.log(err)
        } else {
            if (null != doc) {
                db.remove({_id: doc._id}, function(err, doc) {
                    if (null != err) {
                        console.log (err)
                    }
                    printAllLists()
                })
            } else {
                return
            }
        } 
    })
}

function addTaskToList(listName, listID, inputID) {
    let list = document.getElementById(listID)
    let input = document.getElementById(inputID)

    let tmpTask = new Task(input.value)
    db.findOne({name: listName}, function(err, doc) {
        if (null != err || null == doc) {
            console.log(err)
        } else {
            let tmpList = new TaskList(doc.name, doc.tasks)
            tmpList.tasks.push(tmpTask)
            db.update({name: doc.name}, tmpList)
            printAllLists()
        }
    })
}

function deleteTaskFromList(task, parentList) {
    db.findOne({name: parentList}, function(err, doc) {
        if (null != err || null == doc) {
            console.log(err)
        } else {
            let tmpList = new TaskList(doc.name, doc.tasks)
            for (let i = 0; i <= tmpList.tasks.length; i++) {
                if (tmpList.tasks[i].name == task) {
                    tmpList.tasks.splice(i, 1)
                    db.update({name: doc.name}, tmpList)
                    printAllLists()
                    break
                } else {
                    continue
                }
            }
        }
    })
}

function updateTask(taskID, taskName, parentList) {
    db.findOne({name: parentList}, function(err, doc) {
        if (null != err || null == doc) {
            console.log(err)
        } else {
            let tmpList = new TaskList(doc.name, doc.tasks)
            for (let i = 0; i <= tmpList.tasks.length; i++) {
                if (tmpList.tasks[i].name == taskName) {
                    tmpList.task[i].completed = document.getElementById(taskID).checked
                    console.log(tmpList.task[i])
                    db.update({name: doc.name}, tmpList)
                    break
                } else {
                    continue
                }
            }
        }
    })
}

/* Classes */
class TaskList {
    constructor(name, tasks = []) {
        this.name = name
        this.tasks = tasks
    }

    printList(element) {
        let listID = this.name+"-ul"
        element.innerHTML += `
            <div class="tasklist" id="`+this.name+`">
                <h1>`+this.name+`</h1>
                <ul class="tasklist-ul" id="`+listID+`">

                </ul>

                <div class="button-group">
                    <input type="text" id="`+this.name+"-taskIn"+`" placeholder="new task">
                    <button onclick="addTaskToList('`+this.name+`', '`+listID+`', '`+this.name+'-taskIn'+`')">Add Task</button>
                    <button onclick="deleteList('`+this.name+`')">Delete List</button>
                </div>
            </div>
        `

        let innerList = document.getElementById(listID)
        this.tasks.forEach(task => {
            let tmpTask = new Task(task.name, task.completed)
            tmpTask.printSelf(innerList)
        })
    }
}

class Task {
    constructor(name, completed = false) {
        this.name = name
        this.completed = completed
    }

    printSelf(element) {
        let checked = (this.completed == true) ? "checked" : ""
        let parent = element.parentElement.id
        let uniqueName = this.name+parent;

        element.innerHTML += `
            <li class="list-item">
                <input type="checkbox" `+checked+` id='`+uniqueName+`-check' onclick="updateTask('`+uniqueName+`', ',`+this.name+`, '`+parent+`')">
                <p>`+this.name+`</p>
                <button onclick="deleteTaskFromList('`+this.name+`', '`+parent+`')">-</button>
            </li>
        `
    }
}