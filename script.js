// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDklNMETqvQctyioT5PQWbqD1Q0pHdYXo4",
  authDomain: "bookmaster-booking.firebaseapp.com",
  projectId: "bookmaster-booking",
  storageBucket: "bookmaster-booking.firebasestorage.app",
  messagingSenderId: "887763262438",
  appId: "1:887763262438:web:8108ec31e10b9dc8b81427"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class BookingSystem {
    constructor() {
        this.bookings = [];
        this.showAvailableOnly = false;
        this.courtTypeFilter = 'all';
        this.init();
    }

    init() {
        // Load bookings from Firebase instead of localStorage
        this.loadBookingsFromFirebase();
        
        this.setupEventListeners();
        this.populateTimeDropdowns();
        this.cleanupPastBookings();
        this.renderBookings();
    }

    async loadBookingsFromFirebase() {
        try {
            const snapshot = await db.collection('bookings').get();
            this.bookings = snapshot.docs.map(doc => doc.data());
            this.sortBookings();
            this.renderBookings();
        } catch (error) {
            console.error('Error loading bookings from Firebase:', error);
            // Fallback to hardcoded bookings if Firebase fails
            this.addSampleBookings();
        }
    }

    async saveBookingsToFirebase() {
        try {
            // Clear existing bookings
            const snapshot = await db.collection('bookings').get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // Add all current bookings with their existing IDs
            this.bookings.forEach(booking => {
                const docRef = db.collection('bookings').doc(booking.id);
                batch.set(docRef, booking);
            });
            
            await batch.commit();
            console.log('Bookings saved to Firebase');
        } catch (error) {
            console.error('Error saving bookings to Firebase:', error);
        }
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
        this.sortBookings();
        this.saveBookingsToFirebase();
        console.log('User bookings loaded');
    }

    loadBookings() {
        // This method is now replaced by loadBookingsFromFirebase
        // Kept for compatibility
    }

    saveBookings() {
        // This method is now replaced by saveBookingsToFirebase
        // Kept for compatibility
        this.saveBookingsToFirebase();
    }

    setupEventListeners() {
        // Availability filter radio buttons
        const availabilityRadios = document.querySelectorAll('input[name="bookingFilter"]');
        
        availabilityRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                console.log('Availability filter changed to:', e.target.value);
                this.showAvailableOnly = e.target.value === 'available';
                this.renderBookings();
            });
        });
        
        // Court type filter dropdown (both desktop and mobile)
        const courtDropdown = document.getElementById('courtFilter');
        if (courtDropdown) {
            courtDropdown.addEventListener('change', (e) => {
                console.log('Court filter changed to:', e.target.value);
                this.courtTypeFilter = e.target.value;
                this.renderBookings();
            });
        }
        
        // Create new booking
        document.getElementById('createNew').addEventListener('click', () => {
            this.openModal();
        });

        // Download for WhatsApp (single button)
        document.getElementById('downloadWhatsApp').addEventListener('click', () => {
            console.log('WhatsApp download button clicked');
            this.downloadForWhatsApp();
        });

        // 3 dots menu functionality
        document.addEventListener('click', (e) => {
            // Handle menu dots click
            if (e.target.classList.contains('menu-dots')) {
                e.stopPropagation();
                const bookingId = e.target.dataset.id;
                const dropdown = document.getElementById(`menu-${bookingId}`);
                
                // Close all other dropdowns
                document.querySelectorAll('.menu-dropdown').forEach(menu => {
                    if (menu !== dropdown) {
                        menu.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('show');
            }
            
            // Close dropdowns when clicking outside
            if (!e.target.closest('.booking-menu')) {
                document.querySelectorAll('.menu-dropdown').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveBooking();
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
        
        // Filter bookings based on both filter states
        let bookingsToRender = this.bookings;
        
        // Filter by availability
        if (this.showAvailableOnly) {
            bookingsToRender = bookingsToRender.filter(booking => {
                const playersNeeded = this.calculatePlayersNeeded(booking);
                return playersNeeded > 0;
            });
        }
        
        // Filter by court type
        if (this.courtTypeFilter !== 'all') {
            bookingsToRender = bookingsToRender.filter(booking => {
                return booking.courtType.toLowerCase() === this.courtTypeFilter;
            });
        }
        
        // Sort bookings by date and time (Unix timestamps for accuracy)
        bookingsToRender.sort((a, b) => {
            const timestampA = new Date(a.date + ' ' + a.startTime).getTime();
            const timestampB = new Date(b.date + ' ' + b.startTime).getTime();
            return timestampA - timestampB;
        });

        if (bookingsToRender.length === 0) {
            container.innerHTML = `
                <div class="no-bookings">
                    <h3>${this.showAvailableOnly ? 'No available slots' : 'No bookings found'}</h3>
                    <p>${this.showAvailableOnly ? 'All bookings are full!' : 'Create your first booking to get started.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = bookingsToRender.map(booking => this.createBookingCard(booking)).join('');
        
        // Add event listeners to the new buttons
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.editBooking(id);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await this.deleteBooking(id);
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
        
        // Calculate duration in minutes
        const calculateDuration = (startTime, endTime) => {
            const start = new Date(`2000-01-01 ${startTime}`);
            const end = new Date(`2000-01-01 ${endTime}`);
            const diffMs = end - start;
            const diffMins = Math.round(diffMs / 60000);
            return diffMins;
        };
        
        const duration = calculateDuration(booking.startTime, booking.endTime);
        const durationText = `${duration} mins`;
        
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
        
        // Main title: Day and time with duration in parentheses
        const title = `${dayName} ${startTimeFormatted} (${durationText})`;
        
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
                <div class="booking-date-number ${playersNeeded === 0 ? 'full' : ''}">
                    <div class="date-day">${dayNumber}</div>
                    <div class="date-month">${monthName}</div>
                </div>
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
                        <div class="booking-menu">
                            <button class="menu-dots" data-id="${booking.id}">⋮</button>
                            <div class="menu-dropdown" id="menu-${booking.id}">
                                <button class="menu-item edit-btn" data-id="${booking.id}">✏️ Edit</button>
                                <button class="menu-item delete-btn" data-id="${booking.id}">❌ Delete</button>
                            </div>
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

    async saveBooking() {
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
        
        await this.saveBookingsToFirebase();
        this.sortBookings();
        this.renderBookings();
        this.closeModal();
    }

    editBooking(id) {
        const booking = this.bookings.find(b => b.id === id);
        if (booking) {
            this.openModal(booking);
        }
    }

    async deleteBooking(id) {
        if (confirm('Are you sure you want to delete this booking?')) {
            this.bookings = this.bookings.filter(b => b.id !== id);
            await this.saveBookingsToFirebase();
            this.sortBookings();
            this.renderBookings();
        }
    }

    sortBookings() {
        this.bookings.sort((a, b) => {
            // Convert to Unix timestamps for accurate chronological sorting
            const timestampA = new Date(a.date + ' ' + a.startTime).getTime();
            const timestampB = new Date(b.date + ' ' + b.startTime).getTime();
            return timestampA - timestampB;
        });
    }

    calculatePlayersNeeded(booking) {
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
    }

    getOrdinalSuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const minute = minutes;
        const ampm = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour % 12 || 12; // Convert 0 to 12
        return `${displayHour}:${minute} ${ampm}`;
    }

    getFilterDescription() {
        const availability = this.showAvailableOnly ? 'AVAILABLE' : 'ALL';
        const courtType = this.courtTypeFilter === 'all' ? 'COURTS' : this.courtTypeFilter.toUpperCase();
        return `${availability} ${courtType}`;
    }

    async downloadForWhatsApp() {
        console.log('downloadForWhatsApp method started');
        try {
            // Filter bookings based on both filter states
            let bookingsToDownload = this.bookings;
            
            // Filter by availability
            if (this.showAvailableOnly) {
                bookingsToDownload = bookingsToDownload.filter(booking => {
                    const playersNeeded = this.calculatePlayersNeeded(booking);
                    return playersNeeded > 0;
                });
            }
            
            // Filter by court type
            if (this.courtTypeFilter !== 'all') {
                bookingsToDownload = bookingsToDownload.filter(booking => {
                    return booking.courtType.toLowerCase() === this.courtTypeFilter;
                });
            }
            
            // Sort bookings for display (Unix timestamps for accuracy)
            const sortedBookings = bookingsToDownload.sort((a, b) => {
                const timestampA = new Date(a.date + ' ' + a.startTime).getTime();
                const timestampB = new Date(b.date + ' ' + b.startTime).getTime();
                return timestampA - timestampB;
            });

            if (sortedBookings.length === 0) {
                const filterDesc = this.getFilterDescription();
                alert(`No bookings found for: ${filterDesc}!`);
                return;
            }

            let textContent = `🏸 RACQUET COURT BOOKINGS - ${this.getFilterDescription()}\n\n`;
            
            // Calculate spaces properly, excluding 'infinite' bookings
            const validBookings = sortedBookings.filter(booking => booking.maxPlayers !== 'infinite');
            const totalSpaces = validBookings.reduce((sum, booking) => sum + parseInt(booking.maxPlayers), 0);
            const totalPlayers = validBookings.reduce((sum, booking) => sum + (booking.players ? booking.players.length : 0), 0);
            const availableSpaces = totalSpaces - totalPlayers;
            
            textContent += `${totalSpaces} TOTAL SPACES\n${availableSpaces} SPACES available\n\n`;

            for (let i = 0; i < sortedBookings.length; i++) {
                const booking = sortedBookings[i];
                const dateObj = new Date(booking.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = dateObj.getDate();
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                
                const timeDisplay = `${dayName} ${dayNumber}${this.getOrdinalSuffix(dayNumber)} ${monthName}`;
                const timeRange = `${this.formatTime(booking.startTime)} - ${this.formatTime(booking.endTime)}`;
                
                // Handle court and booked by with "Unknown" placeholders
                const courtDisplay = booking.court || 'Unknown';
                const bookedByDisplay = booking.bookedBy || 'Unknown';
                
                textContent += `*${timeDisplay} - ${booking.courtType}*\n`;
                textContent += `⏰ ${timeRange}\n`;
                textContent += `🏟️ ${courtDisplay} • Booked by ${bookedByDisplay}\n`;
                
                // Players display
                if (booking.players && booking.players.length > 0) {
                    textContent += `👥 ${booking.players.join(' • ')}\n`;
                } else {
                    textContent += `👥 No players\n`;
                }
                
                // Players needed
                const playersNeeded = this.calculatePlayersNeeded(booking);
                if (playersNeeded > 0) {
                    textContent += `*${playersNeeded} PLAYERS STILL NEEDED*\n`;
                }
                
                // Add separator between bookings (except last one)
                if (i < sortedBookings.length - 1) {
                    textContent += '\n';
                }
            }

            // Create and download the file
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `racquet-bookings-${this.showAvailableOnly ? 'available' : 'all'}-${new Date().toISOString().split('T')[0]}.txt`;
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
