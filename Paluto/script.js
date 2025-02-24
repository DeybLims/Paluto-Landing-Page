            // Helper functions for loading states
function showLoading(button) {
    button.classList.add('loading');
}

function hideLoading(button) {
    button.classList.remove('loading');
}

function showLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    icon.className = 'toast-icon';
    icon.classList.add(type === 'success' ? 'fa-solid' : 'fa-solid', 
                     type === 'success' ? 'fa-check-circle' : 'fa-check-circle');
    
    messageEl.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Phone number formatting
function formatPhoneNumber(input) {
    let number = input.value.replace(/\D/g, '');
    if (number.length > 11) {
        number = number.slice(0, 11);
    }
    
    if (number.length >= 6) {
        number = number.slice(0, 3) + '-' + number.slice(3, 6) + '-' + number.slice(6);
    } else if (number.length >= 3) {
        number = number.slice(0, 3) + '-' + number.slice(3);
    }
    
    input.value = number;
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            showInputError(input, 'This field is required');
        } else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
            isValid = false;
            input.classList.add('error');
            showInputError(input, 'Please enter a valid email');
        } 
        else {
            input.classList.remove('error');
            hideInputError(input);
        }
    });
    
    return isValid;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showInputError(input, message) {
    let errorDiv = input.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        input.parentElement.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function hideInputError(input) {
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Visitor Form Logic
document.getElementById('visitorOverlay').style.visibility = 'visible';

        // Add phone formatting to visitor phone field
        document.getElementById('phoneNumber').addEventListener('input', function(e) {
            formatPhoneNumber(this);
        });

        document.getElementById('visitorForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm('visitorForm')) {
                showToast('Please fill in all required fields correctly', 'error');
                return;
            }

            const submitButton = this.querySelector('button[type="submit"]');
            showLoading(submitButton);
            showLoadingOverlay();

            const visitorName = document.getElementById('visitorName').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            fetch('https://script.google.com/macros/s/AKfycbw6SuES_wVxdMq5Aa5-Q8IUqZJAGLAoZZSF3gpJ7o6UKLO1nkG_wteidXGYAZ93ZjCw/exec', {
                method: 'POST',
                mode: 'no-cors',
                body: new URLSearchParams({
                    'visitorName': visitorName,
                    'phoneNumber': phoneNumber,
                    'action': 'logVisit'
                })
            }).then(() => {
                // Hide visitor form
                document.getElementById('visitorOverlay').style.visibility = 'hidden';
                hideLoading(submitButton);
                hideLoadingOverlay();
                
                // Pre-fill the reservation form with visitor's details
                document.getElementById('fullName').value = visitorName;
                document.getElementById('mobileNumber').value = phoneNumber;
                
                
            }).catch(error => {
                console.error('Error:', error);
                showToast('There was an error submitting your details.', 'error');
                hideLoading(submitButton);
                hideLoadingOverlay();
            });
        });
// Reservation Form Logic
document.getElementById('openReservation').addEventListener('click', function() {
    document.getElementById('reservationOverlay').style.visibility = 'visible';
});

document.getElementById('reservationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm('reservationForm')) {
        showToast('Please fill in all required fields correctly', 'error');
        return;
    }

    // Populate confirmation modal
    document.getElementById('confirmName').textContent = document.getElementById('fullName').value;
    document.getElementById('confirmPhone').textContent = document.getElementById('mobileNumber').value;
    document.getElementById('confirmInquiry').textContent = document.getElementById('inquiryType').value;
    document.getElementById('confirmDateTime').textContent = new Date(document.getElementById('preferredDateTime').value)
    document.getElementById('confirmGuests').textContent = `${document.getElementById('peopleCount').value} guests`;

    // Show confirmation modal
    document.getElementById('confirmationOverlay').classList.remove('hidden');
});

// Phone number input formatting
document.getElementById('mobileNumber').addEventListener('input', function(e) {
    formatPhoneNumber(this);
});

document.getElementById('reservationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const submitButton = this.querySelector('button[type="submit"]');
    showLoading(submitButton);
    showLoadingOverlay();

    const fullName = document.getElementById('fullName').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const inquiryType = document.getElementById('inquiryType').value;
    const preferredDateTime = document.getElementById('preferredDateTime').value;
    const peopleCount = document.getElementById('peopleCount').value;

    fetch('https://script.google.com/macros/s/AKfycbw6SuES_wVxdMq5Aa5-Q8IUqZJAGLAoZZSF3gpJ7o6UKLO1nkG_wteidXGYAZ93ZjCw/exec', {
        method: 'POST',
        mode: 'cors', // Ensure CORS is enabled to receive a readable response
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'fullName': fullName,
            'mobileNumber': mobileNumber,
            'inquiryType': inquiryType,
            'preferredDateTime': preferredDateTime,
            'peopleCount': peopleCount,
            'action': 'logReservation'
        })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // This assumes the response is JSON.
    }).then(data => {
        if (data.result === 'success') {
            showToast('Reservation submitted successfully!', 'success');
        } else {
            throw new Error('Server processed request, but there was an error: ' + (data.error || 'Unknown error'));
        }
    }).catch(error => {
        console.error('Error:', error);
        showToast('Reservation Received Successfully.', 'error');
    }).finally(() => {
        hideLoading(submitButton);
        hideLoadingOverlay();
        document.getElementById('confirmationOverlay').classList.add('hidden');
        document.getElementById('reservationOverlay').style.visibility = 'hidden';
        document.getElementById('reservationForm').reset();
    });
});



// Close button for confirmation modal
document.getElementById('closeConfirmation').addEventListener('click', function() {
    document.getElementById('confirmationOverlay').classList.add('hidden');
});

// Close button and overlay click handlers
document.getElementById('closeVisitor').addEventListener('click', function() {
    document.getElementById('visitorOverlay').style.visibility = 'hidden';
});

document.getElementById('closeReservation').addEventListener('click', function() {
    document.getElementById('reservationOverlay').style.visibility = 'hidden';
});

document.getElementById('visitorOverlay').addEventListener('click', function(event) {
    if (event.target === this) {
        this.style.visibility = 'hidden';
    }
});

document.getElementById('reservationOverlay').addEventListener('click', function(event) {
    if (event.target === this) {
        this.style.visibility = 'hidden';
    }
});

// Set the minimum and maximum date-time for the reservation
function setDateTimeLimits() {
    const now = new Date();
    const minDateTime = new Date();
    minDateTime.setDate(minDateTime.getDate() + 1); // Set to tomorrow
    minDateTime.setHours(9, 0, 0, 0); // Set to 9 AM tomorrow

    // No max limit (allow reservations for future dates)
    const maxDateTime = new Date();
    maxDateTime.setFullYear(now.getFullYear() + 1); // Allow up to 1 year in advance

    // Debugging logs
    console.log('Min DateTime:', minDateTime);
    console.log('Max DateTime:', maxDateTime);

    // Format date to YYYY-MM-DDTHH:MM
    const formatDateTime = (date) => {
        return date.toISOString().slice(0, 16); // Get the date in the correct format
    };

    const dateTimeInput = document.getElementById('preferredDateTime');
    dateTimeInput.min = formatDateTime(minDateTime);
    dateTimeInput.max = formatDateTime(maxDateTime); // Allow future bookings
}

// Call the function to set limits when the page loads
document.addEventListener('DOMContentLoaded', setDateTimeLimits);

