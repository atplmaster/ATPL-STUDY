// ============================================================
// ATPL STUDY PLATFORM
// COMPLETE VERSION WITH PROGRESS DASHBOARD
// ============================================================


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let questions = [];
let current = 0;
let status = [];
let quizMode = false;

let markedQuestionIds = new Set();

let currentSubject = null;

let wrongQuestionsForRedo = [];

// Persistent quiz / history / timer state
let selectedAnswers = [];
let activeQuizType = null;
let activeQuizIsTimed = false;
let activeQuizTimeLimitMinutes = null;
let activeQuizStartedAt = null;
let activeQuizEndTime = null;
let activeQuizTimerInterval = null;
let activeQuizSaveTimer = null;
let quizCompletedSaved = false;
let reviewingHistoryAttempt = false;


// ============================================================
// SUBJECTS
// ============================================================

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


// ============================================================
// SCREEN CONTROL
// ============================================================

function showOnly(screenId) {

    const screens = [
        "loginScreen",
        "accessRequestScreen",
        "homeScreen",
        "progressScreen",
        "adminScreen",
        "practiceSetup",
        "quizSetup",
        "combinedQuizSetup",
        "searchScreen",
        "markedScreen",
        "quizHistoryScreen",
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


// ============================================================
// PRACTICE BUTTON
// ============================================================

document.getElementById("practiceBtn").onclick = function() {

    showOnly("practiceSetup");

    updateResetButton();

};


// ============================================================
// PRACTICE SUBJECT CHANGE
// ============================================================

document.getElementById("practiceSubjectSelect").addEventListener(
    "change",
    function() {

        updateResetButton();

    }
);


// ============================================================
// RESET BUTTON DISPLAY
// ============================================================

function updateResetButton() {

    const section =
        document.getElementById("resetProgressSection");

    if (!section) {
        return;
    }

    const subject =
        document.getElementById("practiceSubjectSelect").value;

    if (subject) {

        section.style.display = "block";

    } else {

        section.style.display = "none";

    }

}


// ============================================================
// RESET PROGRESS BUTTON
// ============================================================

document.getElementById("resetProgressBtn").onclick =
async function() {

    const subject =
        document.getElementById("practiceSubjectSelect").value;

    if (!subject) {
        return;
    }

    const confirmed = confirm(
        "Reset all saved progress for " +
        subjectNames[subject] +
        "?\n\n" +
        "Your marked questions will NOT be deleted."
    );

    if (!confirmed) {
        return;
    }

    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) {

            alert("Please log in first.");

            return;
        }

        const { error } =
            await supabaseClient
                .from("progress")
                .delete()
                .eq("user_id", user.id)
                .eq("subject", subject);

        if (error) {

            console.error(
                "Reset progress error:",
                error
            );

            alert(
                "Unable to reset progress:\n" +
                error.message
            );

            return;
        }

        alert(
            subjectNames[subject] +
            " progress has been reset."
        );

    } catch (error) {

        console.error(
            "Unexpected reset error:",
            error
        );

        alert(
            "Unable to reset progress."
        );

    }

};


// ============================================================
// START PRACTICE
// ============================================================

document.getElementById("startPracticeBtn").onclick = function() {

    quizMode = false;

    const subjectFile =
        document.getElementById("practiceSubjectSelect").value;

    if (!subjectFile) {

        alert("Please select a subject.");

        return;
    }

    currentSubject = subjectFile;

    showOnly("quizScreen");

    loadPracticeQuestions(subjectFile);

};


// ============================================================
// PRACTICE BACK
// ============================================================

document.getElementById("practiceBackBtn").onclick = function() {

    showOnly("homeScreen");

};


// ============================================================
// SUBJECT QUIZ
// ============================================================

document.getElementById("subjectQuizBtn").onclick = function() {

    showOnly("quizSetup");

};


// ============================================================
// START SUBJECT QUIZ
// ============================================================

document.getElementById("startQuizBtn").onclick = function() {

    quizMode = true;

    const subjectFile =
        document.getElementById("subjectSelect").value;

    const numberOfQuestions =
        document.getElementById("questionCount").value;

    if (!subjectFile) {

        alert("Please select a subject.");

        return;
    }

    currentSubject = subjectFile;

    const mode = document.getElementById("subjectQuizMode")?.value || "normal";
    activeQuizType = "subject";
    activeQuizIsTimed = mode === "timed";
    activeQuizTimeLimitMinutes = activeQuizIsTimed
        ? parseInt(document.getElementById("subjectTimeLimit")?.value || "60", 10)
        : null;
    prepareNewQuizTiming();

    showOnly("quizScreen");

    loadSubjectQuiz(
        subjectFile,
        numberOfQuestions
    );

};


// ============================================================
// SUBJECT QUIZ BACK
// ============================================================

document.getElementById("backHomeBtn").onclick = function() {

    showOnly("homeScreen");

};


// ============================================================
// COMBINED QUIZ
// ============================================================

document.getElementById("combinedQuizBtn").onclick = function() {

    showOnly("combinedQuizSetup");

    loadCombinedQuestionCount();

};


// ============================================================
// COMBINED BACK
// ============================================================

document.getElementById("combinedBackBtn").onclick = function() {

    showOnly("homeScreen");

};


// ============================================================
// LOAD COMBINED QUESTION COUNT
// ============================================================

async function loadCombinedQuestionCount() {

    let totalQuestions = 0;

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


// ============================================================
// UPDATE COMBINED OPTIONS
// ============================================================

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
                parseInt(
                    option.value,
                    10
                );

            option.disabled =
                number > totalQuestions;

        }
    );

}


// ============================================================
// START COMBINED QUIZ
// ============================================================

document.getElementById("startCombinedBtn").onclick =
function() {

    const questionCount =
        document.getElementById(
            "combinedQuestionCount"
        ).value;

    const mode = document.getElementById("combinedQuizMode")?.value || "normal";
    activeQuizType = "combined";
    activeQuizIsTimed = mode === "timed";
    activeQuizTimeLimitMinutes = activeQuizIsTimed
        ? parseInt(document.getElementById("combinedTimeLimit")?.value || "60", 10)
        : null;
    prepareNewQuizTiming();

    loadCombinedQuiz(questionCount);

};


// ============================================================
// LOAD PRACTICE QUESTIONS
// ============================================================

async function loadPracticeQuestions(subjectFile) {

    try {

        const response =
            await fetch(
                "data/" +
                subjectFile +
                ".json"
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load " +
                subjectFile +
                ".json"
            );

        }

        questions =
            await response.json();

        questions.forEach(
            function(question) {

                question.subject =
                    subjectFile;

            }
        );

        status =
            new Array(
                questions.length
            ).fill("notAttempted");

        current = 0;
        selectedAnswers = new Array(questions.length).fill(null);
        quizCompletedSaved = false;
        reviewingHistoryAttempt = false;

        currentSubject =
            subjectFile;

        document.getElementById(
            "subject"
        ).innerHTML =
            subjectNames[subjectFile];

        await loadMarkedQuestions();

        await loadSavedProgress(
            subjectFile
        );

        createNavigator();

        showQuestion();

    } catch (error) {

        console.error(
            "Practice loading error:",
            error
        );

        alert(
            "Error loading " +
            subjectNames[subjectFile] +
            " questions."
        );

    }

}


