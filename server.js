
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const uri = "mongodb+srv://ritulprasad:Ritul%401234@cluster0.62ciuz2.mongodb.net/hotel?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

const reservationSchema = new mongoose.Schema({
    reservationId: String,
    name: String,
    contact: String,
    fooding: String,
    checkin:Date,
    checkout:Date,
    address:String,
    aadhar: String,

});

const Reservation = mongoose.model('Reservation', reservationSchema);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});


app.post('/signup', (req, res) => {
    const { fullName, email, password } = req.body;

    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            const user = new User({
                name: fullName,
                email,
                password: hashedPassword,
            });

            user.save()
                .then(() => {
                    res.sendFile(__dirname + '/login.html');
                })
                .catch(err => {
                    console.error('Error saving user:', err);
                    res.status(500).json({ error: 'An error occurred' });
                });
        }
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                // User not found
                res.send('<script>alert("User not found");window.history.back(); </script>');
            } else {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        res.status(500).json({ error: 'An error occurred' });
                    } else if (result) {
                        // Passwords match, proceed with login
                        res.sendFile(__dirname + '/facilities.html');
                    } else {
                        // Incorrect password
                        res.send('<script>alert("Incorrect password");window.history.back(); </script>');
                    }
                });
            }
        })
        .catch(err => {
            console.log('Error finding the user', err);
            res.status(500).json({ error: 'An error occurred' });
        });
});


app.get('/booking', (req, res) => {
    res.sendFile(__dirname + '/booking.html');
});

app.get('/cancel', (req, res) => {
    res.sendFile(__dirname + '/cancel.html');
});

app.get('/Payment', (req, res) => {
    res.sendFile(__dirname + '/Payment.html');
});

app.get('/Success', (req, res) => {
    res.sendFile(__dirname + '/Success.html');
});

// Room schema and model
const roomSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    booked: Boolean,
  });
  
  const Room = mongoose.model('Room', roomSchema);

  app.get('/rooms', (req, res) => {
    res.sendFile(__dirname + '/rooms.html');
});

  
  

  app.post('/book', async (req, res) => {
    const roomId = req.body.roomId;
  
    try {
      const room = await Room.findById(roomId);
  
      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }
  
      if (room.booked) {
        res.status(400).json({ error: 'Room is already booked' });
        return;
      }
  
      room.booked = true;
      await room.save();
  
      res.redirect('/rooms');
    } catch (error) {
      console.error('Error booking room:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });


app.post('/reservation', (req, res) => {
    const reservationId = shortid.generate();
    const {
        
        name ,
        contact,
        fooding,
        checkin,
        checkout,
        address,
        aadhar
    } = req.body;

    const reservation = new Reservation({
        reservationId,
        name,
        contact,
        fooding,
        checkin,
        checkout,
        address,
        aadhar,
        paymentDate: new Date(), // Add the payment date
    });

    reservation.save()
        .then(() => {
            res.render('Success.ejs', { reservation }); // Pass the reservation object to the view
        })
        .catch(err => {
            console.error('Error saving reservation:', err);
            res.status(500).json({ error: 'An error occurred' });
        });
});





app.get('/facilities.html', (req, res) => {
    res.sendFile(__dirname + '/facilities.html');
});





app.post('/cancel-reservation', (req, res) => {
    const { reservationId } = req.body;

    Reservation.findOneAndDelete({ reservationId })
        .then(deletedReservation => {
            if (!deletedReservation) {
                // No reservation found
                res.send('<script>alert("No reservation found");window.history.back();</script>');
            } else {
                res.sendFile(__dirname + '/CancelSuccess.html');
            }
        })
        .catch(err => {
            console.error('Error canceling reservation:', err);
            res.status(500).json({ error: 'An error occurred' });
        });
});



app.get('*', (req, res) => {
    res.status(404).send('404 - Not Found');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
