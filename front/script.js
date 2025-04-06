document.addEventListener('DOMContentLoaded', () => {
    // ============== Растения и обмен ==============
    const plantList = document.getElementById('plant-list');
    const plantForm = document.getElementById('plant-form');
    const successMessage = document.getElementById('success-message');
    const searchInput = document.getElementById('search-input');

    let allPlants = [];

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

    const displayPlants = (plants) => {
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

    if (plantForm) {
        plantForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('plant-name').value;
            const description = document.getElementById('plant-description').value;
            const city = document.getElementById('plant-city').value;
            const contact = document.getElementById('plant-contact').value;

            try {
                const response = await fetch('/api/plants', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, description, city, contact }),
                });
                
                if (response.ok) {
                    plantForm.reset();
                    successMessage.textContent = `Plant "${escapeHtml(name)}" added successfully!`;
                    successMessage.classList.remove('hidden');
                    setTimeout(() => {
                        successMessage.classList.add('hidden');
                    }, 3000);
                    await fetchPlants();
                } else {
                    throw new Error('Failed to add plant');
                }
            } catch (error) {
                console.error('Error adding plant:', error);
                successMessage.textContent = 'Error adding plant. Please try again.';
                successMessage.classList.remove('hidden');
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                }, 3000);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filteredPlants = allPlants.filter(plant =>
                plant.name.toLowerCase().includes(query) ||
                plant.description.toLowerCase().includes(query) ||
                plant.city.toLowerCase().includes(query) ||
                plant.contact.toLowerCase().includes(query)
            );
            displayPlants(filteredPlants);
        });
    }

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

    window.editPlant = async (id) => {
        const plant = allPlants.find(p => p.id === id);
        if (!plant) return;

        const newName = prompt('Enter new name:', plant.name);
        if (newName === null) return;
        
        const newDescription = prompt('Enter new description:', plant.description);
        const newCity = prompt('Enter new city:', plant.city);
        const newContact = prompt('Enter new contact:', plant.contact);

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
                    contact: newContact 
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

    // ============== Чат-бот ==============
    const chatWidget = document.querySelector('.chat-widget');
    const chatHeader = document.querySelector('.chat-header');
    const chatBody = document.querySelector('.chat-body');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const suggestions = document.querySelectorAll('.suggestion');
    
    let chatHistory = [];
    const currentUser = 'user_' + Math.random().toString(36).substr(2, 9);

    // Переключение видимости чата
    if (chatHeader && chatBody) {
        chatHeader.addEventListener('click', () => {
            chatBody.style.display = chatBody.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Отправка сообщения
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        chatInput.value = '';
        
        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                credentials: 'omit'  // Убрали 'include' для простоты
            });
            
            if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
            
            const data = await response.json();
            addMessage(data.response || "Не могу обработать запрос", 'bot');
        } catch (error) {
            console.error('Chat error:', error);
            addMessage("Ошибка соединения с сервером. Попробуйте позже.", 'bot');
        }
    }

    // Добавление сообщения в чат
    const addMessage = (text, sender) => {
        if (!chatBody) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = text;
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        chatHistory.push({sender, text, timestamp: new Date()});
    };

    // Обработчики событий
    if (sendButton && chatInput) {
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Быстрые подсказки
    if (suggestions) {
        suggestions.forEach(btn => {
            btn.addEventListener('click', function() {
                const text = this.textContent;
                if (chatInput) {
                    chatInput.value = text;
                    chatInput.focus();
                }
            });
        });
    }

    // Интеграция с растениями
    window.showPlants = () => {
        const plantsList = allPlants.slice(0, 3).map(p => p.name).join(', ');
        addMessage(`Недавно добавленные растения: ${plantsList || 'пока нет растений'}. Посмотреть все можно на главной странице.`, 'bot');
    };

    // Инициализация
    fetchPlants();
    
    if (chatBody) {
        // Приветственное сообщение
        addMessage("Привет! Я бот для 'Мухоловки на обменник'. Спросите меня о растениях или об обмене!", 'bot');
    }
});