// ============================================================
// LOAD SUBJECT QUIZ
// ============================================================

async function loadSubjectQuiz(
    subjectFile,
    numberOfQuestions
) {

    try {

        const response =
            await fetch(
                "data/" +
                subjectFile +
                ".json"
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load " +
                subjectFile +
                ".json"
            );

        }

        let allQuestions =
            await response.json();

        allQuestions.forEach(
            function(question) {

                question.subject =
                    subjectFile;

            }
        );

        allQuestions.sort(
            function() {

                return (
                    Math.random() -
                    0.5
                );

            }
        );

        if (
            numberOfQuestions === "all"
        ) {

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
            new Array(
                questions.length
            ).fill("notAttempted");

        current = 0;

        currentSubject =
            subjectFile;

        document.getElementById(
            "subject"
        ).innerHTML =
            subjectNames[subjectFile] +
            " QUIZ";

        await loadMarkedQuestions();

        createNavigator();

        showQuestion();
        await saveActiveQuizToSupabase();
        startQuizTimer();

    } catch (error) {

        console.error(
            "Subject quiz loading error:",
            error
        );

        alert(
            "Error loading " +
            subjectNames[subjectFile] +
            " quiz."
        );

    }

}


// ============================================================
// LOAD COMBINED QUIZ
// ============================================================

async function loadCombinedQuiz(questionCount) {

    const combinedQuestions = [];

    try {

        for (const file of subjectFiles) {

            const response =
                await fetch(
                    "data/" +
                    file +
                    ".json"
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

            data.forEach(
                function(question) {

                    question.subject =
                        file;

                    combinedQuestions.push(
                        question
                    );

                }
            );

        }

        combinedQuestions.sort(
            function() {

                return (
                    Math.random() -
                    0.5
                );

            }
        );

        if (
            questionCount === "all"
        ) {

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
            new Array(
                questions.length
            ).fill("notAttempted");

        current = 0;
        selectedAnswers = new Array(questions.length).fill(null);
        quizCompletedSaved = false;
        reviewingHistoryAttempt = false;

        quizMode = true;

        currentSubject =
            "combined";

        showOnly("quizScreen");

        document.getElementById(
            "subject"
        ).innerHTML =
            "COMBINED ATPL QUIZ";

        await loadMarkedQuestions();

        createNavigator();

        showQuestion();
        await saveActiveQuizToSupabase();
        startQuizTimer();

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


// ============================================================
// CREATE QUESTION NAVIGATOR
// ============================================================

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

                    current =
                        index;

                    showQuestion();

                };

            nav.appendChild(
                button
            );

        }
    );

}


// ============================================================
// SHOW QUESTION
// ============================================================

function showQuestion() {

    if (!questions.length) {
        return;
    }

    const question =
        questions[current];

    if (quizMode && !reviewingHistoryAttempt) {
        scheduleActiveQuizSave();
    }

    document.getElementById(
        "counter"
    ).innerHTML =
        "Question " +
        (current + 1) +
        " of " +
        questions.length;

    if (
        question.subject &&
        subjectNames[question.subject]
    ) {

        if (!quizMode) {

            document.getElementById(
                "subject"
            ).innerHTML =
                subjectNames[
                    question.subject
                ];

        }

    }

    document.getElementById(
        "question"
    ).innerHTML =
        question.question || "";


    // ========================================================
    // IMAGES
    // ========================================================

    const questionImages =
        document.getElementById(
            "questionImages"
        );

    if (!questionImages) {

        console.error(
            "questionImages element not found."
        );

    } else {

        questionImages.innerHTML = "";

        if (
            question.images &&
            Array.isArray(question.images) &&
            question.images.length
        ) {

            question.images.forEach(
                function(src) {

                    if (!src) {
                        return;
                    }

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

                    img.onerror =
                        function() {

                            console.error(
                                "Image failed to load:",
                                src
                            );

                            img.style.display =
                                "none";

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

    }


    updateMarkButton();


    // ========================================================
    // ANSWERS
    // ========================================================

    const answers =
        document.getElementById(
            "answers"
        );

    answers.innerHTML = "";

    if (
        !question.options ||
        !Array.isArray(
            question.options
        )
    ) {

        answers.innerHTML =
            "<p>Question options are missing.</p>";

        return;
    }

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

            // Restore the student's selected answer when resuming/reviewing.
            if (selectedAnswers[current] === index) {
                if (status[current] === "correct") {
                    button.classList.add("correct");
                } else if (status[current] === "wrong") {
                    button.classList.add("wrong");
                }
            }

            if (reviewingHistoryAttempt) {
                button.disabled = true;
            }


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

                    selectedAnswers[current] = index;

                    await saveProgress(
                        question,
                        current,
                        questionStatus
                    );

                    if (quizMode && !reviewingHistoryAttempt) {
                        scheduleActiveQuizSave();
                    }

                    createNavigator();

                };

            answers.appendChild(
                button
            );

        }
    );

}


// ============================================================
// MARK QUESTION
// ============================================================

document.getElementById(
    "markQuestionBtn"
).onclick = async function() {

    await toggleMarkQuestion();

};


// ============================================================
// TOGGLE MARK
// ============================================================

async function toggleMarkQuestion() {

    if (!questions.length) {
        return;
    }

    const question =
        questions[current];

    if (!question.id) {

        alert(
            "This question does not have an ID."
        );

        return;
    }

    try {

        const {
            data: { user }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            alert(
                "Please log in first."
            );

            return;
        }

        const alreadyMarked =
            markedQuestionIds.has(
                String(question.id)
            );

        if (alreadyMarked) {

            const { error } =
                await supabaseClient
                    .from("marked_questions")
                    .delete()
                    .eq(
                        "user_id",
                        user.id
                    )
                    .eq(
                        "question_id",
                        question.id
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

            markedQuestionIds.delete(
                String(question.id)
            );

        } else {

            const { error } =
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
                    "Unable to mark question: " +
                    error.message
                );

                return;
            }

            markedQuestionIds.add(
                String(question.id)
            );

        }

        updateMarkButton();

    } catch (error) {

        console.error(
            "Unexpected marking error:",
            error
        );

    }

}


// ============================================================
// UPDATE MARK BUTTON
// ============================================================

function updateMarkButton() {

    const button =
        document.getElementById(
            "markQuestionBtn"
        );

    if (
        !button ||
        !questions.length
    ) {
        return;
    }

    const question =
        questions[current];

    if (
        markedQuestionIds.has(
            String(question.id)
        )
    ) {

        button.innerHTML =
            "⭐ Unmark Question";

        button.classList.add(
            "marked"
        );

    } else {

        button.innerHTML =
            "⭐ Mark Question";

        button.classList.remove(
            "marked"
        );

    }

}


// ============================================================
// LOAD MARKED QUESTIONS
// ============================================================

