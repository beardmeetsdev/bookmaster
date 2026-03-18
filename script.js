// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBg9p86nB_OpuPtqAWLk6pEAo6azSwEwbU",
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
        this.filterMode = 'all';
        this.courtTypeFilter = 'all';
        this.currentCalendarMonth = this.getStartOfWeek(new Date());
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
                this.filterMode = e.target.value;
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

        const prevBtn = document.getElementById('calendarPrev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentCalendarMonth = this.addDays(this.currentCalendarMonth, -7);
                this.renderBookings();
            });
        }

        const nextBtn = document.getElementById('calendarNext');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentCalendarMonth = this.addDays(this.currentCalendarMonth, 7);
                this.renderBookings();
            });
        }

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

        const deleteBtn = document.getElementById('deleteBookingBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (!this.currentEditingId) return;
                await this.deleteBooking(this.currentEditingId);
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('bookingModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
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
        if (this.filterMode === 'available') {
            bookingsToRender = bookingsToRender.filter(booking => {
                const playersNeeded = this.calculatePlayersNeeded(booking);
                return playersNeeded > 0;
            });
        } else if (this.filterMode === 'booked') {
            bookingsToRender = bookingsToRender.filter(booking => {
                const playersNeeded = this.calculatePlayersNeeded(booking);
                return playersNeeded === 0;
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

        this.renderCalendar(bookingsToRender);
    }

    renderCalendar(bookingsToRender) {
        const container = document.getElementById('bookingsList');
        const monthLabel = document.getElementById('calendarMonthLabel');

        const weekStart = this.getStartOfWeek(this.currentCalendarMonth);
        const weekEnd = this.addDays(weekStart, 6);

        if (monthLabel) {
            monthLabel.textContent = `${this.formatShortDate(weekStart)} - ${this.formatShortDate(weekEnd)}`;
        }

        const bookingsByDate = new Map();
        bookingsToRender.forEach(booking => {
            const key = booking.date;
            if (!bookingsByDate.has(key)) {
                bookingsByDate.set(key, []);
            }
            bookingsByDate.get(key).push(booking);
        });


        const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        let html = '<div class="week-view" id="weekView">';
        html += '<div class="week-header">';
        html += weekdayLabels
            .map((d, i) => {
                const date = this.addDays(weekStart, i);
                const isToday = this.toDateKey(date) === new Date().toISOString().split('T')[0];
                const pretty = this.formatDayDate(date);
                return `
                    <div class="week-header-cell ${isToday ? 'week-header-cell--today' : ''}">
                        <div class="week-header-dow">${d}</div>
                        <div class="week-header-date">${pretty}</div>
                    </div>
                `;
            })
            .join('');
        html += '</div>';

        html += '<div class="week-grid">';

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const cellDate = this.addDays(weekStart, dayIndex);
            const dateKey = this.toDateKey(cellDate);
            const events = bookingsByDate.has(dateKey) ? bookingsByDate.get(dateKey) : [];
            const isToday = dateKey === new Date().toISOString().split('T')[0];

            html += `<div class="week-day ${isToday ? 'week-day--today' : ''}">`;
            html += '<div class="calendar-events">';

            if (events.length > 0) {
                events
                    .slice()
                    .sort((a, b) => {
                        const timestampA = new Date(a.date + ' ' + a.startTime).getTime();
                        const timestampB = new Date(b.date + ' ' + b.startTime).getTime();
                        return timestampA - timestampB;
                    })
                    .forEach(booking => {
                        const startHour = this.formatHour(booking.startTime);
                        const durationMins = this.getBookingDurationMinutes(booking);
                        const title = `${startHour}${durationMins ? ` (${durationMins}m)` : ''} ${booking.courtType || ''}`.trim();
                        const playersNeeded = this.calculatePlayersNeeded(booking);
                        const courtNumber = booking.court ? booking.court.replace('Court ', '').trim() : '';
                        const bookedBy = booking.bookedBy ? booking.bookedBy.trim() : '';
                        const meta = `${bookedBy || 'Unknown'}${courtNumber ? ` (court ${courtNumber})` : ''}`;
                        const playersHtml = booking.players && booking.players.length > 0
                            ? booking.players
                                  .map((player, index) => {
                                      const playerClass = `player-${(index % 8) + 1}`;
                                      return `<span class="player-button ${playerClass}">${player}</span>`;
                                  })
                                  .join('')
                            : '';
                        html += `
                            <div class="calendar-event ${playersNeeded === 0 ? 'calendar-event--full' : ''}" data-id="${booking.id}" role="button" tabindex="0">
                                <div class="calendar-event-top">
                                    <div class="calendar-event-main">${title}</div>
                                </div>
                                <div class="calendar-event-meta">${meta}</div>
                                ${playersHtml ? `<div class="calendar-event-players">${playersHtml}</div>` : ''}
                            </div>
                        `;
                    });
            }

            html += '</div>';
            html += '</div>';
        }

        html += '</div>';

        if (bookingsToRender.length === 0) {
            html += `
                <div class="no-bookings">
                    <h3>${this.filterMode === 'available' ? 'No available slots' : this.filterMode === 'booked' ? 'No booked slots' : 'No bookings found'}</h3>
                    <p>${this.filterMode === 'available' ? 'All bookings are full!' : 'Create your first booking to get started.'}</p>
                </div>
            `;
        }

        html += '</div>';

        container.innerHTML = html;

        const weekView = document.getElementById('weekView');
        if (weekView) {
            this.attachWeekScrollNavigation(weekView);
        }

        container.querySelectorAll('.calendar-event[data-id]').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                this.editBooking(id);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const id = card.dataset.id;
                    this.editBooking(id);
                }
            });
        });
    }

    attachWeekScrollNavigation(weekViewEl) {
        if (this._weekScrollAttached) return;
        this._weekScrollAttached = true;

        let wheelAccum = 0;
        let wheelTimer = null;

        weekViewEl.addEventListener(
            'wheel',
            (e) => {
                const absX = Math.abs(e.deltaX);
                const absY = Math.abs(e.deltaY);

                if (absX <= absY) {
                    return;
                }

                e.preventDefault();

                wheelAccum += e.deltaX;
                clearTimeout(wheelTimer);
                wheelTimer = setTimeout(() => {
                    wheelAccum = 0;
                }, 250);

                const threshold = 140;
                if (wheelAccum > threshold) {
                    wheelAccum = 0;
                    this.currentCalendarMonth = this.addDays(this.currentCalendarMonth, 7);
                    this.renderBookings();
                } else if (wheelAccum < -threshold) {
                    wheelAccum = 0;
                    this.currentCalendarMonth = this.addDays(this.currentCalendarMonth, -7);
                    this.renderBookings();
                }
            },
            { passive: false }
        );

        let touchStartX = null;
        let touchStartY = null;

        weekViewEl.addEventListener(
            'touchstart',
            (e) => {
                const t = e.touches && e.touches[0];
                if (!t) return;
                touchStartX = t.clientX;
                touchStartY = t.clientY;
            },
            { passive: true }
        );

        weekViewEl.addEventListener(
            'touchend',
            (e) => {
                if (touchStartX == null || touchStartY == null) return;
                const t = e.changedTouches && e.changedTouches[0];
                if (!t) return;

                const dx = t.clientX - touchStartX;
                const dy = t.clientY - touchStartY;
                touchStartX = null;
                touchStartY = null;

                if (Math.abs(dx) <= Math.abs(dy)) return;

                const threshold = 60;
                if (dx < -threshold) {
                    this.currentCalendarMonth = this.addDays(this.currentCalendarMonth, 7);
                    this.renderBookings();
                } else if (dx > threshold) {
                    this.currentCalendarMonth = this.addDays(this.currentCalendarMonth, -7);
                    this.renderBookings();
                }
            },
            { passive: true }
        );
    }

    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = (day + 6) % 7;
        d.setDate(d.getDate() - diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    toDateKey(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    formatShortDate(date) {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }

    formatDayDate(date) {
        return date
            .toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
            .toUpperCase();
    }

    formatHour(time) {
        if (!time) return '';
        const hours = time.split(':')[0];
        return `${parseInt(hours, 10)}h`;
    }

    getBookingDurationMinutes(booking) {
        if (booking && booking.sessionLength) {
            const parsed = parseInt(booking.sessionLength, 10);
            if (!Number.isNaN(parsed)) return parsed;
        }

        if (!booking || !booking.startTime || !booking.endTime) return null;
        const start = new Date(`2000-01-01 ${booking.startTime}`);
        const end = new Date(`2000-01-01 ${booking.endTime}`);
        const diffMs = end - start;
        if (!Number.isFinite(diffMs) || diffMs <= 0) return null;
        return Math.round(diffMs / 60000);
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
        const deleteRow = document.getElementById('deleteRow');
        
        if (booking) {
            modalTitle.textContent = 'Edit Booking';
            this.currentEditingId = booking.id;
            if (deleteRow) deleteRow.style.display = 'flex';
            
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
            if (deleteRow) deleteRow.style.display = 'none';
            
            // Set default date to today
            document.getElementById('date').value = this.getDateString();
        }
        
        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('bookingModal');
        const deleteRow = document.getElementById('deleteRow');
        modal.style.display = 'none';
        document.getElementById('bookingForm').reset();
        this.currentEditingId = null;
        if (deleteRow) deleteRow.style.display = 'none';
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
            this.closeModal();
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
        const availability = this.filterMode === 'available' ? 'AVAILABLE' : this.filterMode === 'booked' ? 'BOOKED' : 'ALL';
        const courtType = this.courtTypeFilter === 'all' ? 'COURTS' : this.courtTypeFilter.toUpperCase();
        return `${availability} ${courtType}`;
    }

    async downloadForWhatsApp() {
        console.log('downloadForWhatsApp method started');
        try {
            // Filter bookings based on court filter only (download always includes booked + available)
            let bookingsToDownload = this.bookings;

            // Filter by court type
            if (this.courtTypeFilter !== 'all') {
                bookingsToDownload = bookingsToDownload.filter(booking => {
                    return booking.courtType.toLowerCase() === this.courtTypeFilter;
                });
            }

            // Only show bookings from today and beyond
            const todayKey = new Date().toISOString().split('T')[0];
            bookingsToDownload = bookingsToDownload.filter(booking => booking.date >= todayKey);
            
            // Sort bookings for display (Unix timestamps for accuracy)
            const sortedBookings = bookingsToDownload.sort((a, b) => {
                const timestampA = new Date(a.date + ' ' + a.startTime).getTime();
                const timestampB = new Date(b.date + ' ' + b.startTime).getTime();
                return timestampA - timestampB;
            });

            if (sortedBookings.length === 0) {
                alert('No upcoming bookings found!');
                return;
            }

            const bookedSlots = sortedBookings.filter(b => this.calculatePlayersNeeded(b) === 0);
            const availableSlots = sortedBookings.filter(b => this.calculatePlayersNeeded(b) > 0);

            const formatLine = (booking) => {
                const dateObj = new Date(booking.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = dateObj.getDate();
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                const timeDisplay = `${dayName} ${dayNumber}${this.getOrdinalSuffix(dayNumber)} ${monthName}`;
                const startHour = this.formatHour(booking.startTime);
                const durationMins = this.getBookingDurationMinutes(booking);
                const title = `${startHour}${durationMins ? ` (${durationMins}m)` : ''} ${booking.courtType || ''}`.trim();
                const courtNumber = booking.court ? booking.court.replace('Court ', '').trim() : '';
                const bookedByDisplay = booking.bookedBy || 'Unknown';
                const where = `${bookedByDisplay}${courtNumber ? ` (court ${courtNumber})` : ''}`;
                const playersNeeded = this.calculatePlayersNeeded(booking);
                const playersLine = booking.players && booking.players.length > 0 ? booking.players.join(' • ') : 'No players';
                const needLine = playersNeeded > 0 ? ` (${playersNeeded} still needed)` : '';

                return `*${timeDisplay}*\n${title}\n${where}\n👥 ${playersLine}${needLine}`;
            };

            let textContent = `🏸 RACQUET COURT BOOKINGS\n\n`;

            if (bookedSlots.length > 0) {
                textContent += `*NEXT GAMES*\n\n`;
                textContent += bookedSlots.map(formatLine).join('\n\n');
                textContent += '\n\n';
            }

            if (availableSlots.length > 0) {
                textContent += `*STILL TO FILL*\n\n`;
                textContent += availableSlots.map(formatLine).join('\n\n');
            }

            // Create and download the file
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
