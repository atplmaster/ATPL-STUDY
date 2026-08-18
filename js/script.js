// ========================================
// ATPL STUDY PLATFORM
// COMPLETE VERSION
// ========================================


// ========================================
// GLOBAL VARIABLES
// ========================================

let questions = [];
let current = 0;
let status = [];
let quizMode = false;

let currentSubject = "";


// ========================================
// SUBJECTS
// ========================================

const subjectNames = {
    meteorology: "Meteorology",
    airlaw: "Air Law",
    operational: "Operational Procedures"
};

const subjectFiles = [
    "meteorology",
    "airlaw",
    "operational"
];


// ========================================
// SCREEN CONTROL
// ========================================

function showOnly(screenId) {

    const screens = [
        "loginScreen",
        "accessRequestScreen",
        "homeScreen",
        "adminScreen",
        "practiceSetup",
        "quizSetup",
        "combinedQuizSetup",
        "searchScreen",
        "markedScreen",
        "quizScreen",
        "resultsScreen"
    ];

    screens.forEach(function(id) {

        const element = document.getElementById(id);

        if (element) {
            element.style.display = "none";
        }

    });

    const selected = document.getElementById(screenId);

    if (selected) {
        selected.style.display = "block";
    }

}


// ========================================
// HOME - PRACTICE
// ========================================

document.getElementById("practiceBtn").onclick = function() {

    showOnly("practiceSetup");

};


// ========================================
// START PRACTICE
// ========================================

document.getElementById("startPracticeBtn").onclick = function() {

    quizMode = false;

    const subjectFile =
        document.getElementById("practiceSubjectSelect").value;

    showOnly("quizScreen");

    loadPracticeQuestions(subjectFile);

};


// ========================================
// PRACTICE BACK
// ========================================

document.getElementById("practiceBackBtn").onclick = function() {

    showOnly("homeScreen");

};


// ========================================
// SUBJECT QUIZ
// ========================================

document.getElementById("subjectQuizBtn").onclick = function() {

    showOnly("quizSetup");

};


// ========================================
// START SUBJECT QUIZ
// ========================================

document.getElementById("startQuizBtn").onclick = function() {

    quizMode = true;

    const subjectFile =
        document.getElementById("subjectSelect").value;

    const numberOfQuestions =
        document.getElementById("questionCount").value;

    showOnly("quizScreen");

    loadSubjectQuiz(
        subjectFile,
        numberOfQuestions
    );

};


// ========================================
// SUBJECT QUIZ BACK
// ========================================

document.getElementById("backHomeBtn").onclick = function() {

    showOnly("homeScreen");

};


// ========================================
// COMBINED QUIZ
// ========================================

document.getElementById("combinedQuizBtn").onclick = function() {

    showOnly("combinedQuizSetup");

    loadCombinedQuestionCount();

};


// ========================================
// COMBINED BACK
// ========================================

document.getElementById("combinedBackBtn").onclick = function() {

    showOnly("homeScreen");

};


// ========================================
// LOAD COMBINED QUESTION COUNT
// ========================================

async function loadCombinedQuestionCount() {

    let totalQuestions = 0;

    try {

        for (const file of subjectFiles) {

            const response =
                await fetch("data/" + file + ".json");

            if (!response.ok) {

                throw new Error(
                    "Unable to load " + file + ".json"
                );

            }

            const data =
                await response.json();

            totalQuestions += data.length;

        }

        document.getElementById(
            "availableQuestions"
        ).innerHTML =
            "Available questions: <strong>" +
            totalQuestions +
            "</strong>";

        updateCombinedQuestionOptions(
            totalQuestions
        );

    } catch (error) {

        console.error(
            "Combined question count error:",
            error
        );

        document.getElementById(
            "availableQuestions"
        ).innerHTML =
            "Unable to load questions.";

    }

}


// ========================================
// UPDATE COMBINED OPTIONS
// ========================================

function updateCombinedQuestionOptions(totalQuestions) {

    const select =
        document.getElementById(
            "combinedQuestionCount"
        );

    if (!select) {
        return;
    }

    select.querySelectorAll("option").forEach(
        function(option) {

            if (option.value === "all") {
                return;
            }

            const number =
                parseInt(option.value, 10);

            option.disabled =
                number > totalQuestions;

        }
    );

}


// ========================================
// START COMBINED QUIZ
// ========================================

document.getElementById("startCombinedBtn").onclick = function() {

    const questionCount =
        document.getElementById(
            "combinedQuestionCount"
        ).value;

    loadCombinedQuiz(questionCount);

};


// ========================================
// LOAD PRACTICE QUESTIONS
// ========================================

async function loadPracticeQuestions(subjectFile) {

    try {

        currentSubject = subjectFile;

        const response =
            await fetch(
                "data/" + subjectFile + ".json"
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load questions."
            );

        }

        questions =
            await response.json();

        questions.forEach(function(question) {

            question.subject =
                subjectFile;

        });

        status =
            new Array(questions.length)
                .fill("notAttempted");

        current = 0;

        document.getElementById(
            "subject"
        ).innerHTML =
            subjectNames[subjectFile];

        createNavigator();

        showQuestion();

        await loadSavedProgress(subjectFile);

    } catch (error) {

        console.error(
            "Practice loading error:",
            error
        );

        alert(
            "Error loading practice questions."
        );

    }

}


