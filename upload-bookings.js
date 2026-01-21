// Upload bookings to Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDklNMETqvQctyioT5PQWbqD1Q0pHdYXo4",
  authDomain: "bookmaster-booking.firebaseapp.com",
  projectId: "bookmaster-booking",
  storageBucket: "bookmaster-booking.firebasestorage.app",
  messagingSenderId: "887763262438",
  appId: "1:887763262438:web:8108ec31e10b9dc8b81427"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Bookings to upload
const bookings = [
    {
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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

// Clear existing bookings and upload new ones
async function uploadBookings() {
    try {
        console.log('Clearing existing bookings...');
        
        // Clear existing bookings
        const snapshot = await db.collection('bookings').get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        console.log('Existing bookings cleared. Uploading new bookings...');
        
        // Upload new bookings
        const uploadBatch = db.batch();
        bookings.forEach(booking => {
            const docRef = db.collection('bookings').doc();
            uploadBatch.set(docRef, booking);
        });
        await uploadBatch.commit();
        
        console.log('Successfully uploaded', bookings.length, 'bookings to Firebase!');
        console.log('Bookings are now live on the site!');
        
    } catch (error) {
        console.error('Error uploading bookings:', error);
    }
}

// Run the upload
uploadBookings();
