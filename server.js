const express = require("express");
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

// requires the content in the models folder
const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// route that calls the the home page
app.use(express.static("public"));

// connects to the workout database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", {
	useNewUrlParser: true,
});

// route for the exercise page
app.get("/exercise", (req, res) => {
	res.sendFile(path.join(__dirname, "./public/exercise.html"));
});
// route for the stats page
app.get("/stats", (req, res) => {
	res.sendFile(path.join(__dirname, "./public/stats.html"));
});
// Route that call workout data from API
app.get("/api/workouts", (req, res) => {
	db.Workout.find({}, null, { sort: { day: 1 } })
		.populate("exercises")
		.then((dbWorkout) => {
			res.json(dbWorkout);
		})
		.catch((err) => {
			res.json(err);
		});
});

// Route to update workout data - referenced activity 14
app.put("/api/workouts/:id", (req, res) => {
	var workoutID = req.params.id;
	db.Exercise.create(req.body)
		.then(({ _id }) =>
			db.Workout.findOneAndUpdate(
				{ _id: workoutID },
				{ $push: { exercises: _id } },
				{ new: true }
			)
		)
		.then((dbWorkout) => {
			res.json(dbWorkout);
		})
		.catch((err) => {
			res.json(err);
		});
});

// Route to create new workout
app.post("/api/workouts", (req, res) => {
	db.Workout.create(req.body)
		.then((dbWorkout) => {
			res.json(dbWorkout);
		})
		.catch((err) => {
			res.json(err);
		});
});

// Route to populate workout dashboard
app.get("/api/workouts/range", (req, res) => {
	db.Workout.find({}, null, { sort: { day: 1 } })
		.populate("exercises")
		.then((dbWorkout) => {
			res.json(dbWorkout);
		})
		.catch((err) => {
			res.json(err);
		});
});

// Listens for server port
app.listen(PORT, () => {
	console.log(`App running on port ${PORT}!`);
});