// ========================================
// LOAD SUBJECT QUIZ
// ========================================

async function loadSubjectQuiz(
    subjectFile,
    numberOfQuestions
) {

    try {

        currentSubject = subjectFile;

        const response =
            await fetch(
                "data/" + subjectFile + ".json"
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load questions."
            );

        }

        let allQuestions =
            await response.json();

        allQuestions.forEach(function(question) {

            question.subject =
                subjectFile;

        });

        allQuestions.sort(function() {

            return Math.random() - 0.5;

        });

        if (numberOfQuestions === "all") {

            questions =
                allQuestions;

        } else {

            questions =
                allQuestions.slice(
                    0,
                    parseInt(
                        numberOfQuestions,
                        10
                    )
                );

        }

        status =
            new Array(questions.length)
                .fill("notAttempted");

        current = 0;

        document.getElementById(
            "subject"
        ).innerHTML =
            subjectNames[subjectFile] +
            " QUIZ";

        createNavigator();

        showQuestion();

    } catch (error) {

        console.error(
            "Subject quiz loading error:",
            error
        );

        alert(
            "Error loading subject quiz."
        );

    }

}


// ========================================
// LOAD COMBINED QUIZ
// ========================================

async function loadCombinedQuiz(questionCount) {

    const combinedQuestions = [];

    try {

        for (const file of subjectFiles) {

            const response =
                await fetch(
                    "data/" + file + ".json"
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load " +
                    file +
                    ".json"
                );

            }

            const data =
                await response.json();

            data.forEach(function(question) {

                question.subject =
                    file;

                combinedQuestions.push(
                    question
                );

            });

        }

        combinedQuestions.sort(function() {

            return Math.random() - 0.5;

        });

        if (questionCount === "all") {

            questions =
                combinedQuestions;

        } else {

            questions =
                combinedQuestions.slice(
                    0,
                    parseInt(
                        questionCount,
                        10
                    )
                );

        }

        status =
            new Array(questions.length)
                .fill("notAttempted");

        current = 0;

        quizMode = true;

        showOnly("quizScreen");

        document.getElementById(
            "subject"
        ).innerHTML =
            "COMBINED ATPL QUIZ";

        createNavigator();

        showQuestion();

    } catch (error) {

        console.error(
            "Combined quiz error:",
            error
        );

        alert(
            "Error loading combined quiz."
        );

    }

}


// ========================================
// CREATE QUESTION NAVIGATOR
// ========================================

function createNavigator() {

    const nav =
        document.getElementById(
            "navigator"
        );

    if (!nav) {
        return;
    }

    nav.innerHTML = "";

    questions.forEach(
        function(question, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.innerHTML =
                index + 1;

            button.className =
                "navButton " +
                status[index];

            button.onclick =
                function() {

                    current = index;

                    showQuestion();

                };

            nav.appendChild(
                button
            );

        }
    );

}


// ========================================
// SHOW QUESTION
// ========================================

async function showQuestion() {

    if (!questions.length) {
        return;
    }

    const question =
        questions[current];

    document.getElementById(
        "counter"
    ).innerHTML =
        "Question " +
        (current + 1) +
        " of " +
        questions.length;


    // ========================================
    // QUESTION TEXT
    // ========================================

    document.getElementById(
        "question"
    ).innerHTML =
        question.question;


    // ========================================
    // QUESTION IMAGES
    // ========================================

    const questionImages =
        document.getElementById(
            "questionImages"
        );

    questionImages.innerHTML = "";


    if (
        question.images &&
        question.images.length
    ) {

        question.images.forEach(
            function(src) {

                const img =
                    document.createElement(
                        "img"
                    );

                img.src = src;

                img.alt =
                    "Question figure";

                img.className =
                    "question-figure";

                img.loading =
                    "lazy";

                img.onerror =
                    function() {

                        console.error(
                            "Image failed to load:",
                            src
                        );

                    };

                img.onclick =
                    function() {

                        window.open(
                            src,
                            "_blank"
                        );

                    };

                questionImages.appendChild(
                    img
                );

            }
        );

        questionImages.style.display =
            "flex";

    } else {

        questionImages.style.display =
            "none";

    }


    // ========================================
    // MARK BUTTON
    // ========================================

    await updateMarkButton(
        question
    );


    // ========================================
    // ANSWERS
    // ========================================

    const answers =
        document.getElementById(
            "answers"
        );

    answers.innerHTML = "";


    question.options.forEach(
        function(option, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "option";

            button.innerHTML =
                option;


            // ========================================
            // SHOW PREVIOUS ANSWER
            // ========================================

            if (
                status[current] ===
                "correct"
            ) {

                if (
                    index ===
                    question.answer
                ) {

                    button.classList.add(
                        "correct"
                    );

                }

            }


            if (
                status[current] ===
                "wrong"
            ) {

                if (
                    index ===
                    question.answer
                ) {

                    button.classList.add(
                        "correct"
                    );

                }

            }


            // ========================================
            // ANSWER CLICK
            // ========================================

            button.onclick =
                async function() {

                    if (
                        status[current] ===
                        "correct" ||
                        status[current] ===
                        "wrong"
                    ) {

                        return;

                    }


                    let questionStatus;


                    if (
                        index ===
                        question.answer
                    ) {

                        button.classList.add(
                            "correct"
                        );

                        status[current] =
                            "correct";

                        questionStatus =
                            "correct";

                    } else {

                        button.classList.add(
                            "wrong"
                        );

                        status[current] =
                            "wrong";

                        questionStatus =
                            "wrong";


                        const allButtons =
                            answers.querySelectorAll(
                                ".option"
                            );


                        if (
                            allButtons[
                                question.answer
                            ]
                        ) {

                            allButtons[
                                question.answer
                            ].classList.add(
                                "correct"
                            );

                        }

                    }


                    await saveProgress(
                        question,
                        current,
                        questionStatus
                    );


                    createNavigator();

                };


            answers.appendChild(
                button
            );

        }
    );

}


