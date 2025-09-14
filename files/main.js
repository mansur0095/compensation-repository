/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.class = clazz;
        return this;
    }

    text(content) {
        this.element.innerHTML = content;
        return this;
    }

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
class Resource {

    /* If you want to know more about this form of getters, read this:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
    get idforDOM() {
        return `resource-${this.id}`;
    }

}

function add(resource, sibling) {

    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

    /*
    creator
        .append(new ElementCreator("h2").text(resource.name))
    */

    // Task2: Display the Animal's properties in the article
    creator.append(new ElementCreator("h2").text(resource.name));  // Name (already present)
    creator.append(new ElementCreator("p").text("Age: " + resource.age));  // Age as a paragraph
    creator.append(new ElementCreator("p").text("Mammal: " + (resource.isMammal ? "Yes" : "No")));  // Boolean as Yes/No
    if (resource.birthdate) {
        const date = new Date(resource.birthdate);
        creator.append(new ElementCreator("p").text("Birthdate: " + date.toDateString()));  // Format date to a readable string
    }

    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(resource);
        }))
        .append(new ElementCreator("button").text("Remove").listener('click', () => {
            /* Task 3: Call the delete endpoint asynchronously using either an XMLHttpRequest
               or the Fetch API. Once the call returns successfully, remove the resource from
               the DOM using the call to remove(...) below. */
            //remove(resource);  // <- This call removes the resource from the DOM. Call it after (and only if) your API call succeeds!
            // Send DELETE request to server for this resource
            /*fetch(`/api/animals/${resource.id}`, { method: 'DELETE' })
               .then(response => {
                   if (response.ok) {
                       // Only remove from DOM if server deletion succeeded
                       remove(resource);
                   } else {
                       console.error("Failed to delete resource on server:", response.status);
                   }
               })
               .catch(err => {
                   console.error("Error during DELETE request:", err);
               });*/
            fetch(`/api/resources/${resource.id}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
                    remove(resource);
                })
                .catch(err => console.error("Error during DELETE request:", err));
        }));

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
        
}

function edit(resource) {
    const formCreator = new ElementCreator("form")
        .id(resource.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + resource.name));
    
    /* Task 4 - Part 1: Instead of the name property, add the properties your resource has here!
       The label and input element used here are just an example of how you can edit a
       property of a resource, in the case of our example property name this is a label and an
       input field. Also, we assign the input field a unique id attribute to be able to identify
       it easily later when the user saves the edited data (see Task 4 - Part 2 below). 
    */
    // Name field
    const nameInput = new ElementCreator("input")
        .id("animal-name")
        .with("type", "text")
        .with("value", resource.name);
    formCreator
        .append(new ElementCreator("label").text("Name: ").with("for", "animal-name"))
        .append(nameInput);

    // Age field
    const ageInput = new ElementCreator("input")
        .id("animal-age")
        .with("type", "number")
        .with("value", resource.age ?? "");
    formCreator
        .append(new ElementCreator("label").text("Age: ").with("for", "animal-age"))
        .append(ageInput);

    // isMammal field (checkbox)
    const mammalInput = new ElementCreator("input")
        .id("animal-isMammal")
        .with("type", "checkbox");
    if (resource.isMammal) {
        // set pre-checked BEFORE inserting into DOM
        mammalInput.with("checked", "");
    }
    formCreator
        .append(new ElementCreator("label").text("Is Mammal: ").with("for", "animal-isMammal"))
        .append(mammalInput);

    // Birthdate field (date picker) — HTML date inputs require YYYY-MM-DD format
    const birthVal = resource.birthdate
        ? new Date(resource.birthdate).toISOString().split("T")[0]
        : "";
    const birthInput = new ElementCreator("input")
        .id("animal-birthdate")
        .with("type", "date")
        .with("value", birthVal);
    formCreator
        .append(new ElementCreator("label").text("Birthdate: ").with("for", "animal-birthdate"))
        .append(birthInput);

    /* In the end, we add the code to handle saving the resource on the server and terminating edit mode */
    formCreator
        .append(new ElementCreator("button").text("Speichern").listener('click', (event) => {
            /* Why do we have to prevent the default action? Try commenting this line. */
            event.preventDefault();

            /* The user saves the resource.
               Task 4 - Part 2: We manually set the edited values from the input elements to the resource object.
               Again, this code here is just an example of how the name of our example resource can be obtained
               and set in to the resource. The idea is that you handle your own properties here.
            */
            resource.name = document.getElementById("animal-name").value;
            const ageRaw = document.getElementById("animal-age").value;
            resource.age = ageRaw === "" ? undefined : Number(ageRaw);
            resource.isMammal = document.getElementById("animal-isMammal").checked;
            const b = document.getElementById("animal-birthdate").value;
            resource.birthdate = b ? new Date(b) : undefined;

            /* Task 4 - Part 3: Call the update endpoint asynchronously. Once the call returns successfully,
               use the code below to remove the form we used for editing and again render
               the resource in the list.
            */
            fetch(`/api/resources/${resource.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resource),  // Date will be serialized as ISO string
            })
                .then((res) => {
                    if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
                    // Only after server success: replace form with updated article
                    add(resource, document.getElementById(resource.idforDOM));
                })
                .catch((err) => {
                    console.error("Error during update request:", err);
                });
        }))
        // Replace the old article with this form in the DOM
        .replace(document.querySelector('main'), document.getElementById(resource.idforDOM));
}