async function loadMarkedQuestions() {

    markedQuestionIds =
        new Set();

    try {

        const {
            data: { user }
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
                .from("marked_questions")
                .select("question_id")
                .eq(
                    "user_id",
                    user.id
                );

        if (error) {

            console.error(
                "Load marked questions error:",
                error
            );

            return;
        }

        if (data) {

            data.forEach(
                function(record) {

                    markedQuestionIds.add(
                        String(
                            record.question_id
                        )
                    );

                }
            );

        }

    } catch (error) {

        console.error(
            "Unexpected marked loading error:",
            error
        );

    }

}


// ============================================================
// MARKED QUESTIONS BUTTON
// ============================================================

document.getElementById(
    "markedBtn"
).onclick = async function() {

    showOnly("markedScreen");

    await displayMarkedQuestions();

};


// ============================================================
// DISPLAY MARKED QUESTIONS
// ============================================================

async function displayMarkedQuestions() {

    const container =
        document.getElementById(
            "markedQuestionsList"
        );

    container.innerHTML =
        "Loading marked questions...";

    try {

        const {
            data: { user }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            container.innerHTML =
                "Please log in.";

            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("marked_questions")
                .select(
                    "question_id,subject,marked_at"
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
                "Marked list error:",
                error
            );

            container.innerHTML =
                "Unable to load marked questions.";

            return;
        }

        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML =
                "<p>You have no marked questions.</p>";

            return;
        }

        const allQuestions = [];

        for (
            const subjectFile of subjectFiles
        ) {

            const response =
                await fetch(
                    "data/" +
                    subjectFile +
                    ".json"
                );

            if (!response.ok) {
                continue;
            }

            const subjectQuestions =
                await response.json();

            subjectQuestions.forEach(
                function(question) {

                    question.subject =
                        subjectFile;

                    allQuestions.push(
                        question
                    );

                }
            );

        }

        container.innerHTML = "";

        data.forEach(
            function(marked) {

                const question =
                    allQuestions.find(
                        function(q) {

                            return String(q.id) ===
                                String(
                                    marked.question_id
                                );

                        }
                    );

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

                if (question) {

                    box.innerHTML =
                        "<strong>" +
                        escapeHTML(
                            subjectNames[
                                question.subject
                            ]
                        ) +
                        "</strong>" +
                        "<br><br>" +
                        "<strong>Question:</strong><br>" +
                        escapeHTML(
                            question.question
                        ) +
                        "<br><br>" +
                        "<strong>Question ID:</strong> " +
                        escapeHTML(
                            question.id
                        );

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

                            questions = [
                                question
                            ];

                            status = [
                                "notAttempted"
                            ];

                            current = 0;

                            quizMode = false;

                            currentSubject =
                                question.subject;

                            showOnly(
                                "quizScreen"
                            );

                            loadMarkedQuestions()
                                .then(
                                    function() {

                                        document.getElementById(
                                            "subject"
                                        ).innerHTML =
                                            subjectNames[
                                                question.subject
                                            ];

                                        createNavigator();

                                        showQuestion();

                                    }
                                );

                        };

                    const unmarkButton =
                        document.createElement(
                            "button"
                        );

                    unmarkButton.innerHTML =
                        "Unmark";

                    unmarkButton.className =
                        "backButton";

                    unmarkButton.onclick =
                        async function() {

                            await unmarkById(
                                marked.question_id
                            );

                            await displayMarkedQuestions();

                        };

                    box.appendChild(
                        document.createElement(
                            "br"
                        )
                    );

                    box.appendChild(
                        openButton
                    );

                    box.appendChild(
                        unmarkButton
                    );

                } else {

                    box.innerHTML =
                        "<strong>Question not found</strong>" +
                        "<br>" +
                        "Question ID: " +
                        escapeHTML(
                            marked.question_id
                        );

                }

                container.appendChild(
                    box
                );

            }
        );

    } catch (error) {

        console.error(
            "Unexpected marked list error:",
            error
        );

        container.innerHTML =
            "Unable to load marked questions.";

    }

}


// ============================================================
// UNMARK
// ============================================================

async function unmarkById(questionId) {

    try {

        const {
            data: { user }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {
            return;
        }

        const { error } =
            await supabaseClient
                .from("marked_questions")
                .delete()
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "question_id",
                    questionId
                );

        if (error) {

            console.error(
                "Unmark error:",
                error
            );

            return;
        }

        markedQuestionIds.delete(
            String(questionId)
        );

    } catch (error) {

        console.error(
            "Unexpected unmark error:",
            error
        );

    }

}


// ============================================================
// MARKED QUIZ BUTTONS
// ============================================================

document.getElementById(
    "allMarkedQuizBtn"
).onclick = function() {

    startMarkedQuiz("all");

};

document.getElementById(
    "meteorologyMarkedQuizBtn"
).onclick = function() {

    startMarkedQuiz("meteorology");

};

document.getElementById(
    "airlawMarkedQuizBtn"
).onclick = function() {

    startMarkedQuiz("airlaw");

};

document.getElementById(
    "operationalMarkedQuizBtn"
).onclick = function() {

    startMarkedQuiz("operational");

};


// ============================================================
// START MARKED QUIZ
// ============================================================

async function startMarkedQuiz(selectedSubject) {

    try {

        const {
            data: { user }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            alert(
                "Please log in first."
            );

            return;
        }

        let query =
            supabaseClient
                .from("marked_questions")
                .select(
                    "question_id,subject"
                )
                .eq(
                    "user_id",
                    user.id
                );

        if (
            selectedSubject !== "all"
        ) {

            query =
                query.eq(
                    "subject",
                    selectedSubject
                );

        }

        const {
            data: markedData,
            error
        } =
            await query;

        if (error) {

            console.error(
                "Marked quiz error:",
                error
            );

            alert(
                "Unable to load marked questions."
            );

            return;
        }

        if (
            !markedData ||
            markedData.length === 0
        ) {

            alert(
                "There are no marked questions for this selection."
            );

            return;
        }

        const wantedIds =
            new Set(
                markedData.map(
                    function(item) {

                        return String(
                            item.question_id
                        );

                    }
                )
            );

        const markedQuestions = [];

        for (
            const subjectFile of subjectFiles
        ) {

            if (
                selectedSubject !== "all" &&
                selectedSubject !== subjectFile
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

                    if (
                        wantedIds.has(
                            String(
                                question.id
                            )
                        )
                    ) {

                        question.subject =
                            subjectFile;

                        markedQuestions.push(
                            question
                        );

                    }

                }
            );

        }

        if (
            markedQuestions.length === 0
        ) {

            alert(
                "Marked questions could not be found in the question files."
            );

            return;
        }

        questions =
            markedQuestions;

        questions.sort(
            function() {

                return (
                    Math.random() -
                    0.5
                );

            }
        );

        status =
            new Array(
                questions.length
            ).fill("notAttempted");

        current = 0;

        quizMode = true;

        currentSubject =
            selectedSubject;

        showOnly("quizScreen");

        if (
            selectedSubject === "all"
        ) {

            document.getElementById(
                "subject"
            ).innerHTML =
                "ALL MARKED QUESTIONS";

        } else {

            document.getElementById(
                "subject"
            ).innerHTML =
                subjectNames[
                    selectedSubject
                ] +
                " MARKED QUESTIONS";

        }

        createNavigator();

        showQuestion();

    } catch (error) {

        console.error(
            "Unexpected marked quiz error:",
            error
        );

        alert(
            "Unable to start marked quiz."
        );

    }

}


// ============================================================
// SEARCH BUTTON
// ============================================================

document.getElementById(
    "searchBtn"
).onclick = function() {

    showOnly("searchScreen");

};