// ========================================
// NEXT BUTTON
// ========================================

document.getElementById(
    "nextBtn"
).onclick =
function() {

    if (
        current <
        questions.length - 1
    ) {

        current++;

        showQuestion();

    } else {

        if (quizMode) {

            showResults();

        }

    }

};


// ========================================
// PREVIOUS BUTTON
// ========================================

document.getElementById(
    "prevBtn"
).onclick =
function() {

    if (current > 0) {

        current--;

        showQuestion();

    }

};


// ========================================
// SKIP BUTTON
// ========================================

document.getElementById(
    "skipBtn"
).onclick =
function() {

    status[current] =
        "skipped";

    if (
        current <
        questions.length - 1
    ) {

        current++;

        showQuestion();

    }

    createNavigator();

};


// ========================================
// BACK TO MENU
// ========================================

document.getElementById(
    "questionBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ========================================
// RESULTS
// ========================================

function showResults() {

    let correct = 0;
    let wrong = 0;
    let skipped = 0;


    status.forEach(
        function(result) {

            if (
                result ===
                "correct"
            ) {
                correct++;
            }

            if (
                result ===
                "wrong"
            ) {
                wrong++;
            }

            if (
                result ===
                "skipped"
            ) {
                skipped++;
            }

        }
    );


    const total =
        questions.length;


    const percentage =
        total > 0
            ? Math.round(
                (correct / total) *
                100
            )
            : 0;


    showOnly(
        "resultsScreen"
    );


    document.getElementById(
        "resultScore"
    ).innerHTML =
        "<h1>" +
        percentage +
        "%</h1>";


    document.getElementById(
        "resultDetails"
    ).innerHTML =
        "<p>Correct: " +
        correct +
        "</p>" +

        "<p>Wrong: " +
        wrong +
        "</p>" +

        "<p>Skipped: " +
        skipped +
        "</p>" +

        "<p>Total Questions: " +
        total +
        "</p>";

}


// ========================================
// REVIEW ANSWERS
// ========================================

document.getElementById(
    "reviewBtn"
).onclick =
function() {

    current = 0;

    showOnly(
        "quizScreen"
    );

    showQuestion();

};


// ========================================
// RESULTS HOME
// ========================================

document.getElementById(
    "resultsHomeBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ========================================
// CREATE ACCOUNT
// ========================================

document.getElementById(
    "signupBtn"
).onclick =
async function() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        ).value;

    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!email || !password) {

        message.innerHTML =
            "Please enter your email and password.";

        return;

    }


    if (password.length < 6) {

        message.innerHTML =
            "Password must be at least 6 characters.";

        return;

    }


    message.innerHTML =
        "Creating account...";


    try {

        const {
            error
        } =
            await supabaseClient.auth.signUp({

                email:
                    email,

                password:
                    password

            });


        if (error) {

            console.error(
                "Signup error:",
                error
            );

            message.innerHTML =
                error.message;

            return;

        }


        message.innerHTML =
            "Account created successfully. You can now log in.";


    } catch (error) {

        console.error(
            "Unexpected signup error:",
            error
        );

        message.innerHTML =
            "Unable to create account.";

    }

};


// ========================================
// LOGIN
// ========================================

