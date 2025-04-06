document.addEventListener('DOMContentLoaded', () => {
    const plantForm = document.getElementById('plant-form');
    const successMessage = document.getElementById('success-message');
    const searchInput = document.getElementById('search-input');
    let allPlants = [];

    // Функция для загрузки растений с сервера
    const fetchPlants = async () => {
        try {
            const response = await fetch('/api/plants');
            const data = await response.json();
            allPlants = data;
            displayPlants(data);
        } catch (error) {
            console.error('Error fetching plants:', error);
        }
    };

    // Функция для отображения растений
    const displayPlants = (plants) => {
        const plantList = document.getElementById('plant-list');
        if (!plantList) return;

        plantList.innerHTML = '';
        plants.forEach(plant => {
            const plantItem = document.createElement('div');
            plantItem.classList.add('plant-item');
            plantItem.innerHTML = `
                <h2>${escapeHtml(plant.name)}</h2>
                <p><strong>Description:</strong> ${escapeHtml(plant.description)}</p>
                <p><strong>City:</strong> ${escapeHtml(plant.city)}</p>
                <p><strong>Contact:</strong> ${escapeHtml(plant.contact)}</p>
                <p><strong>User ID:</strong> ${escapeHtml(plant.user_id)}</p> <!-- Отображение user_id -->
                <button onclick="deletePlant(${plant.id})">Delete</button>
                <button onclick="editPlant(${plant.id})">Edit</button>
            `;
            plantList.appendChild(plantItem);
        });
    };

    // Функция для экранирования HTML
    function escapeHtml(unsafe) {
        return unsafe
            ? unsafe.toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
            : '';
    }

    // Обработка отправки формы
    if (plantForm) {
        plantForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('plant-name').value;
            const description = document.getElementById('plant-description').value;
            const city = document.getElementById('plant-city').value;
            const contact = document.getElementById('plant-contact').value;
            const userId = document.getElementById('user-id').value; // Получение user_id из формы

            console.log('Sending data:', { name, description, city, contact, user_id: userId }); // Логи для отладки

            try {
                const response = await fetch('/api/plants', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, description, city, contact, user_id: userId }), // Отправка user_id на сервер
                });

                if (response.ok) {
                    plantForm.reset();
                    successMessage.textContent = `Растение "${escapeHtml(name)}" успешно добавлено!`;
                    successMessage.classList.remove('hidden');
                    setTimeout(() => {
                        successMessage.classList.add('hidden');
                    }, 3000);
                    await fetchPlants(); // Обновить список растений
                } else {
                    throw new Error('Ошибка при добавлении растения');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                successMessage.textContent = 'Произошла ошибка. Пожалуйста, попробуйте снова.';
                successMessage.classList.remove('hidden');
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                }, 3000);
            }
        });
    }

    // Поиск растений
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filteredPlants = allPlants.filter(plant =>
                plant.name.toLowerCase().includes(query) ||
                plant.description.toLowerCase().includes(query) ||
                plant.city.toLowerCase().includes(query) ||
                plant.contact.toLowerCase().includes(query) ||
                plant.user_id.toLowerCase().includes(query) // Поиск по user_id
            );
            displayPlants(filteredPlants);
        });
    }

    // Удаление растения
    window.deletePlant = async (id) => {
        if (!confirm('Are you sure you want to delete this plant?')) return;

        try {
            const response = await fetch(`/api/plants/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchPlants();
            } else {
                throw new Error('Failed to delete plant');
            }
        } catch (error) {
            console.error('Error deleting plant:', error);
            alert('Error deleting plant. Please try again.');
        }
    };

    // Редактирование растения
    window.editPlant = async (id) => {
        const plant = allPlants.find(p => p.id === id);
        if (!plant) return;

        const newName = prompt('Enter new name:', plant.name);
        if (newName === null) return;

        const newDescription = prompt('Enter new description:', plant.description);
        const newCity = prompt('Enter new city:', plant.city);
        const newContact = prompt('Enter new contact:', plant.contact);
        const newUserId = prompt('Enter new user ID:', plant.user_id); // Редактирование user_id

        try {
            const response = await fetch(`/api/plants/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newName,
                    description: newDescription,
                    city: newCity,
                    contact: newContact,
                    user_id: newUserId, // Отправка нового user_id на сервер
                }),
            });

            if (response.ok) {
                await fetchPlants();
            } else {
                throw new Error('Failed to update plant');
            }
        } catch (error) {
            console.error('Error updating plant:', error);
            alert('Error updating plant. Please try again.');
        }
    };

    // Инициализация
    fetchPlants();
});