// ============================================================
// SEARCH QUESTIONS
// ============================================================

document.getElementById(
    "searchQuestionsBtn"
).onclick =
async function() {

    await searchQuestions();

};


// ============================================================
// SEARCH FUNCTION
// ============================================================

async function searchQuestions() {

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

    const results =
        document.getElementById(
            "searchResults"
        );

    results.innerHTML =
        "Searching...";

    try {

        const allQuestions = [];

        for (
            const subjectFile of subjectFiles
        ) {

            if (
                selectedSubject !== "all" &&
                selectedSubject !== subjectFile
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

                console.error(
                    "Could not load:",
                    subjectFile
                );

                continue;
            }

            const data =
                await response.json();

            data.forEach(
                function(question) {

                    question.subject =
                        subjectFile;

                    allQuestions.push(
                        question
                    );

                }
            );

        }

        const filtered =
            allQuestions.filter(
                function(question) {

                    if (!searchText) {
                        return true;
                    }

                    const questionText =
                        String(
                            question.question ||
                            ""
                        ).toLowerCase();

                    const optionsText =
                        Array.isArray(
                            question.options
                        )
                            ?
                            question.options
                                .join(" ")
                                .toLowerCase()
                            :
                            "";

                    return (
                        questionText.includes(
                            searchText
                        ) ||
                        optionsText.includes(
                            searchText
                        )
                    );

                }
            );

        if (
            filtered.length === 0
        ) {

            results.innerHTML =
                "<p>No questions found.</p>";

            return;
        }

        results.innerHTML =
            "<p><strong>" +
            filtered.length +
            "</strong> questions found.</p>";

        filtered.forEach(
            function(question) {

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
                    "<strong>" +
                    escapeHTML(
                        subjectNames[
                            question.subject
                        ]
                    ) +
                    "</strong>" +
                    "<br><br>" +
                    escapeHTML(
                        question.question
                    );

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

                        questions = [
                            question
                        ];

                        status = [
                            "notAttempted"
                        ];

                        current = 0;

                        quizMode = false;

                        currentSubject =
                            question.subject;

                        showOnly(
                            "quizScreen"
                        );

                        loadMarkedQuestions()
                            .then(
                                function() {

                                    document.getElementById(
                                        "subject"
                                    ).innerHTML =
                                        subjectNames[
                                            question.subject
                                        ];

                                    createNavigator();

                                    showQuestion();

                                }
                            );

                    };

                box.appendChild(
                    document.createElement(
                        "br"
                    )
                );

                box.appendChild(
                    openButton
                );

                results.appendChild(
                    box
                );

            }
        );

    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        results.innerHTML =
            "Unable to search questions.";

    }

}


// ============================================================
// SEARCH BACK
// ============================================================

document.getElementById(
    "searchBackBtn"
).onclick = function() {

    showOnly("homeScreen");

};


// ============================================================
// MARKED BACK
// ============================================================

document.getElementById(
    "markedBackBtn"
).onclick = function() {

    showOnly("homeScreen");

};


// ============================================================
// NEXT
// ============================================================

