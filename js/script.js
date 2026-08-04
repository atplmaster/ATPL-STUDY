// ========================================
// ATPL STUDY PLATFORM
// CLEAN STABLE VERSION
// ========================================


// ========================================
// GLOBAL VARIABLES
// ========================================

let questions = [];
let current = 0;
let status = [];
let quizMode = false;
let markedIds = new Set();
let questionCache = null;


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
        "quizScreen",
        "resultsScreen",
        "searchScreen",
        "markedScreen"
    ];

    screens.forEach(function (id) {

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

document.getElementById("practiceBtn").onclick = function () {

    showOnly("practiceSetup");

};


// ========================================
// START PRACTICE
// ========================================

document.getElementById("startPracticeBtn").onclick = function () {

    quizMode = false;

    const subjectFile =
        document.getElementById("practiceSubjectSelect").value;

    showOnly("quizScreen");

    loadPracticeQuestions(subjectFile);

};


// ========================================
// PRACTICE BACK
// ========================================

document.getElementById("practiceBackBtn").onclick = function () {

    showOnly("homeScreen");

};


// ========================================
// SUBJECT QUIZ
// ========================================

document.getElementById("subjectQuizBtn").onclick = function () {

    showOnly("quizSetup");

};


// ========================================
// START SUBJECT QUIZ
// ========================================

document.getElementById("startQuizBtn").onclick = function () {

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

document.getElementById("backHomeBtn").onclick = function () {

    showOnly("homeScreen");

};


// ========================================
// COMBINED QUIZ
// ========================================

document.getElementById("combinedQuizBtn").onclick = function () {

    showOnly("combinedQuizSetup");

    loadCombinedQuestionCount();

};


// ========================================
// COMBINED BACK
// ========================================

document.getElementById("combinedBackBtn").onclick = function () {

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
        function (option) {

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

document.getElementById("startCombinedBtn").onclick = function () {

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

        questions.forEach(function (question) {

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

        await loadSavedProgress();

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

        allQuestions.forEach(function (question) {

            question.subject =
                subjectFile;

        });

        // Randomize questions

        allQuestions.sort(function () {

            return Math.random() - 0.5;

        });

        // Select number of questions

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

        await loadSavedProgress();

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
                    "Unable to load " + file + ".json"
                );

            }

            const data =
                await response.json();

            data.forEach(function (question) {

                question.subject =
                    file;

                combinedQuestions.push(
                    question
                );

            });

        }

        // Randomize all questions

        combinedQuestions.sort(function () {

            return Math.random() - 0.5;

        });

        // Select number of questions

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

        await loadSavedProgress();

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
        function (question, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.innerHTML =
                index + 1;

            button.className =
                "navButton " +
                status[index];

            if (
                question.id &&
                markedIds.has(question.id)
            ) {

                button.classList.add(
                    "marked"
                );

            }

            button.onclick =
                function () {

                    current = index;

                    showQuestion();

                };

            nav.appendChild(button);

        }
    );

}


// ========================================
// SHOW QUESTION
// ========================================

function showQuestion() {

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

    document.getElementById(
        "question"
    ).innerHTML =
        question.question;

    const answers =
        document.getElementById(
            "answers"
        );

    answers.innerHTML = "";

    question.options.forEach(
        function (option, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "option";

            button.innerHTML =
                option;

            // If already answered,
            // show the previous result

            if (status[current] === "correct") {

                if (index === question.answer) {

                    button.classList.add(
                        "correct"
                    );

                }

            }

            if (status[current] === "wrong") {

                if (index === question.answer) {

                    button.classList.add(
                        "correct"
                    );

                }

            }

            button.onclick =
                async function () {

                    // Do not answer twice

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

                        // Show correct answer

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

    updateMarkButtonUI();

}


// ========================================
// NEXT BUTTON
// ========================================

document.getElementById("nextBtn").onclick =
function () {

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

document.getElementById("prevBtn").onclick =
function () {

    if (current > 0) {

        current--;

        showQuestion();

    }

};


// ========================================
// SKIP BUTTON
// ========================================

document.getElementById("skipBtn").onclick =
function () {

    status[current] =
        "skipped";

    if (
        current <
        questions.length - 1
    ) {

        current++;

        showQuestion();

    } else if (quizMode) {

        showResults();

    }

    createNavigator();

};


// ========================================
// BACK TO MENU
// ========================================

document.getElementById(
    "questionBackBtn"
).onclick =
function () {

    showOnly("homeScreen");

    checkAdminAccess();

};


// ========================================
// SHOW RESULTS
// ========================================

function showResults() {

    // A quiz just finished - saved progress for
    // these questions is no longer needed, so the
    // next attempt starts fresh (unanswered).

    if (quizMode) {

        const questionIds =
            questions
                .map(function (question) {
                    return question.id;
                })
                .filter(Boolean);

        clearProgressByQuestionIds(questionIds);

    }

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    status.forEach(
        function (result) {

            if (result === "correct") {
                correct++;
            }

            if (result === "wrong") {
                wrong++;
            }

            if (result === "skipped") {
                skipped++;
            }

        }
    );

    const total =
        questions.length;

    const percentage =
        total > 0
            ? Math.round(
                (correct / total) * 100
            )
            : 0;

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

}


// ========================================
// REVIEW ANSWERS
// ========================================

document.getElementById(
    "reviewBtn"
).onclick =
function () {

    current = 0;

    showOnly("quizScreen");

    showQuestion();

};


// ========================================
// RESULTS HOME
// ========================================

document.getElementById(
    "resultsHomeBtn"
).onclick =
function () {

    showOnly("homeScreen");

    checkAdminAccess();

};


// ========================================
// CREATE ACCOUNT
// ========================================

document.getElementById(
    "signupBtn"
).onclick =
async function () {

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

                email: email,

                password: password

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
async function () {

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

                email: email,

                password: password

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

        if (!data || !data.user) {

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

        showOnly("homeScreen");

        await checkAdminAccess();

        await refreshMarkedIds();

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
// CLEAR PROGRESS (used when a quiz is
// completed, or when practice progress
// is explicitly reset by the user)
// ========================================

async function clearProgressByQuestionIds(questionIds) {

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

        if (!questionIds || !questionIds.length) {
            return;
        }

        const {
            error
        } =
            await supabaseClient
                .from("progress")
                .delete()
                .eq(
                    "user_id",
                    user.id
                )
                .in(
                    "question_id",
                    questionIds
                );

        if (error) {

            console.error(
                "Progress clear error:",
                error
            );

        }

    } catch (error) {

        console.error(
            "Progress clear error:",
            error
        );

    }

}


async function clearProgressBySubject(subjectFile) {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            alert(
                "You must be logged in to reset progress."
            );

            return;

        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("progress")
                .delete()
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "subject",
                    subjectFile
                )
                .select();

        if (error) {

            console.error(
                "Progress reset error:",
                error
            );

            alert(
                "Could not reset progress: " +
                error.message
            );

            return;

        }

        const deletedCount =
            data ? data.length : 0;

        console.log(
            "Progress reset - rows deleted:",
            deletedCount,
            data
        );

        alert(
            "Progress reset for " +
            (subjectNames[subjectFile] || subjectFile) +
            ". Entries removed: " +
            deletedCount
        );

    } catch (error) {

        console.error(
            "Progress reset error:",
            error
        );

        alert(
            "Could not reset progress. Please try again."
        );

    }

}


// ========================================
// RESET PRACTICE PROGRESS BUTTON
// ========================================

document.getElementById(
    "resetPracticeBtn"
).onclick =
async function () {

    const subjectFile =
        document.getElementById(
            "practiceSubjectSelect"
        ).value;

    const confirmed =
        confirm(
            "Reset saved practice progress for " +
            (subjectNames[subjectFile] || subjectFile) +
            "? This cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    await clearProgressBySubject(subjectFile);

};


// ========================================
// QUESTION CACHE (used by Search and
// Marked Questions, so subject files are
// only fetched once)
// ========================================

async function getAllQuestionsCached() {

    if (questionCache) {
        return questionCache;
    }

    const all = [];

    for (const file of subjectFiles) {

        try {

            const response =
                await fetch(
                    "data/" + file + ".json"
                );

            if (!response.ok) {
                continue;
            }

            const data =
                await response.json();

            data.forEach(function (question) {

                question.subject =
                    file;

                all.push(question);

            });

        } catch (error) {

            console.error(
                "Question cache error:",
                error
            );

        }

    }

    questionCache = all;

    return all;

}


// ========================================
// OPEN A SET OF QUESTIONS FOR REVIEW
// (used by both Search results and the
// Marked Questions list)
// ========================================

async function openQuestionSet(list, index) {

    questions = list;

    status =
        new Array(list.length)
            .fill("notAttempted");

    current = index;

    quizMode = false;

    showOnly("quizScreen");

    document.getElementById(
        "subject"
    ).innerHTML =
        "Review";

    createNavigator();

    showQuestion();

    await loadSavedProgress();

}


// ========================================
// SEARCH QUESTIONS
// ========================================

document.getElementById(
    "searchBtn"
).onclick =
async function () {

    showOnly("searchScreen");

    document.getElementById(
        "searchInput"
    ).value = "";

    document.getElementById(
        "searchResults"
    ).innerHTML =
        "Loading questions...";

    await getAllQuestionsCached();

    document.getElementById(
        "searchResults"
    ).innerHTML =
        "Type at least 2 characters to search.";

    document.getElementById(
        "searchInput"
    ).focus();

};

document.getElementById(
    "searchBackBtn"
).onclick =
function () {

    showOnly("homeScreen");

};

let searchDebounceTimer = null;

document.getElementById(
    "searchInput"
).oninput =
function () {

    const term =
        this.value
            .trim()
            .toLowerCase();

    clearTimeout(
        searchDebounceTimer
    );

    searchDebounceTimer =
        setTimeout(
            async function () {

                const container =
                    document.getElementById(
                        "searchResults"
                    );

                if (term.length < 2) {

                    container.innerHTML =
                        "Type at least 2 characters to search.";

                    return;

                }

                const allQuestions =
                    await getAllQuestionsCached();

                const matches =
                    allQuestions
                        .filter(function (question) {

                            return question.question
                                .toLowerCase()
                                .includes(term);

                        })
                        .slice(0, 100);

                if (!matches.length) {

                    container.innerHTML =
                        "No questions found.";

                    return;

                }

                renderResultList(
                    "searchResults",
                    matches,
                    false
                );

            },
            150
        );

};


// ========================================
// MARKED QUESTIONS
// ========================================

document.getElementById(
    "markedBtn"
).onclick =
async function () {

    showOnly("markedScreen");

    await loadMarkedQuestionsList();

};

document.getElementById(
    "markedBackBtn"
).onclick =
function () {

    showOnly("homeScreen");

};

async function loadMarkedQuestionsList() {

    const container =
        document.getElementById(
            "markedResults"
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
                    "question_id"
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
                "Unable to load marked questions: " +
                escapeHTML(error.message);

            return;

        }

        if (!data || !data.length) {

            container.innerHTML =
                "No marked questions yet. Tap \"Mark for Review\" on any question to add it here.";

            return;

        }

        const allQuestions =
            await getAllQuestionsCached();

        const found = [];

        data.forEach(function (row) {

            const match =
                allQuestions.find(function (question) {

                    return question.id ===
                        row.question_id;

                });

            if (match) {
                found.push(match);
            }

        });

        if (!found.length) {

            container.innerHTML =
                "No marked questions yet.";

            return;

        }

        renderResultList(
            "markedResults",
            found,
            true
        );

    } catch (error) {

        console.error(
            "Marked questions error:",
            error
        );

        container.innerHTML =
            "Unable to load marked questions.";

    }

}


// ========================================
// RENDER A LIST OF QUESTION RESULTS
// (shared by Search and Marked Questions)
// ========================================

function renderResultList(containerId, list, showUnmark) {

    const container =
        document.getElementById(
            containerId
        );

    container.innerHTML = "";

    list.forEach(function (question, index) {

        const row =
            document.createElement("div");

        row.className =
            "resultItem";

        const textSpan =
            document.createElement("span");

        textSpan.className =
            "resultText";

        textSpan.innerHTML =
            "<strong>" +
            escapeHTML(
                subjectNames[question.subject] ||
                question.subject
            ) +
            "</strong><br>" +
            escapeHTML(question.question);

        textSpan.onclick =
            function () {

                openQuestionSet(
                    list,
                    index
                );

            };

        row.appendChild(textSpan);

        if (showUnmark) {

            const unmarkBtn =
                document.createElement("button");

            unmarkBtn.className =
                "unmarkBtn";

            unmarkBtn.innerHTML =
                "✕";

            unmarkBtn.onclick =
                async function (event) {

                    event.stopPropagation();

                    await setMarked(
                        question,
                        false
                    );

                    await loadMarkedQuestionsList();

                };

            row.appendChild(unmarkBtn);

        }

        container.appendChild(row);

    });

}


// ========================================
// MARK / UNMARK A QUESTION
// ========================================

async function refreshMarkedIds() {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            markedIds = new Set();

            return;

        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("marked_questions")
                .select(
                    "question_id"
                )
                .eq(
                    "user_id",
                    user.id
                );

        if (error) {

            console.error(
                "Marked ids load error:",
                error
            );

            return;

        }

        markedIds =
            new Set(
                (data || []).map(function (row) {
                    return row.question_id;
                })
            );

    } catch (error) {

        console.error(
            "Marked ids load error:",
            error
        );

    }

}

async function setMarked(question, shouldMark) {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            alert(
                "You must be logged in to mark questions."
            );

            return;

        }

        if (!question.id) {
            return;
        }

        if (shouldMark) {

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
                            question.subject ||
                            "unknown"

                    });

            // Ignore "already marked" (unique
            // constraint) errors - not a real problem

            if (error && error.code !== "23505") {

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

            markedIds.add(question.id);

        } else {

            const {
                error
            } =
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
                    "Unable to unmark question: " +
                    error.message
                );

                return;

            }

            markedIds.delete(question.id);

        }

    } catch (error) {

        console.error(
            "Mark toggle error:",
            error
        );

    }

}

document.getElementById(
    "markToggleBtn"
).onclick =
async function () {

    if (!questions.length) {
        return;
    }

    const question =
        questions[current];

    const isMarked =
        markedIds.has(question.id);

    await setMarked(
        question,
        !isMarked
    );

    updateMarkButtonUI();

    createNavigator();

};

function updateMarkButtonUI() {

    const btn =
        document.getElementById(
            "markToggleBtn"
        );

    if (!btn || !questions.length) {
        return;
    }

    const question =
        questions[current];

    if (markedIds.has(question.id)) {

        btn.innerHTML =
            "★ Marked for Review";

        btn.classList.add("marked");

    } else {

        btn.innerHTML =
            "🔖 Mark for Review";

        btn.classList.remove("marked");

    }

}


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

async function loadSavedProgress() {

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

        const questionIds =
            questions
                .map(function (question) {
                    return question.id;
                })
                .filter(Boolean);

        if (!questionIds.length) {
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
                .in(
                    "question_id",
                    questionIds
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
                function (record) {

                    const index =
                        questions.findIndex(
                            function (question) {

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
// REQUEST ACCESS
// ========================================

document.getElementById(
    "requestAccessBtn"
).onclick =
function () {

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
function () {

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
async function () {

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

        if (error || !user) {
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
async function () {

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
function () {

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

        if (!data || data.length === 0) {

            container.innerHTML =
                "No access requests.";

            return;

        }

        container.innerHTML = "";

        data.forEach(
            function (request) {

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
                    escapeHTML(request.name) +
                    "<br>" +
                    "<strong>Email:</strong> " +
                    escapeHTML(request.email) +
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
                    function () {

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
                    function () {

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
                "Unable to load approved users: " +
                escapeHTML(error.message);

            return;

        }

        if (!data || data.length === 0) {

            container.innerHTML =
                "No approved users.";

            return;

        }

        container.innerHTML = "";

        data.forEach(
            function (user) {

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

showOnly("loginScreen");

checkAdminAccess();

refreshMarkedIds();