document.getElementById(
    "loginBtn"
).onclick =
async function() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        ).value;

    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!email || !password) {

        message.innerHTML =
            "Please enter your email and password.";

        return;

    }


    message.innerHTML =
        "Logging in...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email:
                    email,

                password:
                    password

            });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            message.innerHTML =
                error.message;

            return;

        }


        if (
            !data ||
            !data.user
        ) {

            message.innerHTML =
                "Login failed.";

            return;

        }


        // ========================================
        // CHECK APPROVAL
        // ========================================

        const {
            data: approvedUser,
            error: approvalError
        } =
            await supabaseClient
                .from("approved_users")
                .select("email")
                .eq(
                    "email",
                    email
                )
                .maybeSingle();


        if (approvalError) {

            console.error(
                "Approval check error:",
                approvalError
            );

            await supabaseClient.auth.signOut();

            message.innerHTML =
                "Unable to verify account approval.";

            return;

        }


        if (!approvedUser) {

            await supabaseClient.auth.signOut();

            message.innerHTML =
                "Your account has not been approved yet. Please request access.";

            return;

        }


        message.innerHTML =
            "Login successful.";


        showOnly(
            "homeScreen"
        );


        await checkAdminAccess();


    } catch (error) {

        console.error(
            "Unexpected login error:",
            error
        );

        message.innerHTML =
            "Login failed. Please try again.";

    }

};


// ========================================
// SAVE PROGRESS
// ========================================

async function saveProgress(
    question,
    questionIndex,
    questionStatus
) {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        if (!question.id) {

            console.error(
                "Question has no ID:",
                question
            );

            return;

        }


        const questionId =
            question.id;

        const subject =
            question.subject ||
            "unknown";


        const {
            data: existing,
            error: findError
        } =
            await supabaseClient
                .from("progress")
                .select("id")
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "question_id",
                    questionId
                )
                .maybeSingle();


        if (findError) {

            console.error(
                "Progress lookup error:",
                findError
            );

            return;

        }


        if (existing) {

            const {
                error
            } =
                await supabaseClient
                    .from("progress")
                    .update({

                        subject:
                            subject,

                        question_index:
                            questionIndex,

                        status:
                            questionStatus,

                        updated_at:
                            new Date().toISOString()

                    })
                    .eq(
                        "id",
                        existing.id
                    );


            if (error) {

                console.error(
                    "Progress update error:",
                    error
                );

            }


        } else {

            const {
                error
            } =
                await supabaseClient
                    .from("progress")
                    .insert({

                        user_id:
                            user.id,

                        question_id:
                            questionId,

                        subject:
                            subject,

                        question_index:
                            questionIndex,

                        status:
                            questionStatus

                    });


            if (error) {

                console.error(
                    "Progress insert error:",
                    error
                );

            }

        }

    } catch (error) {

        console.error(
            "Unexpected progress error:",
            error
        );

    }

}


// ========================================
// LOAD SAVED PROGRESS
// ========================================

async function loadSavedProgress(subject) {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("progress")
                .select(
                    "question_id,status"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "subject",
                    subject
                );


        if (error) {

            console.error(
                "Progress loading error:",
                error
            );

            return;

        }


        if (data) {

            data.forEach(
                function(record) {

                    const index =
                        questions.findIndex(
                            function(question) {

                                return (
                                    question.id ===
                                    record.question_id
                                );

                            }
                        );


                    if (index !== -1) {

                        status[index] =
                            record.status;

                    }

                }
            );

        }


        createNavigator();


    } catch (error) {

        console.error(
            "Unexpected progress loading error:",
            error
        );

    }

}


// ========================================
// ⭐ MARK / UNMARK QUESTION
// ========================================

document.getElementById(
    "markQuestionBtn"
).onclick =
async function() {

    if (!questions.length) {
        return;
    }

    const question =
        questions[current];

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            alert(
                "Please log in first."
            );

            return;

        }


        if (!question.id) {

            alert(
                "This question does not have an ID."
            );

            return;

        }


        const {
            data: existing,
            error: checkError
        } =
            await supabaseClient
                .from("marked_questions")
                .select("id")
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "question_id",
                    question.id
                )
                .maybeSingle();


        if (checkError) {

            console.error(
                "Mark check error:",
                checkError
            );

            alert(
                "Unable to check marked question."
            );

            return;

        }


        if (existing) {

            const {
                error
            } =
                await supabaseClient
                    .from("marked_questions")
                    .delete()
                    .eq(
                        "id",
                        existing.id
                    );


            if (error) {

                console.error(
                    "Unmark error:",
                    error
                );

                alert(
                    "Unable to unmark question."
                );

                return;

            }


        } else {

            const {
                error
            } =
                await supabaseClient
                    .from("marked_questions")
                    .insert({

                        user_id:
                            user.id,

                        question_id:
                            question.id,

                        subject:
                            question.subject,

                        marked_at:
                            new Date().toISOString()

                    });


            if (error) {

                console.error(
                    "Mark error:",
                    error
                );

                alert(
                    "Unable to mark question."
                );

                return;

            }

        }


        await updateMarkButton(
            question
        );


    } catch (error) {

        console.error(
            "Unexpected mark error:",
            error
        );

    }

};


// ========================================
// UPDATE MARK BUTTON
// ========================================

