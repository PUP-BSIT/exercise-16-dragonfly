const domain = "https://darkgray-goshawk-731405.hostingersite.com/"
                                            + "crud-api/pet_api.php";
displayPets();

function displayPets() {
    fetch(domain, {
        method: 'POST',
        body: new URLSearchParams({ action: 'read' })
    })
    .then(response => response.json())
    .then(data => {
        let petListDiv = document.getElementById("petList");
        petListDiv.innerHTML = ''; 

        data.forEach(pet => {
            let petDiv = document.createElement("div");
            petDiv.classList.add("pet");
            petDiv.innerHTML = `
                <p>Name: ${pet.pet_name}</p>
                <p>Species: ${pet.species}</p>
                <p>Breed: ${pet.breed}</p>
                <p>Age: ${pet.age}</p>
                <p>Owner: ${pet.owner_name}</p>
                <button onclick="editPet(${pet.id})">Edit</button>
                <button onclick="deletePet(${pet.id})">Delete</button>
            `;
            petListDiv.appendChild(petDiv);
        });
    })
    .catch(error => console.error('Error:', error));
}

function editPet(id) {
    fetch(domain, {
        method: 'POST',
        body: new URLSearchParams({ action: 'read', id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.id) {
            document.getElementById("pet_name").value = data.pet_name;
            document.getElementById("species").value = data.species;
            document.getElementById("breed").value = data.breed;
            document.getElementById("age").value = data.age;
            document.getElementById("owner_name").value = data.owner_name;
            
            let petIdInput = document.createElement("input");
            petIdInput.type = "hidden";
            petIdInput.id = "pet_id";
            petIdInput.value = data.id;
            document.querySelector("form").appendChild(petIdInput);
        }
    })
    .catch(error => console.error('Error:', error));
}

function createPet() {
    const pet_name = document.getElementById("pet_name").value;
    const species = document.getElementById("species").value;
    const breed = document.getElementById("breed").value;
    const age = document.getElementById("age").value;
    const owner_name = document.getElementById("owner_name").value;
    const pet_id = document.getElementById("pet_id") ? 
                            document.getElementById("pet_id").value : null; 

    const formData = new FormData();
    const action = pet_id ? 'update' : 'create'; 
    formData.append("action", action);
    formData.append("pet_name", pet_name);
    formData.append("species", species);
    formData.append("breed", breed);
    formData.append("age", age);
    formData.append("owner_name", owner_name);

    if (pet_id) {
        formData.append("id", pet_id);  
    }

    fetch(domain, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success || data.error); 
        displayPets(); 
        clearForm(); 
    })
    .catch(error => console.error('Error:', error));
}

function deletePet(id) {
    if (confirm('Are you sure you want to delete this pet?')) {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);

        fetch(domain, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.success || data.error);
            displayPets(); 
        })
        .catch(error => console.error('Error:', error));
    }
}

function clearForm() {
    document.getElementById("pet_name").value = '';
    document.getElementById("species").value = '';
    document.getElementById("breed").value = '';
    document.getElementById("age").value = '';
    document.getElementById("owner_name").value = '';

    const petIdInput = document.getElementById("pet_id");
    if (petIdInput) {
        petIdInput.remove(); 
    }
}