document.getElementById(
    "nextBtn"
).onclick = function() {

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


// ============================================================
// PREVIOUS
// ============================================================

document.getElementById(
    "prevBtn"
).onclick = function() {

    if (
        current >
        0
    ) {

        current--;

        showQuestion();

    }

};


// ============================================================
// SKIP
// ============================================================

document.getElementById(
    "skipBtn"
).onclick =
async function() {

    if (!questions.length) {
        return;
    }

    status[current] =
        "skipped";
    selectedAnswers[current] = null;

    if (quizMode && !reviewingHistoryAttempt) {
        scheduleActiveQuizSave();
    }

    await saveProgress(
        questions[current],
        current,
        "skipped"
    );

    if (
        current <
        questions.length - 1
    ) {

        current++;

        showQuestion();

    }

    createNavigator();

};


// ============================================================
// BACK TO MENU
// ============================================================

document.getElementById(
    "questionBackBtn"
).onclick = function() {

    showOnly("homeScreen");

    checkAdminAccess();

};


// ============================================================
// SHOW RESULTS
// ============================================================

async function showResults() {

    let correct = 0;

    let wrong = 0;

    let skipped = 0;

    wrongQuestionsForRedo = [];

    status.forEach(
        function(result, index) {

            if (
                result === "correct"
            ) {

                correct++;

            }

            if (
                result === "wrong"
            ) {

                wrong++;

                if (
                    questions[index]
                ) {

                    wrongQuestionsForRedo.push(
                        questions[index]
                    );

                }

            }

            if (
                result === "skipped"
            ) {

                skipped++;

            }

        }
    );

    const total =
        questions.length;

    const percentage =
        total > 0
            ?
            Math.round(
                (
                    correct /
                    total
                ) *
                100
            )
            :
            0;

    showOnly("resultsScreen");

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

    const redoButton =
        document.getElementById(
            "redoWrongBtn"
        );

    if (
        wrongQuestionsForRedo.length > 0
    ) {

        redoButton.style.display =
            "block";

    } else {

        redoButton.style.display =
            "none";

    }

    stopQuizTimer();

    if (quizMode && !reviewingHistoryAttempt && !quizCompletedSaved) {
        quizCompletedSaved = true;
        await saveQuizHistory({ correct, wrong, skipped, total, percentage });
        await deleteActiveQuizFromSupabase();
        refreshResumeCard();
    }

}


// ============================================================
// REDO WRONG QUESTIONS
// ============================================================

document.getElementById(
    "redoWrongBtn"
).onclick = function() {

    if (
        !wrongQuestionsForRedo.length
    ) {

        alert(
            "There are no wrong questions to redo."
        );

        return;

    }

    questions =
        [...wrongQuestionsForRedo];

    questions.sort(
        function() {

            return (
                Math.random() -
                0.5
            );

        }
    );

    status =
        new Array(
            questions.length
        ).fill("notAttempted");
    selectedAnswers = new Array(questions.length).fill(null);

    current = 0;

    quizMode = true;
    activeQuizType = "redo";
    activeQuizIsTimed = false;
    activeQuizTimeLimitMinutes = null;
    prepareNewQuizTiming();
    quizCompletedSaved = false;
    reviewingHistoryAttempt = false;

    showOnly("quizScreen");

    document.getElementById(
        "subject"
    ).innerHTML =
        "🔁 REDO WRONG QUESTIONS";

    createNavigator();

    showQuestion();
    saveActiveQuizToSupabase();

};


// ============================================================
// REVIEW ANSWERS
// ============================================================

document.getElementById(
    "reviewBtn"
).onclick = function() {

    current = 0;

    showOnly("quizScreen");

    showQuestion();

};


// ============================================================
// RESULTS HOME
// ============================================================

document.getElementById(
    "resultsHomeBtn"
).onclick = function() {

    showOnly("homeScreen");

    checkAdminAccess();

};


// ============================================================
// PROGRESS BUTTON
// ============================================================

document.getElementById(
    "progressBtn"
).onclick =
async function() {

    showOnly("progressScreen");

    await loadProgressDashboard();

};


// ============================================================
// PROGRESS BACK
// ============================================================

document.getElementById(
    "progressBackBtn"
).onclick =
function() {

    showOnly("homeScreen");

    checkAdminAccess();

};


// ============================================================
// LOAD PROGRESS DASHBOARD
// ============================================================

async function loadProgressDashboard() {

    const loading =
        document.getElementById(
            "progressLoading"
        );

    loading.innerHTML =
        "Loading your progress...";

    try {

        const {
            data: { user }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            loading.innerHTML =
                "Please log in first.";

            return;
        }


        // ----------------------------------------------------
        // LOAD ALL QUESTION FILES
        // ----------------------------------------------------

        const allQuestions = [];

        const subjectTotals = {};

        for (
            const subjectFile of subjectFiles
        ) {

            try {

                const response =
                    await fetch(
                        "data/" +
                        subjectFile +
                        ".json"
                    );

                if (!response.ok) {

                    console.error(
                        "Unable to load:",
                        subjectFile
                    );

                    subjectTotals[
                        subjectFile
                    ] = 0;

                    continue;

                }

                const data =
                    await response.json();

                subjectTotals[
                    subjectFile
                ] =
                    data.length;

                data.forEach(
                    function(question) {

                        question.subject =
                            subjectFile;

                        allQuestions.push(
                            question
                        );

                    }
                );

            } catch (error) {

                console.error(
                    "Question file error:",
                    error
                );

                subjectTotals[
                    subjectFile
                ] = 0;

            }

        }


        // ----------------------------------------------------
        // LOAD SAVED PROGRESS
        // ----------------------------------------------------

        const {
            data: progressData,
            error: progressError
        } =
            await supabaseClient
                .from("progress")
                .select(
                    "question_id,subject,status,updated_at"
                )
                .eq(
                    "user_id",
                    user.id
                );

        if (progressError) {

            console.error(
                "Progress dashboard error:",
                progressError
            );

            loading.innerHTML =
                "Unable to load progress.";

            return;

        }

        const progressMap =
            new Map();

        if (progressData) {

            progressData.forEach(
                function(record) {

                    progressMap.set(
                        String(
                            record.question_id
                        ),
                        record
                    );

                }
            );

        }


        // ----------------------------------------------------
        // CALCULATE OVERALL
        // ----------------------------------------------------

        let attempted = 0;

        let correct = 0;

        let wrong = 0;

        let skipped = 0;

        progressMap.forEach(
            function(record) {

                if (
                    record.status === "correct"
                ) {

                    correct++;

                    attempted++;

                }

                if (
                    record.status === "wrong"
                ) {

                    wrong++;

                    attempted++;

                }

                if (
                    record.status === "skipped"
                ) {

                    skipped++;

                    attempted++;

                }

            }
        );

        const totalQuestions =
            allQuestions.length;

        const accuracy =
            (
                correct + wrong
            ) > 0
                ?
                Math.round(
                    (
                        correct /
                        (
                            correct +
                            wrong
                        )
                    ) *
                    100
                )
                :
                0;

        const completion =
            totalQuestions > 0
                ?
                Math.round(
                    (
                        attempted /
                        totalQuestions
                    ) *
                    100
                )
                :
                0;

        document.getElementById(
            "overallProgressContent"
        ).innerHTML =

            "<p><strong>Total Questions:</strong> " +
            totalQuestions +
            "</p>" +

            "<p><strong>Attempted:</strong> " +
            attempted +
            "</p>" +

            "<p><strong>Correct:</strong> " +
            correct +
            "</p>" +

            "<p><strong>Wrong:</strong> " +
            wrong +
            "</p>" +

            "<p><strong>Skipped:</strong> " +
            skipped +
            "</p>" +

            "<p><strong>Accuracy:</strong> " +
            accuracy +
            "%</p>" +

            "<p><strong>Completion:</strong> " +
            completion +
            "%</p>" +

            "<div class='progressBar'>" +

                "<div class='progressBarFill' " +
                "style='width:" +
                Math.min(
                    completion,
                    100
                ) +
                "%;'>" +

                completion +

                "%" +

                "</div>" +

            "</div>";


        // ----------------------------------------------------
        // SUBJECT PROGRESS
        // ----------------------------------------------------

        const subjectStats = {};

        subjectFiles.forEach(
            function(subject) {

                subjectStats[subject] = {

                    total:
                        subjectTotals[
                            subject
                        ] || 0,

                    attempted:
                        0,

                    correct:
                        0,

                    wrong:
                        0,

                    skipped:
                        0

                };

            }
        );

        progressMap.forEach(
            function(record) {

                const subject =
                    record.subject;

                if (
                    !subjectStats[subject]
                ) {

                    return;

                }

                if (
                    record.status === "correct"
                ) {

                    subjectStats[
                        subject
                    ].correct++;

                    subjectStats[
                        subject
                    ].attempted++;

                }

                if (
                    record.status === "wrong"
                ) {

                    subjectStats[
                        subject
                    ].wrong++;

                    subjectStats[
                        subject
                    ].attempted++;

                }

                if (
                    record.status === "skipped"
                ) {

                    subjectStats[
                        subject
                    ].skipped++;

                    subjectStats[
                        subject
                    ].attempted++;

                }

            }
        );

        let subjectHTML = "";

        subjectFiles.forEach(
            function(subject) {

                const stats =
                    subjectStats[subject];

                const subjectAccuracy =
                    (
                        stats.correct +
                        stats.wrong
                    ) > 0
                        ?
                        Math.round(
                            (
                                stats.correct /
                                (
                                    stats.correct +
                                    stats.wrong
                                )
                            ) *
                            100
                        )
                        :
                        0;

                const subjectCompletion =
                    stats.total > 0
                        ?
                        Math.round(
                            (
                                stats.attempted /
                                stats.total
                            ) *
                            100
                        )
                        :
                        0;

                subjectHTML +=

                    "<div class='subjectProgressBox'>" +

                    "<h4>" +
                    subjectNames[subject] +
                    "</h4>" +

                    "<p>" +
                    stats.attempted +
                    " / " +
                    stats.total +
                    " attempted" +
                    "</p>" +

                    "<p>Correct: " +
                    stats.correct +
                    " | Wrong: " +
                    stats.wrong +
                    "</p>" +

                    "<p>Accuracy: <strong>" +
                    subjectAccuracy +
                    "%</strong></p>" +

                    "<p>Completion: " +
                    subjectCompletion +
                    "%</p>" +

                    "<div class='progressBar'>" +

                    "<div class='progressBarFill' " +
                    "style='width:" +
                    Math.min(
                        subjectCompletion,
                        100
                    ) +
                    "%;'>" +

                    subjectCompletion +

                    "%" +

                    "</div>" +

                    "</div>" +

                    "</div>";

            }
        );

        document.getElementById(
            "subjectProgressContent"
        ).innerHTML =
            subjectHTML;


        // ----------------------------------------------------
        // STRONGEST / WEAKEST
        // ----------------------------------------------------

        let strongestSubject = null;

        let weakestSubject = null;

        let strongestAccuracy = -1;

        let weakestAccuracy = 101;

        subjectFiles.forEach(
            function(subject) {

                const stats =
                    subjectStats[subject];

                const attempts =
                    stats.correct +
                    stats.wrong;

                if (
                    attempts === 0
                ) {

                    return;

                }

                const acc =
                    Math.round(
                        (
                            stats.correct /
                            attempts
                        ) *
                        100
                    );

                if (
                    acc >
                    strongestAccuracy
                ) {

                    strongestAccuracy =
                        acc;

                    strongestSubject =
                        subject;

                }

                if (
                    acc <
                    weakestAccuracy
                ) {

                    weakestAccuracy =
                        acc;

                    weakestSubject =
                        subject;

                }

            }
        );

        let performanceHTML = "";

        if (strongestSubject) {

            performanceHTML +=

                "<p>🏆 <strong>Strongest Subject:</strong><br>" +

                subjectNames[
                    strongestSubject
                ] +

                " — " +

                strongestAccuracy +

                "% accuracy</p>";

        } else {

            performanceHTML +=
                "<p>No completed questions yet.</p>";

        }

        if (weakestSubject) {

            performanceHTML +=

                "<p>⚠️ <strong>Needs Most Work:</strong><br>" +

                subjectNames[
                    weakestSubject
                ] +

                " — " +

                weakestAccuracy +

                "% accuracy</p>";

        }

        document.getElementById(
            "performanceContent"
        ).innerHTML =
            performanceHTML;


        // ----------------------------------------------------
        // WRONG QUESTIONS
        // ----------------------------------------------------

        const wrongRecords = [];

        progressMap.forEach(
            function(record) {

                if (
                    record.status === "wrong"
                ) {

                    const question =
                        allQuestions.find(
                            function(q) {

                                return String(q.id) ===
                                    String(
                                        record.question_id
                                    );

                            }
                        );

                    if (question) {

                        wrongRecords.push(
                            question
                        );

                    }

                }

            }
        );

        let wrongHTML = "";

        wrongHTML +=

            "<p>You currently have <strong>" +
            wrongRecords.length +
            "</strong> questions marked wrong.</p>";

        if (
            wrongRecords.length > 0
        ) {

            const wrongButton =
                document.createElement(
                    "button"
                );

            wrongButton.innerHTML =
                "🔥 Practice Wrong Questions";

            wrongButton.className =
                "modeButton";

            wrongButton.onclick =
                function() {

                    questions =
                        [...wrongRecords];

                    questions.sort(
                        function() {

                            return (
                                Math.random() -
                                0.5
                            );

                        }
                    );

                    status =
                        new Array(
                            questions.length
                        ).fill(
                            "notAttempted"
                        );

                    current = 0;

                    quizMode = true;

                    showOnly("quizScreen");

                    document.getElementById(
                        "subject"
                    ).innerHTML =
                        "🔥 WRONG QUESTIONS";

                    createNavigator();

                    showQuestion();

                };

            const wrongContainer =
                document.createElement(
                    "div"
                );

            wrongContainer.innerHTML =
                wrongHTML;

            wrongContainer.appendChild(
                wrongButton
            );

            document.getElementById(
                "wrongQuestionsContent"
            ).innerHTML = "";

            document.getElementById(
                "wrongQuestionsContent"
            ).appendChild(
                wrongContainer
            );

        } else {

            document.getElementById(
                "wrongQuestionsContent"
            ).innerHTML =
                wrongHTML;

        }


        // ----------------------------------------------------
        // MASTERED QUESTIONS
        // ----------------------------------------------------

        const masteredRecords = [];

        progressMap.forEach(
            function(record) {

                if (
                    record.status === "correct"
                ) {

                    const question =
                        allQuestions.find(
                            function(q) {

                                return String(q.id) ===
                                    String(
                                        record.question_id
                                    );

                            }
                        );

                    if (question) {

                        masteredRecords.push(
                            question
                        );

                    }

                }

            }
        );

        document.getElementById(
            "masteredQuestionsContent"
        ).innerHTML =

            "<p>🏆 Questions currently mastered: <strong>" +
            masteredRecords.length +
            "</strong></p>" +

            "<p>" +
            "A question is currently counted as mastered " +
            "when your latest saved result is correct." +
            "</p>";

        loading.innerHTML =
            "Progress updated successfully.";

    } catch (error) {

        console.error(
            "Progress dashboard error:",
            error
        );

        loading.innerHTML =
            "Unable to load your progress.";

    }

}


// ============================================================
// SAVE PROGRESS
// ============================================================

async function saveProgress(
    question,
    questionIndex,
    questionStatus
) {

    try {

        const {
            data: { user }
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

            const { error } =
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

            const { error } =
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


// ============================================================
// LOAD SAVED PROGRESS
// ============================================================

async function loadSavedProgress(subject) {

    try {

        const {
            data: { user }
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

                                return String(
                                    question.id
                                ) ===
                                String(
                                    record.question_id
                                );

                            }
                        );

                    if (
                        index !== -1
                    ) {

                        status[index] =
                            record.status;

                    }

                }
            );

        }

    } catch (error) {

        console.error(
            "Unexpected progress loading error:",
            error
        );

    }

}