async function updateMarkButton(question) {

    const button =
        document.getElementById(
            "markQuestionBtn"
        );

    if (!button) {
        return;
    }


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user || !question.id) {

            button.innerHTML =
                "⭐ Mark Question";

            return;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("marked_questions")
                .select("id")
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "question_id",
                    question.id
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Mark status error:",
                error
            );

            return;

        }


        if (data) {

            button.innerHTML =
                "⭐ Unmark Question";

        } else {

            button.innerHTML =
                "⭐ Mark Question";

        }


    } catch (error) {

        console.error(
            "Unexpected mark status error:",
            error
        );

    }

}


// ========================================
// ⭐ MARKED QUESTIONS BUTTON
// ========================================

document.getElementById(
    "markedBtn"
).onclick =
async function() {

    showOnly(
        "markedScreen"
    );

    await loadMarkedQuestions();

};


// ========================================
// LOAD MARKED QUESTIONS
// ========================================

async function loadMarkedQuestions() {

    const container =
        document.getElementById(
            "markedQuestionsList"
        );

    container.innerHTML =
        "Loading marked questions...";


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            container.innerHTML =
                "Please log in first.";

            return;

        }


        const {
            data: marked,
            error
        } =
            await supabaseClient
                .from("marked_questions")
                .select(
                    "id, question_id, subject, marked_at"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "marked_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Marked questions error:",
                error
            );

            container.innerHTML =
                "Unable to load marked questions.";

            return;

        }


        if (
            !marked ||
            marked.length === 0
        ) {

            container.innerHTML =
                "<p>You have no marked questions yet.</p>";

            return;

        }


        // ========================================
        // LOAD ALL SUBJECT JSON FILES
        // ========================================

        const questionMap = {};


        for (const file of subjectFiles) {

            try {

                const response =
                    await fetch(
                        "data/" +
                        file +
                        ".json"
                    );


                if (!response.ok) {
                    continue;
                }


                const data =
                    await response.json();


                data.forEach(
                    function(question) {

                        questionMap[
                            question.id
                        ] = question;

                    }
                );


            } catch (error) {

                console.error(
                    "Unable to load " +
                    file +
                    ".json:",
                    error
                );

            }

        }


        container.innerHTML = "";


        // ========================================
        // DISPLAY MARKED QUESTIONS
        // ========================================

        marked.forEach(
            function(record) {

                const question =
                    questionMap[
                        record.question_id
                    ];


                const box =
                    document.createElement(
                        "div"
                    );


                box.className =
                    "marked-question";


                if (!question) {

                    box.innerHTML =
                        "<p><strong>Question ID:</strong> " +
                        escapeHTML(
                            record.question_id
                        ) +
                        "</p>" +
                        "<p>Question could not be loaded.</p>";

                    container.appendChild(
                        box
                    );

                    return;

                }


                question.subject =
                    record.subject;


                // ========================================
                // SUBJECT
                // ========================================

                const subjectTitle =
                    document.createElement(
                        "h4"
                    );


                subjectTitle.innerHTML =
                    subjectNames[
                        record.subject
                    ] ||
                    record.subject;


                box.appendChild(
                    subjectTitle
                );


                // ========================================
                // QUESTION
                // ========================================

                const questionText =
                    document.createElement(
                        "div"
                    );


                questionText.innerHTML =
                    "<strong>" +
                    escapeHTML(
                        question.question
                    ) +
                    "</strong>";


                box.appendChild(
                    questionText
                );


                // ========================================
                // IMAGES
                // ========================================

                if (
                    question.images &&
                    question.images.length
                ) {

                    const imageContainer =
                        document.createElement(
                            "div"
                        );


                    imageContainer.className =
                        "question-images";


                    question.images.forEach(
                        function(src) {

                            const img =
                                document.createElement(
                                    "img"
                                );


                            img.src =
                                src;


                            img.alt =
                                "Question figure";


                            img.className =
                                "question-figure";


                            img.loading =
                                "lazy";


                            img.onclick =
                                function() {

                                    window.open(
                                        src,
                                        "_blank"
                                    );

                                };


                            imageContainer.appendChild(
                                img
                            );

                        }
                    );


                    box.appendChild(
                        imageContainer
                    );

                }


                // ========================================
                // OPTIONS
                // ========================================

                const optionsContainer =
                    document.createElement(
                        "div"
                    );


                question.options.forEach(
                    function(option, index) {

                        const optionDiv =
                            document.createElement(
                                "div"
                            );


                        optionDiv.className =
                            "marked-option";


                        optionDiv.innerHTML =
                            String.fromCharCode(
                                65 + index
                            ) +
                            ". " +
                            escapeHTML(
                                option
                            );


                        if (
                            index ===
                            question.answer
                        ) {

                            optionDiv.classList.add(
                                "correct"
                            );

                        }


                        optionsContainer.appendChild(
                            optionDiv
                        );

                    }
                );


                box.appendChild(
                    optionsContainer
                );


                // ========================================
                // OPEN QUESTION BUTTON
                // ========================================

                const openButton =
                    document.createElement(
                        "button"
                    );


                openButton.innerHTML =
                    "Open Question";


                openButton.className =
                    "modeButton";


                openButton.onclick =
                    function() {

                        questions =
                            [question];

                        status =
                            ["notAttempted"];

                        current =
                            0;

                        quizMode =
                            false;

                        currentSubject =
                            record.subject;


                        showOnly(
                            "quizScreen"
                        );


                        document.getElementById(
                            "subject"
                        ).innerHTML =
                            subjectNames[
                                record.subject
                            ];


                        createNavigator();

                        showQuestion();

                    };


                box.appendChild(
                    openButton
                );


                // ========================================
                // REMOVE MARK
                // ========================================

                const removeButton =
                    document.createElement(
                        "button"
                    );


                removeButton.innerHTML =
                    "Remove Mark";


                removeButton.className =
                    "backButton";


                removeButton.onclick =
                    async function() {

                        const {
                            error
                        } =
                            await supabaseClient
                                .from(
                                    "marked_questions"
                                )
                                .delete()
                                .eq(
                                    "id",
                                    record.id
                                );


                        if (error) {

                            console.error(
                                "Remove mark error:",
                                error
                            );

                            alert(
                                "Unable to remove mark."
                            );

                            return;

                        }


                        await loadMarkedQuestions();

                    };


                box.appendChild(
                    removeButton
                );


                container.appendChild(
                    box
                );

            }
        );


    } catch (error) {

        console.error(
            "Unexpected marked questions error:",
            error
        );

        container.innerHTML =
            "Unable to load marked questions.";

    }

}