function remove(resource) {
    document.getElementById(resource.idforDOM).remove();
}

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */
function create() {
    //alert("Not implemeted yet!");
    // Create a form element with an id so we can remove it later
    const formCreator = new ElementCreator("form")
        .id("new-resource-form")
        .append(new ElementCreator("h3").text("Create New Animal"));

    // Name field (empty initially)
    formCreator.append(new ElementCreator("label").text("Name: ").with("for", "new-animal-name"))
        .append(new ElementCreator("input").id("new-animal-name").with("type", "text"));

    // Age field
    formCreator.append(new ElementCreator("label").text("Age: ").with("for", "new-animal-age"))
        .append(new ElementCreator("input").id("new-animal-age").with("type", "number"));

    // isMammal field (unchecked by default)
    formCreator.append(new ElementCreator("label").text("Is Mammal: ").with("for", "new-animal-isMammal"))
        .append(new ElementCreator("input").id("new-animal-isMammal").with("type", "checkbox"));

    // Birthdate field
    formCreator.append(new ElementCreator("label").text("Birthdate: ").with("for", "new-animal-birthdate"))
        .append(new ElementCreator("input").id("new-animal-birthdate").with("type", "date"));

    // Save button for creating the new resource
    formCreator.append(new ElementCreator("button").text("Save").listener('click', (event) => {
        event.preventDefault();  // prevent default form submission

        /* Part 2: Collect input values into a new object */
        const newAnimal = {
            name: document.getElementById("new-animal-name").value,
            age: Number(document.getElementById("new-animal-age").value),
            isMammal: document.getElementById("new-animal-isMammal").checked,
            birthdate: document.getElementById("new-animal-birthdate").value
                ? new Date(document.getElementById("new-animal-birthdate").value)
                : undefined
        };

        /* Part 3: Send POST request to server */
        fetch('/api/resources', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAnimal)
        })
            .then((res) => res.json())  // parse JSON response with created resource (includes id)
            .then((createdAnimal) => {
                // Add the new Animal to the DOM
                add(Object.assign(new Resource(), createdAnimal));
                // Remove the creation form after success
                document.getElementById("new-resource-form").remove();
            })
            .catch((err) => {
                console.error("Error during creation:", err);
            });
    }));

    // Insert the form into the DOM just above the "Go to Top" anchor at the bottom
    formCreator.insertBefore(document.querySelector('main'), document.querySelector('#bottom'));
}
    

document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/api/resources")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Resource(), resource));
            }
        });
});