// ============================================================
// CREATE ACCOUNT
// ============================================================

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

    if (
        !email ||
        !password
    ) {

        message.innerHTML =
            "Please enter your email and password.";

        return;

    }

    if (
        password.length < 6
    ) {

        message.innerHTML =
            "Password must be at least 6 characters.";

        return;

    }

    message.innerHTML =
        "Creating account...";

    try {

        const { error } =
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


// ============================================================
// LOGIN
// ============================================================

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

    if (
        !email ||
        !password
    ) {

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
            await supabaseClient.auth
                .signInWithPassword({

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

        showOnly("homeScreen");

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


// ============================================================
// REQUEST ACCESS
// ============================================================

document.getElementById(
    "requestAccessBtn"
).onclick = function() {

    showOnly(
        "accessRequestScreen"
    );

};


// ============================================================
// BACK TO LOGIN
// ============================================================

document.getElementById(
    "backToLoginBtn"
).onclick = function() {

    showOnly(
        "loginScreen"
    );

};


// ============================================================
// SUBMIT ACCESS REQUEST
// ============================================================

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

    if (
        !name ||
        !email
    ) {

        message.innerHTML =
            "Please enter your name and email.";

        return;

    }

    message.innerHTML =
        "Submitting request...";

    try {

        const { error } =
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


// ============================================================
// CHECK ADMIN ACCESS
// ============================================================

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
            data: { user },
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


// ============================================================
// OPEN ADMIN DASHBOARD
// ============================================================

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


// ============================================================
// ADMIN BACK
// ============================================================

document.getElementById(
    "adminBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ============================================================
// LOAD ADMIN REQUESTS
// ============================================================

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


// ============================================================
// APPROVE USER
// FIXED: PREVENTS DUPLICATE EMAIL ERROR
// ============================================================

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

        // ----------------------------------------------------
        // CHECK IF EMAIL IS ALREADY APPROVED
        // ----------------------------------------------------

        const {
            data: existingApprovedUser,
            error: checkError
        } =
            await supabaseClient
                .from("approved_users")
                .select("email")
                .eq(
                    "email",
                    request.email
                )
                .maybeSingle();


        if (checkError) {

            console.error(
                "Check approved user error:",
                checkError
            );

            alert(
                "Unable to check approved users:\n\n" +
                checkError.message
            );

            return;

        }


        // ----------------------------------------------------
        // ALREADY APPROVED
        // ----------------------------------------------------

        if (existingApprovedUser) {

            console.log(
                "User is already approved:",
                request.email
            );


            // Remove the duplicate pending request
            const {
                error: deleteExistingRequestError
            } =
                await supabaseClient
                    .from("access_requests")
                    .delete()
                    .eq(
                        "id",
                        request.id
                    );


            if (deleteExistingRequestError) {

                console.error(
                    "Delete already-approved request error:",
                    deleteExistingRequestError
                );

                alert(
                    "This user is already approved, but the pending request could not be removed:\n\n" +
                    deleteExistingRequestError.message
                );

                return;

            }


            alert(
                request.email +
                " is already approved.\n\n" +
                "The duplicate access request has been removed."
            );


            await loadAdminRequests();

            await loadApprovedUsers();

            return;

        }


        // ----------------------------------------------------
        // INSERT NEW APPROVED USER
        // ----------------------------------------------------

        const {
            error: insertError
        } =
            await supabaseClient
                .from("approved_users")
                .insert({

                    email:
                        request.email,

                    name:
                        request.name,

                    reason:
                        request.reason

                });


        if (insertError) {

            console.error(
                "Approval insert error:",
                insertError
            );

            alert(
                "Unable to approve user:\n\n" +
                insertError.message
            );

            return;

        }


        // ----------------------------------------------------
        // DELETE ACCESS REQUEST
        // ----------------------------------------------------

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

            alert(
                "User was approved, but the access request could not be removed:\n\n" +
                deleteError.message
            );

            await loadAdminRequests();

            await loadApprovedUsers();

            return;

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

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
            "Unable to approve user:\n\n" +
            error.message
        );

    }

}


// ============================================================
// REJECT REQUEST
// ============================================================

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


// ============================================================
// LOAD APPROVED USERS
// ============================================================

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
                        user.name ||
                        user.email
                    ) +
                    "</strong>" +
                    "<br>" +

                    escapeHTML(
                        user.email
                    ) +
                    "<br>" +

                    "Approved: " +
                    new Date(
                        user.approved_at ||
                        user.created_at
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


// ============================================================
// ESCAPE HTML
// ============================================================

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


// ============================================================
// INITIAL SCREEN
// ============================================================

showOnly(
    "loginScreen"
);

checkAdminAccess();

// ============================================================
// PERSISTENT QUIZ, HISTORY AND TIMER SYSTEM
// ============================================================

function prepareNewQuizTiming() {
    activeQuizStartedAt = new Date().toISOString();
    activeQuizEndTime = activeQuizIsTimed
        ? new Date(Date.now() + activeQuizTimeLimitMinutes * 60000).toISOString()
        : null;
    stopQuizTimer();
}

function scheduleActiveQuizSave() {
    if (!quizMode || reviewingHistoryAttempt || !questions.length) return;
    clearTimeout(activeQuizSaveTimer);
    activeQuizSaveTimer = setTimeout(saveActiveQuizToSupabase, 250);
}

async function getCurrentUserSafe() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user || null;
    } catch (error) {
        console.error("Unable to get current user:", error);
        return null;
    }
}

async function saveActiveQuizToSupabase() {
    if (!quizMode || reviewingHistoryAttempt || !questions.length) return;
    const user = await getCurrentUserSafe();
    if (!user) return;

    if (!activeQuizStartedAt) activeQuizStartedAt = new Date().toISOString();

    const payload = {
        user_id: user.id,
        quiz_type: activeQuizType || (currentSubject === "combined" ? "combined" : "subject"),
        subject: currentSubject || null,
        questions: questions,
        status: status,
        current_question: current,
        is_timed: !!activeQuizIsTimed,
        started_at: activeQuizStartedAt,
        end_time: activeQuizEndTime,
        updated_at: new Date().toISOString()
    };

    // Store selected answers inside each saved question without changing the question bank files.
    payload.questions = questions.map((q, i) => ({
        ...q,
        _selectedAnswer: selectedAnswers[i] ?? null
    }));

    const { error } = await supabaseClient
        .from("active_quizzes")
        .upsert(payload, { onConflict: "user_id" });

    if (error) console.error("Active quiz save error:", error);
}

async function loadActiveQuizFromSupabase() {
    const user = await getCurrentUserSafe();
    if (!user) return null;

    const { data, error } = await supabaseClient
        .from("active_quizzes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Active quiz load error:", error);
        return null;
    }
    return data || null;
}