// ========================================
// MARKED BACK
// ========================================

document.getElementById(
    "markedBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ========================================
// 🔎 SEARCH BUTTON
// ========================================

document.getElementById(
    "searchBtn"
).onclick =
function() {

    showOnly(
        "searchScreen"
    );

    document.getElementById(
        "searchInput"
    ).focus();

};


// ========================================
// SEARCH BUTTON
// ========================================

document.getElementById(
    "searchQuestionsBtn"
).onclick =
async function() {

    await performSearch();

};


// ========================================
// SEARCH WHEN ENTER IS PRESSED
// ========================================

document.getElementById(
    "searchInput"
).addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            performSearch();

        }

    }
);


// ========================================
// PERFORM SEARCH
// ========================================

async function performSearch() {

    const searchText =
        document.getElementById(
            "searchInput"
        ).value
        .trim()
        .toLowerCase();


    const selectedSubject =
        document.getElementById(
            "searchSubject"
        ).value;


    const resultsContainer =
        document.getElementById(
            "searchResults"
        );


    if (!searchText) {

        resultsContainer.innerHTML =
            "<p>Please enter something to search.</p>";

        return;

    }


    resultsContainer.innerHTML =
        "Searching...";


    const results = [];


    try {

        for (
            const subjectFile
            of subjectFiles
        ) {

            if (
                selectedSubject !==
                "all" &&
                selectedSubject !==
                subjectFile
            ) {

                continue;

            }


            const response =
                await fetch(
                    "data/" +
                    subjectFile +
                    ".json"
                );


            if (!response.ok) {
                continue;
            }


            const data =
                await response.json();


            data.forEach(
                function(question) {

                    const questionText =
                        String(
                            question.question ||
                            ""
                        ).toLowerCase();


                    const optionsText =
                        (
                            question.options ||
                            []
                        )
                        .join(" ")
                        .toLowerCase();


                    const idText =
                        String(
                            question.id ||
                            ""
                        ).toLowerCase();


                    if (
                        questionText.includes(
                            searchText
                        ) ||
                        optionsText.includes(
                            searchText
                        ) ||
                        idText.includes(
                            searchText
                        )
                    ) {

                        question.subject =
                            subjectFile;


                        results.push(
                            question
                        );

                    }

                }
            );

        }


        displaySearchResults(
            results
        );


    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        resultsContainer.innerHTML =
            "Unable to search questions.";

    }

}


// ========================================
// DISPLAY SEARCH RESULTS
// ========================================

