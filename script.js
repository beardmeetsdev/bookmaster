class BookingSystem {
    constructor() {
        this.bookings = [];
        this.currentEditingId = null;
        
        // Add sample bookings for demo purposes
        this.addSampleBookings();
        
        this.loadBookings();
        this.setupEventListeners();
        this.populateTimeDropdowns();
        this.cleanupPastBookings();
        this.renderBookings();
    }

    addSampleBookings() {
        // User's actual bookings data
        const userBookings = [
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: '',
                date: '2025-01-23',
                startTime: '15:00',
                sessionLength: '60',
                endTime: '16:00',
                bookedBy: 'Claire',
                players: []
            },
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: '',
                date: '2025-01-27',
                startTime: '09:00',
                sessionLength: '120',
                endTime: '11:00',
                bookedBy: 'Richard',
                players: []
            },
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: '',
                date: '2025-01-27',
                startTime: '13:00',
                sessionLength: '60',
                endTime: '14:00',
                bookedBy: 'Claire',
                players: []
            },
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: '',
                date: '2025-01-27',
                startTime: '15:00',
                sessionLength: '60',
                endTime: '16:00',
                bookedBy: 'Matt',
                players: ['Matt C', 'Roy']
            },
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: '',
                date: '2025-01-27',
                startTime: '15:00',
                sessionLength: '60',
                endTime: '16:00',
                bookedBy: 'Jonny',
                players: []
            },
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: 'Court 1',
                date: '2025-01-29',
                startTime: '15:00',
                sessionLength: '60',
                endTime: '16:00',
                bookedBy: 'Matt',
                players: []
            },
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: 'Court 1',
                date: '2025-01-29',
                startTime: '21:00',
                sessionLength: '60',
                endTime: '22:00',
                bookedBy: 'Claire',
                players: []
            },
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: 'Court 1',
                date: '2025-01-30',
                startTime: '15:00',
                sessionLength: '60',
                endTime: '16:00',
                bookedBy: 'Claire',
                players: []
            },
            {
                id: this.generateId(),
                courtType: 'Padel',
                maxPlayers: 4,
                court: 'Court 1',
                date: '2025-01-30',
                startTime: '20:00',
                sessionLength: '60',
                endTime: '21:00',
                bookedBy: 'Matt',
                players: []
            }
        ];
        
        // Always use user's bookings for the live site
        this.bookings = userBookings;
        this.saveBookings();
        console.log('User bookings loaded');
    }

    setupEventListeners() {
        // Create new booking
        document.getElementById('createNew').addEventListener('click', () => {
            this.openModal();
        });

        // Download for WhatsApp - ALL
        document.getElementById('downloadWhatsAppAll').addEventListener('click', () => {
            this.downloadForWhatsApp('all');
        });

        // Download for WhatsApp - AVAILABLE
        document.getElementById('downloadWhatsAppAvailable').addEventListener('click', () => {
            this.downloadForWhatsApp('available');
        });

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBooking();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('bookingModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    loadBookings() {
        const stored = localStorage.getItem('racquetBookings');
        if (stored) {
            this.bookings = JSON.parse(stored);
        } else {
            // Add some sample data for demonstration
            this.bookings = [
                {
                    id: this.generateId(),
                    courtType: 'Padel',
                    maxPlayers: '4',
                    court: 'Court 1',
                    date: this.getDateString(1),
                    startTime: '09:00',
                    sessionLength: '90',
                    endTime: '10:30',
                    bookedBy: 'John Smith',
                    players: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson']
                },
                {
                    id: this.generateId(),
                    courtType: 'Tennis',
                    maxPlayers: '4',
                    court: 'Court 2',
                    date: this.getDateString(2),
                    startTime: '14:00',
                    sessionLength: '90',
                    endTime: '15:30',
                    bookedBy: 'Alice Brown',
                    players: ['Alice Brown', 'Tom Harris']
                }
            ];
            this.saveBookings();
        }
    }

    saveBookings() {
        localStorage.setItem('racquetBookings', JSON.stringify(this.bookings));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    populateTimeDropdowns() {
        const startTimeSelect = document.getElementById('startTime');
        
        // Generate hourly time slots from 06:00 to 22:00
        for (let hour = 6; hour <= 22; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = `${hour.toString().padStart(2, '0')}h`;
            startTimeSelect.appendChild(option);
        }
    }

    formatTimeDisplay(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinutes = minutes === '00' ? '' : ':' + minutes;
        return `${displayHour}${displayMinutes}${ampm}`;
    }

    calculateEndTime(startTime, sessionLength) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + parseInt(sessionLength);
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }

    getDateString(daysFromNow = 0) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0];
    }

    cleanupPastBookings() {
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().slice(0, 5);
        
        this.bookings = this.bookings.filter(booking => {
            if (booking.date < today) {
                return false;
            }
            if (booking.date === today && booking.endTime < currentTime) {
                return false;
            }
            return true;
        });
        
        this.saveBookings();
    }

    renderBookings() {
        const container = document.getElementById('bookingsList');
        const noBookings = document.getElementById('noBookings');
        
        // Sort bookings by date and time
        const sortedBookings = [...this.bookings].sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
        });

        if (sortedBookings.length === 0) {
            container.innerHTML = '';
            noBookings.style.display = 'block';
            return;
        }

        noBookings.style.display = 'none';
        container.innerHTML = sortedBookings.map(booking => this.createBookingCard(booking)).join('');

        // Add event listeners to the new buttons
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.editBooking(id);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.deleteBooking(id);
            });
        });
    }

    createBookingCard(booking) {
        const dateObj = new Date(booking.date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = dateObj.getDate();
        const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
        
        // Format time to 24-hour format with 'h' notation
        const formatTimeForDisplay = (time) => {
            const [hours, minutes] = time.split(':');
            return `${parseInt(hours).toString().padStart(2, '0')}h`;
        };
        
        const startTimeFormatted = formatTimeForDisplay(booking.startTime);
        const endTimeFormatted = formatTimeForDisplay(booking.endTime);
        
        // Get ordinal suffix for day
        const getOrdinalSuffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        
        // Main title: Abbreviated format with sport type in red
        const title = `${dayName} ${dayNumber}${getOrdinalSuffix(dayNumber)} ${monthName} (${startTimeFormatted} - ${endTimeFormatted})`;
        
        // Time subtitle with conditional court and booked by info
        let timeSubtitle = booking.courtType;
        if (booking.court && booking.court !== '' && booking.court !== '*') {
            // Extract just the number from "Court 1", "Court 2", etc.
            const courtNumber = booking.court.replace('Court ', '');
            timeSubtitle += ` Court ${courtNumber}`;
        }
        if (booking.bookedBy && booking.bookedBy !== '' && booking.bookedBy !== '*') {
            timeSubtitle += ` booked by ${booking.bookedBy}`;
        }
        
        // Calculate players still needed
        const calculatePlayersNeeded = (booking) => {
            if (!booking.players || booking.players.length === 0) {
                return booking.maxPlayers === 'infinite' ? 0 : parseInt(booking.maxPlayers);
            }
            
            if (booking.maxPlayers === 'infinite') {
                return 0; // Unlimited players, never need more
            }
            
            const maxCount = parseInt(booking.maxPlayers);
            const currentCount = booking.players.length;
            const needed = maxCount - currentCount;
            return needed > 0 ? needed : 0;
        };
        
        const playersNeeded = calculatePlayersNeeded(booking);
        
        // Players on single line with button-style and colors
        const playersText = booking.players && booking.players.length > 0
            ? booking.players.map((player, index) => {
                const playerClass = `player-${(index % 8) + 1}`; // Cycle through 8 colors
                return `<span class="player-button ${playerClass}">${player}</span>`;
            }).join('')
            : '<span class="player-button player-8">No players listed</span>';

        // Players needed display
        const playersNeededDisplay = playersNeeded > 0 
            ? `<span class="players-needed">${playersNeeded} PLAYERS STILL NEEDED</span>`
            : '';

        return `
            <div class="booking-card">
                <div class="booking-date-number">${dayNumber}</div>
                <div class="booking-content">
                    <div class="booking-header">
                        <div class="booking-left">
                            <h3>${title}</h3>
                            <div class="time-display">${timeSubtitle}</div>
                        </div>
                        <div class="booking-center">
                            <div class="players-container">
                                <div class="players-single-line">${playersText}</div>
                                ${playersNeededDisplay}
                            </div>
                        </div>
                        <div class="booking-actions">
                            <button class="btn btn-secondary btn-small edit-btn" data-id="${booking.id}">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-danger btn-small delete-btn" data-id="${booking.id}">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    openModal(booking = null) {
        const modal = document.getElementById('bookingModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('bookingForm');
        
        if (booking) {
            modalTitle.textContent = 'Edit Booking';
            this.currentEditingId = booking.id;
            
            // Populate form with booking data
            document.getElementById('courtType').value = booking.courtType;
            document.getElementById('maxPlayers').value = booking.maxPlayers || '4';
            document.getElementById('court').value = booking.court;
            document.getElementById('date').value = booking.date;
            document.getElementById('startTime').value = booking.startTime;
            document.getElementById('sessionLength').value = booking.sessionLength || '60';
            document.getElementById('bookedBy').value = booking.bookedBy;
            document.getElementById('players').value = booking.players ? booking.players.join('\n') : '';
        } else {
            modalTitle.textContent = 'Create New Booking';
            this.currentEditingId = null;
            form.reset();
            
            // Set default date to today
            document.getElementById('date').value = this.getDateString();
        }
        
        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('bookingModal');
        modal.style.display = 'none';
        document.getElementById('bookingForm').reset();
        this.currentEditingId = null;
    }

    saveBooking() {
        const courtType = document.getElementById('courtType').value;
        const maxPlayers = document.getElementById('maxPlayers').value;
        const court = document.getElementById('court').value || '';
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('startTime').value;
        const sessionLength = document.getElementById('sessionLength').value;
        const bookedBy = document.getElementById('bookedBy').value || '';
        const playersText = document.getElementById('players').value;
        
        // Calculate end time
        const endTime = this.calculateEndTime(startTime, sessionLength);
        
        const players = playersText
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        
        if (this.currentEditingId) {
            // Update existing booking
            const index = this.bookings.findIndex(b => b.id === this.currentEditingId);
            if (index !== -1) {
                this.bookings[index] = {
                    id: this.currentEditingId,
                    courtType,
                    maxPlayers,
                    court,
                    date,
                    startTime,
                    sessionLength,
                    endTime,
                    bookedBy,
                    players
                };
            }
        } else {
            // Create new booking
            const newBooking = {
                id: this.generateId(),
                courtType,
                maxPlayers,
                court,
                date,
                startTime,
                sessionLength,
                endTime,
                bookedBy,
                players
            };
            this.bookings.push(newBooking);
        }
        
        this.saveBookings();
        this.renderBookings();
        this.closeModal();
    }

    editBooking(id) {
        const booking = this.bookings.find(b => b.id === id);
        if (booking) {
            this.openModal(booking);
        }
    }

    deleteBooking(id) {
        if (confirm('Are you sure you want to delete this booking?')) {
            this.bookings = this.bookings.filter(b => b.id !== id);
            this.saveBookings();
            this.renderBookings();
        }
    }

    async downloadForWhatsApp(type = 'all') {
        try {
            // Sort bookings for display
            const sortedBookings = [...this.bookings].sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return a.startTime.localeCompare(b.startTime);
            });

            // Filter bookings based on type
            let filteredBookings = sortedBookings;
            if (type === 'available') {
                filteredBookings = sortedBookings.filter(booking => {
                    // Calculate players needed for this booking
                    const calculatePlayersNeeded = (booking) => {
                        if (!booking.players || booking.players.length === 0) {
                            return booking.maxPlayers === 'infinite' ? 0 : parseInt(booking.maxPlayers);
                        }
                        
                        if (booking.maxPlayers === 'infinite') {
                            return 0; // Unlimited players, never need more
                        }
                        
                        const maxCount = parseInt(booking.maxPlayers);
                        const currentCount = booking.players.length;
                        const needed = maxCount - currentCount;
                        return needed > 0 ? needed : 0;
                    };
                    
                    const playersNeeded = calculatePlayersNeeded(booking);
                    return playersNeeded > 0; // Only include bookings that need players
                });
            }

            let textContent = '🏸 RACQUET COURT BOOKINGS\n\n';
            
            if (type === 'available') {
                textContent = '🏸 RACQUET COURT BOOKINGS - AVAILABLE SLOTS\n\n';
            }

            if (filteredBookings.length === 0) {
                if (type === 'available') {
                    textContent += 'No bookings with available slots found.';
                } else {
                    textContent += 'No upcoming bookings found.';
                }
            } else {
                filteredBookings.forEach((booking, index) => {
                    const dateObj = new Date(booking.date);
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = dateObj.getDate();
                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    
                    // Get ordinal suffix
                    const getOrdinalSuffix = (day) => {
                        if (day > 3 && day < 21) return 'th';
                        switch (day % 10) {
                            case 1: return 'st';
                            case 2: return 'nd';
                            case 3: return 'rd';
                            default: return 'th';
                        }
                    };
                    
                    // Format time to 24-hour format with 'h' notation
                    const formatTimeForDisplay = (time) => {
                        const [hours, minutes] = time.split(':');
                        return `${parseInt(hours).toString().padStart(2, '0')}h`;
                    };
                    
                    // Format player names as first name + surname initial
                    const formatPlayerName = (fullName) => {
                        const parts = fullName.trim().split(' ');
                        if (parts.length === 1) {
                            return parts[0]; // Just first name if no surname
                        }
                        const firstName = parts[0];
                        const surnameInitial = parts[parts.length - 1][0];
                        return `${firstName} ${surnameInitial}`;
                    };
                    
                    const startTimeFormatted = formatTimeForDisplay(booking.startTime);
                    const endTimeFormatted = formatTimeForDisplay(booking.endTime);
                    
                    // Main booking line with asterisks for bold formatting
                    textContent += `*${dayName} ${dayNumber}${getOrdinalSuffix(dayNumber)} ${monthName} - ${booking.courtType}*\n`;
                    textContent += `⏰ ${startTimeFormatted} - ${endTimeFormatted}\n`;
                    
                    // Handle court and booked by with Unknown placeholders
                    const courtDisplay = (booking.court && booking.court !== '' && booking.court !== '*') 
                        ? booking.court 
                        : 'Court Unknown';
                    const bookedByDisplay = (booking.bookedBy && booking.bookedBy !== '' && booking.bookedBy !== '*') 
                        ? booking.bookedBy 
                        : 'Booker Unknown';
                    textContent += `🏟️ ${courtDisplay} • Booked by ${bookedByDisplay}\n`;
                    
                    // Players (formatted as first name + initial)
                    if (booking.players && booking.players.length > 0) {
                        const formattedPlayers = booking.players.map(player => formatPlayerName(player));
                        textContent += `👥 ${formattedPlayers.join(' • ')}\n`;
                    } else {
                        textContent += `👥 No players\n`;
                    }
                    
                    // Calculate and add players needed
                    const calculatePlayersNeeded = (booking) => {
                        if (!booking.players || booking.players.length === 0) {
                            return booking.maxPlayers === 'infinite' ? 0 : parseInt(booking.maxPlayers);
                        }
                        
                        if (booking.maxPlayers === 'infinite') {
                            return 0; // Unlimited players, never need more
                        }
                        
                        const maxCount = parseInt(booking.maxPlayers);
                        const currentCount = booking.players.length;
                        const needed = maxCount - currentCount;
                        return needed > 0 ? needed : 0;
                    };
                    
                    const playersNeeded = calculatePlayersNeeded(booking);
                    if (playersNeeded > 0) {
                        textContent += `*${playersNeeded} PLAYERS STILL NEEDED*\n`;
                    }
                    
                    // Add separator between bookings (2 blank lines)
                    if (index < filteredBookings.length - 1) {
                        textContent += '\n\n';
                    }
                });
            }
            
            // Create downloadable text file
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `racquet-bookings-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error generating WhatsApp text:', error);
            alert('Failed to generate text file. Please try again.');
        }
    }
}

// Initialize the booking system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BookingSystem();
});