async function refreshResumeCard() {
    const card = document.getElementById("activeQuizCard");
    if (!card) return;

    const active = await loadActiveQuizFromSupabase();
    if (!active) {
        card.style.display = "none";
        return;
    }

    card.style.display = "block";
    const summary = document.getElementById("activeQuizSummary");
    const subjectLabel = active.subject === "combined"
        ? "Combined ATPL Quiz"
        : (subjectNames[active.subject] || "Quiz");
    const total = Array.isArray(active.questions) ? active.questions.length : 0;
    const position = Math.min((active.current_question || 0) + 1, total || 1);
    const timerText = active.is_timed ? " • Timed" : "";
    summary.textContent = `${subjectLabel} — Question ${position} of ${total}${timerText}`;
}

async function resumeActiveQuiz() {
    const active = await loadActiveQuizFromSupabase();
    if (!active) {
        alert("No unfinished quiz was found.");
        refreshResumeCard();
        return;
    }

    questions = (active.questions || []).map(q => {
        const copy = { ...q };
        delete copy._selectedAnswer;
        return copy;
    });
    selectedAnswers = (active.questions || []).map(q => q._selectedAnswer ?? null);
    status = Array.isArray(active.status)
        ? active.status
        : new Array(questions.length).fill("notAttempted");
    current = Math.max(0, Math.min(active.current_question || 0, Math.max(questions.length - 1, 0)));
    quizMode = true;
    currentSubject = active.subject;
    activeQuizType = active.quiz_type;
    activeQuizIsTimed = !!active.is_timed;
    activeQuizStartedAt = active.started_at;
    activeQuizEndTime = active.end_time;
    activeQuizTimeLimitMinutes = active.end_time && active.started_at
        ? Math.max(1, Math.round((new Date(active.end_time) - new Date(active.started_at)) / 60000))
        : null;
    quizCompletedSaved = false;
    reviewingHistoryAttempt = false;

    if (activeQuizIsTimed && activeQuizEndTime && new Date(activeQuizEndTime).getTime() <= Date.now()) {
        showOnly("quizScreen");
        await finishQuizBecauseTimeExpired();
        return;
    }

    showOnly("quizScreen");
    document.getElementById("subject").innerHTML = currentSubject === "combined"
        ? "COMBINED ATPL QUIZ"
        : (subjectNames[currentSubject] || "QUIZ") + " QUIZ";
    await loadMarkedQuestions();
    createNavigator();
    showQuestion();
    startQuizTimer();
}

async function discardActiveQuiz() {
    if (!confirm("Discard this unfinished quiz? This cannot be undone.")) return;
    await deleteActiveQuizFromSupabase();
    stopQuizTimer();
    refreshResumeCard();
}

async function deleteActiveQuizFromSupabase() {
    const user = await getCurrentUserSafe();
    if (!user) return;
    const { error } = await supabaseClient
        .from("active_quizzes")
        .delete()
        .eq("user_id", user.id);
    if (error) console.error("Active quiz delete error:", error);
}