function displaySearchResults(results) {

    const container =
        document.getElementById(
            "searchResults"
        );


    if (
        !results ||
        results.length === 0
    ) {

        container.innerHTML =
            "<p>No questions found.</p>";

        return;

    }


    container.innerHTML =
        "<p><strong>" +
        results.length +
        "</strong> question(s) found.</p>";


    results.forEach(
        function(question) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "search-result";


            // ========================================
            // SUBJECT
            // ========================================

            const subject =
                document.createElement(
                    "h4"
                );


            subject.innerHTML =
                subjectNames[
                    question.subject
                ] ||
                question.subject;


            box.appendChild(
                subject
            );


            // ========================================
            // QUESTION
            // ========================================

            const text =
                document.createElement(
                    "div"
                );


            text.innerHTML =
                "<strong>" +
                escapeHTML(
                    question.question
                ) +
                "</strong>";


            box.appendChild(
                text
            );


            // ========================================
            // IMAGES
            // ========================================

            if (
                question.images &&
                question.images.length
            ) {

                const imageContainer =
                    document.createElement(
                        "div"
                    );


                imageContainer.className =
                    "question-images";


                question.images.forEach(
                    function(src) {

                        const img =
                            document.createElement(
                                "img"
                            );


                        img.src =
                            src;


                        img.alt =
                            "Question figure";


                        img.className =
                            "question-figure";


                        img.loading =
                            "lazy";


                        img.onclick =
                            function() {

                                window.open(
                                    src,
                                    "_blank"
                                );

                            };


                        imageContainer.appendChild(
                            img
                        );

                    }
                );


                box.appendChild(
                    imageContainer
                );

            }


            // ========================================
            // OPTIONS
            // ========================================

            const options =
                document.createElement(
                    "div"
                );


            question.options.forEach(
                function(option, index) {

                    const optionDiv =
                        document.createElement(
                            "div"
                        );


                    optionDiv.className =
                        "search-option";


                    optionDiv.innerHTML =
                        String.fromCharCode(
                            65 + index
                        ) +
                        ". " +
                        escapeHTML(
                            option
                        );


                    options.appendChild(
                        optionDiv
                    );

                }
            );


            box.appendChild(
                options
            );


            // ========================================
            // OPEN QUESTION
            // ========================================

            const openButton =
                document.createElement(
                    "button"
                );


            openButton.innerHTML =
                "Open Question";


            openButton.className =
                "modeButton";


            openButton.onclick =
                function() {

                    questions =
                        [question];


                    status =
                        ["notAttempted"];


                    current =
                        0;


                    quizMode =
                        false;


                    currentSubject =
                        question.subject;


                    showOnly(
                        "quizScreen"
                    );


                    document.getElementById(
                        "subject"
                    ).innerHTML =
                        subjectNames[
                            question.subject
                        ];


                    createNavigator();

                    showQuestion();

                };


            box.appendChild(
                openButton
            );


            container.appendChild(
                box
            );

        }
    );

}


// ========================================
// SEARCH BACK
// ========================================

document.getElementById(
    "searchBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ========================================
// REQUEST ACCESS
// ========================================

document.getElementById(
    "requestAccessBtn"
).onclick =
function() {

    showOnly(
        "accessRequestScreen"
    );

};


// ========================================
// BACK TO LOGIN
// ========================================

document.getElementById(
    "backToLoginBtn"
).onclick =
function() {

    showOnly(
        "loginScreen"
    );

};


// ========================================
// SUBMIT ACCESS REQUEST
// ========================================

document.getElementById(
    "submitAccessRequestBtn"
).onclick =
async function() {

    const name =
        document.getElementById(
            "requestName"
        ).value.trim();


    const email =
        document.getElementById(
            "requestEmail"
        ).value.trim();


    const reason =
        document.getElementById(
            "requestReason"
        ).value.trim();


    const message =
        document.getElementById(
            "accessRequestMessage"
        );


    if (!name || !email) {

        message.innerHTML =
            "Please enter your name and email.";

        return;

    }


    message.innerHTML =
        "Submitting request...";


    try {

        const {
            error
        } =
            await supabaseClient
                .from("access_requests")
                .insert({

                    name:
                        name,

                    email:
                        email,

                    reason:
                        reason

                });


        if (error) {

            console.error(
                "Access request error:",
                error
            );

            message.innerHTML =
                "Unable to submit request. Please try again.";

            return;

        }


        message.innerHTML =
            "Request submitted successfully. Your access will be reviewed.";


        document.getElementById(
            "requestName"
        ).value = "";


        document.getElementById(
            "requestEmail"
        ).value = "";


        document.getElementById(
            "requestReason"
        ).value = "";


    } catch (error) {

        console.error(
            "Unexpected request error:",
            error
        );

        message.innerHTML =
            "Unable to submit request. Please try again.";

    }

};


// ========================================
// CHECK ADMIN ACCESS
// ========================================

async function checkAdminAccess() {

    const adminButton =
        document.getElementById(
            "adminBtn"
        );


    if (!adminButton) {
        return;
    }


    adminButton.style.display =
        "none";


    try {

        const {
            data: {
                user
            },
            error
        } =
            await supabaseClient.auth.getUser();


        if (
            error ||
            !user
        ) {

            return;

        }


        const {
            data: adminUser,
            error: adminError
        } =
            await supabaseClient
                .from("admin_users")
                .select("email")
                .eq(
                    "email",
                    user.email
                )
                .maybeSingle();


        if (adminError) {

            console.error(
                "Admin check error:",
                adminError
            );

            return;

        }


        if (adminUser) {

            adminButton.style.display =
                "block";

        }


    } catch (error) {

        console.error(
            "Unexpected admin check error:",
            error
        );

    }

}


// ========================================
// OPEN ADMIN DASHBOARD
// ========================================

document.getElementById(
    "adminBtn"
).onclick =
async function() {

    showOnly(
        "adminScreen"
    );

    await loadAdminRequests();

    await loadApprovedUsers();

};


// ========================================
// ADMIN BACK
// ========================================

document.getElementById(
    "adminBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ========================================
// LOAD ACCESS REQUESTS
// ========================================

async function loadAdminRequests() {

    const container =
        document.getElementById(
            "adminRequests"
        );


    container.innerHTML =
        "Loading requests...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("access_requests")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Admin requests error:",
                error
            );

            container.innerHTML =
                "Unable to load access requests.";

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML =
                "No access requests.";

            return;

        }


        container.innerHTML = "";


        data.forEach(
            function(request) {

                const box =
                    document.createElement(
                        "div"
                    );


                box.style.border =
                    "1px solid #ccc";


                box.style.padding =
                    "15px";


                box.style.marginBottom =
                    "10px";


                box.style.borderRadius =
                    "8px";


                box.innerHTML =
                    "<strong>Name:</strong> " +
                    escapeHTML(
                        request.name
                    ) +
                    "<br>" +

                    "<strong>Email:</strong> " +
                    escapeHTML(
                        request.email
                    ) +
                    "<br>" +

                    "<strong>Reason:</strong> " +
                    escapeHTML(
                        request.reason ||
                        "Not provided"
                    ) +
                    "<br>" +

                    "<strong>Date:</strong> " +
                    new Date(
                        request.created_at
                    ).toLocaleString() +
                    "<br><br>";


                // APPROVE

                const approveButton =
                    document.createElement(
                        "button"
                    );


                approveButton.innerHTML =
                    "Approve";


                approveButton.className =
                    "modeButton";


                approveButton.onclick =
                    function() {

                        approveUser(
                            request
                        );

                    };


                // REJECT

                const rejectButton =
                    document.createElement(
                        "button"
                    );


                rejectButton.innerHTML =
                    "Reject";


                rejectButton.className =
                    "backButton";


                rejectButton.onclick =
                    function() {

                        rejectRequest(
                            request
                        );

                    };


                box.appendChild(
                    approveButton
                );


                box.appendChild(
                    rejectButton
                );


                container.appendChild(
                    box
                );

            }
        );


    } catch (error) {

        console.error(
            "Unexpected admin request error:",
            error
        );

        container.innerHTML =
            "Unable to load access requests.";

    }

}


