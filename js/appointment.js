// ============================================
// СТРАНИЦА ЗАПИСИ НА УСЛУГУ
// Студия маникюра "Милка"
//
// Описание: Функции для формы записи:
// - Отправка записи на сервер
// - Загрузка услуг и мастеров для формы
// - Валидация формы
// ============================================

// ============================================
// ОТПРАВКА ЗАПИСИ НА УСЛУГУ
// Отправляет данные записи на сервер
// ============================================
async function submitAppointment(username, name, phone, service_id, master_id, date, time) {
    let url = `http://localhost/myserver/`
    let d = {
        action: 'submit_appointment',
        username,
        name,
        phone,
        service_id,
        master_id,
        date,
        time
    }

    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(d).toString(),
        })

        let result = await response.json()
        console.log('Ответ сервера:', result)

        if (result.status === 'success') {
            const successMessage = document.querySelector('#successMessage')
            const form = document.querySelector('#appointment-form')
            if (successMessage) successMessage.classList.add('active')
            if (form) form.style.display = 'none'
            setTimeout(() => {
                window.location.href = 'index.html'
            }, 3000)
        } else {
            const errorMessage = document.querySelector('#errorMessage')
            if (errorMessage) {
                errorMessage.classList.add('active')
                const errorDetail = errorMessage.querySelector('.error-detail')
                if (errorDetail) errorDetail.textContent = result.message
            }
        }
    } catch (error) {
        console.error('Ошибка:', error)
        const errorMessage = document.querySelector('#errorMessage')
        if (errorMessage) {
            errorMessage.classList.add('active')
            const errorDetail = errorMessage.querySelector('.error-detail')
            if (errorDetail) errorDetail.textContent = 'Ошибка соединения с сервером: ' + error.message
        }
    }
}

// ============================================
// ПОЛУЧЕНИЕ УСЛУГ ДЛЯ ФОРМЫ ЗАПИСИ
// ============================================
async function fetchAppointmentServices() {
    let url = `http://localhost/myserver/get.php?action=get_services`
    let response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    })
    let services = await response.json()

    if (Array.isArray(services) && services.length > 0) {
        fillServiceSelect(services)
    } else {
        console.error('Услуги не найдены или ошибка сервера')
    }
}

// ============================================
// ЗАПОЛНЕНИЕ СЕЛЕКТА УСЛУГАМИ
// ============================================
function fillServiceSelect(services) {
    const select = document.querySelector('#service-select')
    if (!select) return

    select.innerHTML = '<option value="">Выберите услугу</option>'

    services.forEach(service => {
        const option = document.createElement('option')
        option.value = service.id
        option.textContent = `${service.title} — ${service.price} руб.`
        select.appendChild(option)
    })
}

// ============================================
// ПОЛУЧЕНИЕ МАСТЕРОВ ДЛЯ ФОРМЫ ЗАПИСИ
// ============================================
async function fetchAppointmentMasters() {
    let url = `http://localhost/myserver/get.php?action=get_masters`
    let response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    })
    let masters = await response.json()

    if (Array.isArray(masters) && masters.length > 0) {
        fillMasterSelect(masters)
    } else {
        console.error('Мастера не найдены или ошибка сервера')
    }
}

// ============================================
// ЗАПОЛНЕНИЕ СЕЛЕКТА МАСТЕРАМИ
// ============================================
function fillMasterSelect(masters) {
    const select = document.querySelector('#master-select')
    if (!select) return

    select.innerHTML = '<option value="">Выберите мастера</option>'

    masters.forEach(master => {
        const option = document.createElement('option')
        option.value = master.id
        option.textContent = master.name
        select.appendChild(option)
    })
}



// ============================================
// ПОЛУЧЕНИЕ ИМЕНИ И ТЕЛЕФОНА ПОЛЬЗОВАТЕЛЯ
// ============================================
async function fetchUserInfo() {
    const username = localStorage.getItem('username')
    if (!username) {
        console.error('Имя пользователя не найдено в localStorage')
        return null
    }

    let url = `http://localhost/myserver/get.php?action=get_appointment_user&username=${encodeURIComponent(username)}`
    
    try {
        let response = await fetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        })
        let userData = await response.json()
        return userData
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error)
        return null
    }
}

// ============================================
// ОТОБРАЖЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ
// ============================================
async function displayUserInfo() {
    const userInfoDisplay = document.querySelector('#userInfoDisplay')
    const userInfoName = document.querySelector('#userInfoName')
    const userInfoPhone = document.querySelector('#userInfoPhone')

    if (!userInfoDisplay) return

    const userData = await fetchUserInfo()

    if (userData && (userData.name || userData.phone)) {
        userInfoDisplay.style.display = 'block'
        if (userInfoName) userInfoName.textContent = userData.name || 'Не указано'
        if (userInfoPhone) userInfoPhone.textContent = userData.phone || 'Не указан'
    }
}

// ============================================
// ПРОВЕРКА ПЕРЕД ЗАПИСЬЮ
// ============================================
function checkAppointmentAuth() {
    if (!isLoggedIn()) {
        alert('Для записи на услугу необходимо войти в систему или зарегистрироваться.')
        window.location.href = 'login.html'
        return false
    }
    return true
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ФОРМЫ ЗАПИСИ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    if (!checkAppointmentAuth()) return

    // Загрузка услуг и мастеров
    fetchAppointmentServices()
    fetchAppointmentMasters()

    // Отображение информации о пользователе
    displayUserInfo()

    // Валидация и отправка формы
    const appointmentForm = document.querySelector('#appointment-form')
    if (appointmentForm) {
        attachValidationHandlers([
            'service-select',
            'master-select',
            'appointment-date',
            'appointment-time',
            'appointment-sessions',
            'payment',
            'appointment-agreement'
        ])

        appointmentForm.addEventListener('submit', function(event) {
            event.preventDefault()

            const fields = [
                'service-select',
                'master-select',
                'appointment-date',
                'appointment-time',
                'appointment-sessions',
                'payment',
                'appointment-agreement'
            ]
            let hasErrors = false

            fields.forEach(function(fieldId) {
                if (!validateField(fieldId)) {
                    hasErrors = true
                }
            })

            if (hasErrors) return

            const username = localStorage.getItem('username')
            const name = localStorage.getItem('name')
            const phone = localStorage.getItem('phone')
            const service_id = document.querySelector('#service-select').value
            const master_id = document.querySelector('#master-select').value
            const date = document.querySelector('#appointment-date').value
            const time = document.querySelector('#appointment-time').value

            console.log('Отправка записи:', { username, name, phone, service_id, master_id, date, time })
            submitAppointment(username, name, phone, service_id, master_id, date, time)
        })
    }

    // Закрытие модальных окон
    document.querySelectorAll('.modal-close-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            this.closest('.modal-overlay').classList.remove('active')
        })
    })

    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.classList.remove('active')
        })
    })
})