function startQuizTimer() {
    stopQuizTimer();
    const timer = document.getElementById("quizTimer");
    if (!timer) return;

    if (!activeQuizIsTimed || !activeQuizEndTime || reviewingHistoryAttempt) {
        timer.style.display = "none";
        return;
    }

    timer.style.display = "block";
    updateQuizTimerDisplay();
    activeQuizTimerInterval = setInterval(updateQuizTimerDisplay, 1000);
}

function stopQuizTimer() {
    if (activeQuizTimerInterval) clearInterval(activeQuizTimerInterval);
    activeQuizTimerInterval = null;
}

async function updateQuizTimerDisplay() {
    const timer = document.getElementById("quizTimer");
    if (!timer || !activeQuizEndTime) return;
    const remaining = new Date(activeQuizEndTime).getTime() - Date.now();
    if (remaining <= 0) {
        timer.textContent = "⏱ 00:00";
        stopQuizTimer();
        await finishQuizBecauseTimeExpired();
        return;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    timer.textContent = hours > 0
        ? `⏱ ${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`
        : `⏱ ${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}

async function finishQuizBecauseTimeExpired() {
    if (!quizMode || reviewingHistoryAttempt || quizCompletedSaved) return;
    status = status.map(value => value === "notAttempted" ? "skipped" : value);
    createNavigator();
    alert("Time is up. Your quiz has been submitted automatically.");
    await showResults();
}

async function saveQuizHistory(summary) {
    const user = await getCurrentUserSafe();
    if (!user) return;

    const completedAt = new Date();
    const started = activeQuizStartedAt ? new Date(activeQuizStartedAt) : completedAt;
    const timeTakenSeconds = Math.max(0, Math.round((completedAt - started) / 1000));
    const savedQuestions = questions.map((q, i) => ({
        ...q,
        _selectedAnswer: selectedAnswers[i] ?? null
    }));

    const { error } = await supabaseClient.from("quiz_history").insert({
        user_id: user.id,
        quiz_type: activeQuizType || "subject",
        subject: currentSubject || null,
        questions: savedQuestions,
        status: status,
        total_questions: summary.total,
        correct_answers: summary.correct,
        wrong_answers: summary.wrong,
        skipped_answers: summary.skipped,
        percentage: summary.percentage,
        is_timed: !!activeQuizIsTimed,
        time_limit_minutes: activeQuizTimeLimitMinutes,
        started_at: activeQuizStartedAt,
        completed_at: completedAt.toISOString(),
        time_taken_seconds: timeTakenSeconds
    });

    if (error) console.error("Quiz history save error:", error);
}

async function loadQuizHistory() {
    const list = document.getElementById("quizHistoryList");
    if (!list) return;
    list.innerHTML = "Loading quiz history...";
    const user = await getCurrentUserSafe();
    if (!user) {
        list.innerHTML = "Please log in first.";
        return;
    }

    const { data, error } = await supabaseClient
        .from("quiz_history")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Quiz history load error:", error);
        list.innerHTML = "Unable to load quiz history.";
        return;
    }
    if (!data || !data.length) {
        list.innerHTML = "<p>No completed quizzes yet.</p>";
        return;
    }

    list.innerHTML = "";
    data.forEach(attempt => {
        const card = document.createElement("div");
        card.style.borderBottom = "1px solid #ddd";
        card.style.padding = "16px 0";
        const subjectLabel = attempt.subject === "combined"
            ? "Combined ATPL Quiz"
            : (subjectNames[attempt.subject] || attempt.quiz_type || "Quiz");
        const when = attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : "";
        const timed = attempt.is_timed ? ` • Timed (${attempt.time_limit_minutes || "?"} min)` : "";
        card.innerHTML = `<strong>${escapeHTML(subjectLabel)}</strong><br>` +
            `${attempt.percentage ?? 0}% • ${attempt.correct_answers ?? 0}/${attempt.total_questions ?? 0} correct${timed}<br>` +
            `<small>${escapeHTML(when)}</small>`;

        const actions = document.createElement("div");
        actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;";
        const review = document.createElement("button");
        review.className = "modeButton secondaryButton";
        review.textContent = "👁 Review";
        review.onclick = () => reviewHistoryAttempt(attempt);
        const redo = document.createElement("button");
        redo.className = "modeButton primaryButton";
        redo.textContent = "🔁 Redo Same Quiz";
        redo.onclick = () => redoHistoryAttempt(attempt);
        actions.append(review, redo);
        card.appendChild(actions);
        list.appendChild(card);
    });
}

async function reviewHistoryAttempt(attempt) {
    questions = (attempt.questions || []).map(q => {
        const copy = { ...q };
        delete copy._selectedAnswer;
        return copy;
    });
    selectedAnswers = (attempt.questions || []).map(q => q._selectedAnswer ?? null);
    status = Array.isArray(attempt.status) ? attempt.status : [];
    current = 0;
    quizMode = true;
    currentSubject = attempt.subject;
    reviewingHistoryAttempt = true;
    activeQuizIsTimed = false;
    stopQuizTimer();
    showOnly("quizScreen");
    document.getElementById("subject").innerHTML = "QUIZ REVIEW";
    await loadMarkedQuestions();
    createNavigator();
    showQuestion();
}

async function redoHistoryAttempt(attempt) {
    questions = (attempt.questions || []).map(q => {
        const copy = { ...q };
        delete copy._selectedAnswer;
        return copy;
    });
    selectedAnswers = new Array(questions.length).fill(null);
    status = new Array(questions.length).fill("notAttempted");
    current = 0;
    quizMode = true;
    currentSubject = attempt.subject;
    activeQuizType = "redo";
    activeQuizIsTimed = !!attempt.is_timed;
    activeQuizTimeLimitMinutes = attempt.time_limit_minutes || null;
    prepareNewQuizTiming();
    quizCompletedSaved = false;
    reviewingHistoryAttempt = false;
    showOnly("quizScreen");
    document.getElementById("subject").innerHTML = "🔁 REDO PREVIOUS QUIZ";
    await loadMarkedQuestions();
    createNavigator();
    showQuestion();
    await saveActiveQuizToSupabase();
    startQuizTimer();
}

// UI wiring for new controls.
document.getElementById("subjectQuizMode")?.addEventListener("change", function() {
    document.getElementById("subjectTimeLimitWrap").style.display = this.value === "timed" ? "block" : "none";
});
document.getElementById("combinedQuizMode")?.addEventListener("change", function() {
    document.getElementById("combinedTimeLimitWrap").style.display = this.value === "timed" ? "block" : "none";
});
document.getElementById("resumeQuizBtn")?.addEventListener("click", resumeActiveQuiz);
document.getElementById("discardQuizBtn")?.addEventListener("click", discardActiveQuiz);
document.getElementById("quizHistoryBtn")?.addEventListener("click", async function() {
    showOnly("quizHistoryScreen");
    await loadQuizHistory();
});
document.getElementById("quizHistoryBackBtn")?.addEventListener("click", function() {
    showOnly("homeScreen");
});

// Refresh resume availability whenever Supabase establishes a signed-in session.
supabaseClient.auth.onAuthStateChange(function(event, session) {
    if (session && session.user) {
        setTimeout(refreshResumeCard, 0);
    }
});
setTimeout(refreshResumeCard, 500);