// ========================================
// APPROVE USER
// ========================================

async function approveUser(request) {

    if (
        !confirm(
            "Approve " +
            request.email +
            "?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("approved_users")
                .insert({

                    email:
                        request.email

                });


        if (error) {

            console.error(
                "Approval error:",
                error
            );

            alert(
                "Unable to approve user: " +
                error.message
            );

            return;

        }


        const {
            error: deleteError
        } =
            await supabaseClient
                .from("access_requests")
                .delete()
                .eq(
                    "id",
                    request.id
                );


        if (deleteError) {

            console.error(
                "Delete request error:",
                deleteError
            );

        }


        alert(
            "User approved successfully."
        );


        await loadAdminRequests();

        await loadApprovedUsers();


    } catch (error) {

        console.error(
            "Unexpected approval error:",
            error
        );

        alert(
            "Unable to approve user."
        );

    }

}


// ========================================
// REJECT REQUEST
// ========================================

async function rejectRequest(request) {

    if (
        !confirm(
            "Reject this access request?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("access_requests")
                .delete()
                .eq(
                    "id",
                    request.id
                );


        if (error) {

            console.error(
                "Reject error:",
                error
            );

            alert(
                "Unable to reject request: " +
                error.message
            );

            return;

        }


        await loadAdminRequests();


    } catch (error) {

        console.error(
            "Unexpected reject error:",
            error
        );

        alert(
            "Unable to reject request."
        );

    }

}


// ========================================
// LOAD APPROVED USERS
// ========================================

async function loadApprovedUsers() {

    const container =
        document.getElementById(
            "approvedUsersList"
        );


    container.innerHTML =
        "Loading approved users...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("approved_users")
                .select("*")
                .order(
                    "approved_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Approved users error:",
                error
            );

            container.innerHTML =
                "Unable to load approved users.";

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML =
                "No approved users.";

            return;

        }


        container.innerHTML = "";


        data.forEach(
            function(user) {

                const box =
                    document.createElement(
                        "div"
                    );


                box.style.border =
                    "1px solid #ccc";


                box.style.padding =
                    "10px";


                box.style.marginBottom =
                    "8px";


                box.style.borderRadius =
                    "8px";


                box.innerHTML =
                    "<strong>" +
                    escapeHTML(
                        user.email
                    ) +
                    "</strong>" +
                    "<br>" +
                    "Approved: " +
                    new Date(
                        user.approved_at
                    ).toLocaleString();


                container.appendChild(
                    box
                );

            }
        );


    } catch (error) {

        console.error(
            "Unexpected approved users error:",
            error
        );

        container.innerHTML =
            "Unable to load approved users.";

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// INITIAL SCREEN
// ========================================

showOnly(
    "loginScreen"
);

checkAdminAccess();
