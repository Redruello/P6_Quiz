const Sequelize = require("sequelize");
const { models } = require("../models");

let score = 0;
let randomlength = 0;

// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quizzes.findById(quizId)
        .then(quiz => {
            if (quiz) {
                req.quiz = quiz;
                next();
            } else {
                throw new Error('There is no quiz with id=' + quizId);
            }
        })
        .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quizzes.findAll()
        .then(quizzes => {
            res.render('quizzes/index.ejs', { quizzes });
        })
        .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const { quiz } = req;

    res.render('quizzes/show', { quiz });
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "",
        answer: ""
    };

    res.render('quizzes/new', { quiz });
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const { question, answer } = req.body;

    const quiz = models.quizzes.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({ fields: ["question", "answer"] })
        .then(quiz => {
            req.flash('success', 'Quiz created successfully.');
            res.redirect('/quizzes/' + quiz.id);
        })
        .catch(Sequelize.ValidationError, error => {
            req.flash('error', 'There are errors in the form:');
            error.errors.forEach(({ message }) => req.flash('error', message));
            res.render('quizzes/new', { quiz });
        })
        .catch(error => {
            req.flash('error', 'Error creating a new Quiz: ' + error.message);
            next(error);
        });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const { quiz } = req;

    res.render('quizzes/edit', { quiz });
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const { quiz, body } = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({ fields: ["question", "answer"] })
        .then(quiz => {
            req.flash('success', 'Quiz edited successfully.');
            res.redirect('/quizzes/' + quiz.id);
        })
        .catch(Sequelize.ValidationError, error => {
            req.flash('error', 'There are errors in the form:');
            error.errors.forEach(({ message }) => req.flash('error', message));
            res.render('quizzes/edit', { quiz });
        })
        .catch(error => {
            req.flash('error', 'Error editing the Quiz: ' + error.message);
            next(error);
        });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
        .then(() => {
            req.flash('success', 'Quiz deleted successfully.');
            res.redirect('/quizzes');
        })
        .catch(error => {
            req.flash('error', 'Error deleting the Quiz: ' + error.message);
            next(error);
        });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const { quiz, query } = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const { quiz, query } = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};


let prueba = true;
// GET /quizzes/randomplay
exports.randomplay = (req, res, next) => {

    let toBeResolved = [];
    
    //score = 0;
    //req.session.score = 0;

    models.quizzes.findAll()
        .then(quizzes => {

            console.log('----ENTRA--Si--');

            if (prueba){

                req.session.score = 0;
                
                req.session.randomplay = quizzes;
        
                toBeResolved = quizzes;
               
                req.session.randomlength = quizzes.length;
        
                //prueba = false;    
            }
        
            prueba = true; 
            

            if (req.session.randomplay == undefined) {

                //req.session.score = 0;
                console.log('----2ENTRA----');

                req.session.randomplay = quizzes;

                toBeResolved = quizzes;

                req.session.randomlength = quizzes.length;

            }

            if (toBeResolved.length == 0) {
                toBeResolved = quizzes;
                //req.session.score = 0;
            }

            if (quizzes) {

                if (toBeResolved != 0) {

                    console.log('----3ENTRA----');

                    let rand = parseInt(Math.random() * toBeResolved.length);

                    let quiz = toBeResolved[rand];

                    toBeResolved.splice(rand, 1);

                    score = req.session.score;

                    res.render('quizzes/random_play', {
                        quiz,
                        score
                    });


                }

            } else {
                throw new Error('No quizzes');
            }

        })

};


// GET /quizzes/randomcheck/:quizId?answer=respuesta
exports.randomcheck = (req, res, next) => {

    const { quiz, query } = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();



    if (result) {

        if (req.session.randomlength <= 1) {

            score++;
            req.session.score = 0;
            req.session.randomplay = undefined;

            res.render('quizzes/random_nomore', {
                score
            })
        } else {
            req.session.score++;
            req.session.randomlength--;
            score = req.session.score;
            prueba = false;

            res.render('quizzes/random_result', {
                score,
                answer,
                result
            })
        }
    } else {

        score = 0;
        req.session.score = 0;
        req.session.randomplay = undefined;
        
        res.render('quizzes/random_result', {
            score,
            answer,
            result
        })
    }

};
