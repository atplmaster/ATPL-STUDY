// ============================================================
// ATPL STUDY PLATFORM
// COMPLETE REPLACEMENT script.js
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

let currentQuizQuestions = [];

let currentQuizType = null;

let currentQuizSubject = null;

let currentUser = null;

let currentQuestionAnswered = false;

let currentAnswerSelected = null;

let questionBankCache = {};

let isReviewMode = false;


// ============================================================
// SUBJECTS
// ============================================================

const SUBJECTS = {

    meteorology: {
        name: "Meteorology",
        file: "data/meteorology.json"
    },

    airlaw: {
        name: "Air Law",
        file: "data/airlaw.json"
    },

    operational: {
        name: "Operational Procedures",
        file: "data/operational.json"
    }

};


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("ATPL STUDY script.js loaded");

        initializeApplication();

    }
);


// ============================================================
// INITIALIZE APPLICATION
// ============================================================

async function initializeApplication() {

    attachEventListeners();

    await loadCurrentUser();

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (session && session.user) {

        currentUser = session.user;

        await checkApprovedAccess();

        await loadMarkedQuestions();

    }

}


// ============================================================
// ATTACH EVENT LISTENERS
// ============================================================

function attachEventListeners() {


    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    const loginBtn =
        document.getElementById("loginBtn");

    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            loginUser
        );

    }


    // --------------------------------------------------------
    // SIGN UP
    // --------------------------------------------------------

    const signupBtn =
        document.getElementById("signupBtn");

    if (signupBtn) {

        signupBtn.addEventListener(
            "click",
            signupUser
        );

    }


    // --------------------------------------------------------
    // REQUEST ACCESS
    // --------------------------------------------------------

    const requestAccessBtn =
        document.getElementById("requestAccessBtn");

    if (requestAccessBtn) {

        requestAccessBtn.addEventListener(
            "click",
            function () {

                showOnly("accessRequestScreen");

            }
        );

    }


    const backToLoginBtn =
        document.getElementById("backToLoginBtn");

    if (backToLoginBtn) {

        backToLoginBtn.addEventListener(
            "click",
            function () {

                showOnly("loginScreen");

            }
        );

    }


    const submitAccessRequestBtn =
        document.getElementById(
            "submitAccessRequestBtn"
        );

    if (submitAccessRequestBtn) {

        submitAccessRequestBtn.addEventListener(
            "click",
            submitAccessRequest
        );

    }


    // --------------------------------------------------------
    // PRACTICE
    // --------------------------------------------------------

    const practiceBtn =
        document.getElementById("practiceBtn");

    if (practiceBtn) {

        practiceBtn.addEventListener(
            "click",
            openPracticeSetup
        );

    }


    const startPracticeBtn =
        document.getElementById(
            "startPracticeBtn"
        );

    if (startPracticeBtn) {

        startPracticeBtn.addEventListener(
            "click",
            startPractice
        );

    }


    const practiceSubjectSelect =
        document.getElementById(
            "practiceSubjectSelect"
        );

    if (practiceSubjectSelect) {

        practiceSubjectSelect.addEventListener(
            "change",
            updateResetProgressVisibility
        );

    }


    const resetProgressBtn =
        document.getElementById(
            "resetProgressBtn"
        );

    if (resetProgressBtn) {

        resetProgressBtn.addEventListener(
            "click",
            resetSubjectProgress
        );

    }


    // --------------------------------------------------------
    // SUBJECT QUIZ
    // --------------------------------------------------------

    const subjectQuizBtn =
        document.getElementById(
            "subjectQuizBtn"
        );

    if (subjectQuizBtn) {

        subjectQuizBtn.addEventListener(
            "click",
            openQuizSetup
        );

    }


    const startQuizBtn =
        document.getElementById(
            "startQuizBtn"
        );

    if (startQuizBtn) {

        startQuizBtn.addEventListener(
            "click",
            startSubjectQuiz
        );

    }


    // --------------------------------------------------------
    // COMBINED QUIZ
    // --------------------------------------------------------

    const combinedQuizBtn =
        document.getElementById(
            "combinedQuizBtn"
        );

    if (combinedQuizBtn) {

        combinedQuizBtn.addEventListener(
            "click",
            openCombinedQuizSetup
        );

    }


    const startCombinedBtn =
        document.getElementById(
            "startCombinedBtn"
        );

    if (startCombinedBtn) {

        startCombinedBtn.addEventListener(
            "click",
            startCombinedQuiz
        );

    }


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    const searchBtn =
        document.getElementById("searchBtn");

    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            openSearch
        );

    }


    const searchQuestionsBtn =
        document.getElementById(
            "searchQuestionsBtn"
        );

    if (searchQuestionsBtn) {

        searchQuestionsBtn.addEventListener(
            "click",
            searchQuestions
        );

    }


    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    searchQuestions();

                }

            }
        );

    }


    // --------------------------------------------------------
    // MARKED
    // --------------------------------------------------------

    const markedBtn =
        document.getElementById("markedBtn");

    if (markedBtn) {

        markedBtn.addEventListener(
            "click",
            openMarkedQuestions
        );

    }


    const allMarkedQuizBtn =
        document.getElementById(
            "allMarkedQuizBtn"
        );

    if (allMarkedQuizBtn) {

        allMarkedQuizBtn.addEventListener(
            "click",
            function () {

                startMarkedQuiz("all");

            }
        );

    }


    const meteorologyMarkedQuizBtn =
        document.getElementById(
            "meteorologyMarkedQuizBtn"
        );

    if (meteorologyMarkedQuizBtn) {

        meteorologyMarkedQuizBtn.addEventListener(
            "click",
            function () {

                startMarkedQuiz("meteorology");

            }
        );

    }


    const airlawMarkedQuizBtn =
        document.getElementById(
            "airlawMarkedQuizBtn"
        );

    if (airlawMarkedQuizBtn) {

        airlawMarkedQuizBtn.addEventListener(
            "click",
            function () {

                startMarkedQuiz("airlaw");

            }
        );

    }


    const operationalMarkedQuizBtn =
        document.getElementById(
            "operationalMarkedQuizBtn"
        );

    if (operationalMarkedQuizBtn) {

        operationalMarkedQuizBtn.addEventListener(
            "click",
            function () {

                startMarkedQuiz("operational");

            }
        );

    }


    // --------------------------------------------------------
    // PROGRESS
    // --------------------------------------------------------

    const progressBtn =
        document.getElementById("progressBtn");

    if (progressBtn) {

        progressBtn.addEventListener(
            "click",
            openProgress
        );

    }


    // --------------------------------------------------------
    // ADMIN
    // --------------------------------------------------------

    const adminBtn =
        document.getElementById("adminBtn");

    if (adminBtn) {

        adminBtn.addEventListener(
            "click",
            openAdmin
        );

    }


    // --------------------------------------------------------
    // NAVIGATION
    // --------------------------------------------------------

    const prevBtn =
        document.getElementById("prevBtn");

    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            previousQuestion
        );

    }


    const nextBtn =
        document.getElementById("nextBtn");

    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            nextQuestion
        );

    }


    const skipBtn =
        document.getElementById("skipBtn");

    if (skipBtn) {

        skipBtn.addEventListener(
            "click",
            skipQuestion
        );

    }


    const markQuestionBtn =
        document.getElementById(
            "markQuestionBtn"
        );

    if (markQuestionBtn) {

        markQuestionBtn.addEventListener(
            "click",
            toggleMarkQuestion
        );

    }


    // --------------------------------------------------------
    // BACK BUTTONS
    // --------------------------------------------------------

    const progressBackBtn =
        document.getElementById(
            "progressBackBtn"
        );

    if (progressBackBtn) {

        progressBackBtn.addEventListener(
            "click",
            openDashboard
        );

    }


    const adminBackBtn =
        document.getElementById(
            "adminBackBtn"
        );

    if (adminBackBtn) {

        adminBackBtn.addEventListener(
            "click",
            openDashboard
        );

    }


    const practiceBackBtn =
        document.getElementById(
            "practiceBackBtn"
        );

    if (practiceBackBtn) {

        practiceBackBtn.addEventListener(
            "click",
            openDashboard
        );

    }


    const backHomeBtn =
        document.getElementById("backHomeBtn");

    if (backHomeBtn) {

        backHomeBtn.addEventListener(
            "click",
            openDashboard
        );

    }


    const combinedBackBtn =
        document.getElementById(
            "combinedBackBtn"
        );

    if (combinedBackBtn) {

        combinedBackBtn.addEventListener(
            "click",
            openDashboard
        );

    }


    const searchBackBtn =
        document.getElementById(
            "searchBackBtn"
        );

    if (searchBackBtn) {

        searchBackBtn.addEventListener(
            "click",
            openDashboard
        );

    }


    const markedBackBtn =
        document.getElementById(
            "markedBackBtn"
        );

    if (markedBackBtn) {

        markedBackBtn.addEventListener(
            "click",
            openDashboard
        );

    }


    const questionBackBtn =
        document.getElementById(
            "questionBackBtn"
        );

    if (questionBackBtn) {

        questionBackBtn.addEventListener(
            "click",
            function () {

                if (confirm(
                    "Leave this question session?"
                )) {

                    openDashboard();

                }

            }
        );

    }


    const resultsHomeBtn =
        document.getElementById(
            "resultsHomeBtn"
        );

    if (resultsHomeBtn) {

        resultsHomeBtn.addEventListener(
            "click",
            openDashboard
        );

    }


    // --------------------------------------------------------
    // RESULTS
    // --------------------------------------------------------

    const reviewBtn =
        document.getElementById("reviewBtn");

    if (reviewBtn) {

        reviewBtn.addEventListener(
            "click",
            reviewAnswers
        );

    }


    const redoWrongBtn =
        document.getElementById(
            "redoWrongBtn"
        );

    if (redoWrongBtn) {

        redoWrongBtn.addEventListener(
            "click",
            redoWrongQuestions
        );

    }

}


// ============================================================
// SHOW ONLY ONE SCREEN
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
        "quizScreen",
        "resultsScreen"

    ];


    screens.forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.style.display =
                    "none";

            }

        }
    );


    const selected =
        document.getElementById(screenId);


    if (selected) {

        selected.style.display = "block";

    }

}


// ============================================================
// DASHBOARD
// ============================================================

function openDashboard() {

    showOnly("homeScreen");

    setActiveSidebar(
        "sidebarHomeBtn"
    );

}


// ============================================================
// ACTIVE SIDEBAR
// ============================================================

function setActiveSidebar(buttonId) {

    document
        .querySelectorAll(
            ".sidebarButton"
        )
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );


    const button =
        document.getElementById(buttonId);


    if (button) {

        button.classList.add("active");

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// LOAD CURRENT USER
// ============================================================

async function loadCurrentUser() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error) {

            console.error(
                "Get user error:",
                error
            );

            return null;

        }


        currentUser =
            data.user || null;


        return currentUser;

    } catch (error) {

        console.error(
            "Current user error:",
            error
        );

        return null;

    }

}


// ============================================================
// LOGIN
// ============================================================

async function loginUser() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!email || !password) {

        setMessage(
            message,
            "Please enter your email and password.",
            "error"
        );

        return;

    }


    setMessage(
        message,
        "Logging in...",
        "info"
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({
                    email: email,
                    password: password
                });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            setMessage(
                message,
                error.message,
                "error"
            );

            return;

        }


        currentUser =
            data.user;


        // Check whether account is approved
        const approved =
            await checkApprovedAccess(
                true
            );


        if (!approved) {

            await supabaseClient
                .auth
                .signOut();

            return;

        }


        await showLoggedInApplication();

    } catch (error) {

        console.error(
            "Login exception:",
            error
        );

        setMessage(
            message,
            "Unable to login. Please try again.",
            "error"
        );

    }

}


// ============================================================
// SIGN UP
// ============================================================

async function signupUser() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!email || !password) {

        setMessage(
            message,
            "Enter an email and password first.",
            "error"
        );

        return;

    }


    if (password.length < 6) {

        setMessage(
            message,
            "Password must contain at least 6 characters.",
            "error"
        );

        return;

    }


    setMessage(
        message,
        "Creating account...",
        "info"
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signUp({
                    email: email,
                    password: password
                });


        if (error) {

            console.error(
                "Signup error:",
                error
            );

            setMessage(
                message,
                error.message,
                "error"
            );

            return;

        }


        if (
            data.user &&
            !data.session
        ) {

            setMessage(
                message,
                "Account created. Check your email to confirm your account, then request access.",
                "success"
            );

            return;

        }


        if (data.user) {

            currentUser =
                data.user;

            setMessage(
                message,
                "Account created successfully. Please request access.",
                "success"
            );

        }

    } catch (error) {

        console.error(
            "Signup exception:",
            error
        );

        setMessage(
            message,
            "Unable to create account.",
            "error"
        );

    }

}


// ============================================================
// REQUEST ACCESS
// ============================================================

async function submitAccessRequest() {

    const name =
        document
            .getElementById("requestName")
            .value
            .trim();

    const email =
        document
            .getElementById("requestEmail")
            .value
            .trim()
            .toLowerCase();

    const reason =
        document
            .getElementById("requestReason")
            .value
            .trim();


    const message =
        document.getElementById(
            "accessRequestMessage"
        );


    if (!name || !email) {

        setMessage(
            message,
            "Please enter your name and email.",
            "error"
        );

        return;

    }


    setMessage(
        message,
        "Submitting request...",
        "info"
    );


    try {

        // Check whether request already exists
        const {
            data: existing,
            error: existingError
        } =
            await supabaseClient
                .from("access_requests")
                .select("*")
                .eq("email", email)
                .maybeSingle();


        if (
            existingError &&
            !isMissingTableError(existingError)
        ) {

            console.error(
                "Request lookup error:",
                existingError
            );

        }


        if (existing) {

            if (
                String(existing.status || "")
                    .toLowerCase() === "pending"
            ) {

                setMessage(
                    message,
                    "Your access request is already pending.",
                    "info"
                );

                return;

            }

        }


        const insertData = {

            name: name,
            email: email,
            reason: reason,
            status: "pending"

        };


        const {
            error
        } =
            await supabaseClient
                .from("access_requests")
                .insert(insertData);


        if (error) {

            console.error(
                "Access request error:",
                error
            );


            if (
                String(error.message)
                    .toLowerCase()
                    .includes("duplicate")
            ) {

                setMessage(
                    message,
                    "An access request for this email already exists.",
                    "error"
                );

            } else {

                setMessage(
                    message,
                    error.message,
                    "error"
                );

            }

            return;

        }


        document
            .getElementById("requestName")
            .value = "";

        document
            .getElementById("requestEmail")
            .value = "";

        document
            .getElementById("requestReason")
            .value = "";


        setMessage(
            message,
            "Request submitted successfully. An administrator will review it.",
            "success"
        );


    } catch (error) {

        console.error(
            "Access request exception:",
            error
        );

        setMessage(
            message,
            "Unable to submit request.",
            "error"
        );

    }

}


// ============================================================
// APPROVED ACCESS CHECK
// ============================================================

async function checkApprovedAccess(showMessage = false) {

    if (!currentUser) {

        await loadCurrentUser();

    }


    if (!currentUser) {

        return false;

    }


    const email =
        String(
            currentUser.email || ""
        )
        .trim()
        .toLowerCase();


    if (!email) {

        return false;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("approved_users")
                .select("*")
                .eq("email", email)
                .maybeSingle();


        if (error) {

            console.error(
                "Approved access check:",
                error
            );


            // Do not block login merely because
            // the table cannot be read.
            return true;

        }


        if (data) {

            return true;

        }


        if (showMessage) {

            setMessage(
                document.getElementById(
                    "loginMessage"
                ),
                "Your account has not been approved yet. Please request access.",
                "error"
            );

        }


        return false;

    } catch (error) {

        console.error(
            "Access check exception:",
            error
        );

        return true;

    }

}


// ============================================================
// SHOW LOGGED-IN APPLICATION
// ============================================================

async function showLoggedInApplication() {

    const loginArea =
        document.getElementById(
            "loginArea"
        );

    const mainApplication =
        document.getElementById(
            "mainApplication"
        );


    if (loginArea) {

        loginArea.style.display =
            "none";

    }


    if (mainApplication) {

        mainApplication.style.display =
            "flex";

    }


    updateUserDisplay();

    openDashboard();

    await updateAdminSidebar();

    await loadMarkedQuestions();

}


// ============================================================
// USER DISPLAY
// ============================================================

function updateUserDisplay() {

    if (!currentUser) {

        return;

    }


    const email =
        currentUser.email || "ATPL Student";


    const userName =
        document.getElementById(
            "sidebarUserName"
        );


    if (userName) {

        userName.textContent =
            email;

    }

}


// ============================================================
// ADMIN SIDEBAR
// ============================================================

async function updateAdminSidebar() {

    const adminButton =
        document.getElementById(
            "sidebarAdminBtn"
        );

    const adminDashboardButton =
        document.getElementById(
            "adminBtn"
        );

    const role =
        document.getElementById(
            "sidebarUserRole"
        );


    if (!adminButton) {

        return false;

    }


    try {

        if (!currentUser) {

            await loadCurrentUser();

        }


        if (!currentUser) {

            adminButton.style.display =
                "none";

            return false;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("admin_users")
                .select("email")
                .eq(
                    "email",
                    currentUser.email
                )
                .maybeSingle();


        if (!error && data) {

            adminButton.style.display =
                "flex";

            if (adminDashboardButton) {

                adminDashboardButton.style.display =
                    "inline-flex";

            }

            if (role) {

                role.textContent =
                    "Administrator";

            }

            return true;

        }


        adminButton.style.display =
            "none";

        if (adminDashboardButton) {

            adminDashboardButton.style.display =
                "none";

        }

        if (role) {

            role.textContent =
                "Student";

        }


        return false;

    } catch (error) {

        console.error(
            "Admin check error:",
            error
        );

        adminButton.style.display =
            "none";

        return false;

    }

}


// ============================================================
// OPEN PRACTICE
// ============================================================

function openPracticeSetup() {

    showOnly("practiceSetup");

    setActiveSidebar(
        "sidebarPracticeBtn"
    );

    updateResetProgressVisibility();

}


// ============================================================
// OPEN SUBJECT QUIZ
// ============================================================

function openQuizSetup() {

    showOnly("quizSetup");

    setActiveSidebar(
        "sidebarSubjectQuizBtn"
    );

}


// ============================================================
// OPEN COMBINED QUIZ
// ============================================================

async function openCombinedQuizSetup() {

    showOnly(
        "combinedQuizSetup"
    );

    setActiveSidebar(
        "sidebarCombinedQuizBtn"
    );


    const available =
        document.getElementById(
            "availableQuestions"
        );


    if (available) {

        available.textContent =
            "Loading questions...";

    }


    const all =
        await loadAllQuestions();


    if (available) {

        available.textContent =
            `Available questions: ${all.length}`;

    }

}


// ============================================================
// LOAD SUBJECT QUESTIONS
// ============================================================

async function loadSubjectQuestions(subject) {

    if (questionBankCache[subject]) {

        return questionBankCache[subject];

    }


    if (!SUBJECTS[subject]) {

        console.error(
            "Unknown subject:",
            subject
        );

        return [];

    }


    try {

        const response =
            await fetch(
                SUBJECTS[subject].file,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} loading ${SUBJECTS[subject].file}`
            );

        }


        const data =
            await response.json();


        let loadedQuestions = [];


        if (Array.isArray(data)) {

            loadedQuestions = data;

        } else if (
            data &&
            Array.isArray(data.questions)
        ) {

            loadedQuestions =
                data.questions;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            loadedQuestions =
                data.data;

        } else {

            console.error(
                "Unknown JSON structure:",
                data
            );

        }


        loadedQuestions =
            loadedQuestions.map(
                function (question, index) {

                    return normalizeQuestion(
                        question,
                        subject,
                        index
                    );

                }
            );


        questionBankCache[subject] =
            loadedQuestions;


        return loadedQuestions;

    } catch (error) {

        console.error(
            `Unable to load ${subject}:`,
            error
        );


        alert(
            `Unable to load ${SUBJECTS[subject].name} questions.\n\n${error.message}`
        );


        return [];

    }

}


// ============================================================
// NORMALIZE QUESTION
// ============================================================

function normalizeQuestion(
    question,
    subject,
    index
) {

    const q =
        Object.assign(
            {},
            question
        );


    q.subject =
        subject;


    if (
        q.id === undefined ||
        q.id === null ||
        q.id === ""
    ) {

        q.id =
            `${subject}-${index}`;

    }


    // Different possible field names
    q.question =
        q.question ??
        q.text ??
        q.questionText ??
        q.Question ??
        "";


    q.options =
        q.options ??
        q.answers ??
        q.choices ??
        q.alternatives ??
        [];


    // Convert object options into array
    if (
        q.options &&
        !Array.isArray(q.options) &&
        typeof q.options === "object"
    ) {

        q.options =
            Object.values(
                q.options
            );

    }


    if (!Array.isArray(q.options)) {

        q.options = [];

    }


    q.correctAnswer =
        q.correctAnswer ??
        q.correct ??
        q.answer ??
        q.correct_answer ??
        q.correctOption ??
        "";


    q.explanation =
        q.explanation ??
        q.explain ??
        q.rationale ??
        "";


    q.image =
        q.image ??
        q.imageUrl ??
        q.imageURL ??
        q.diagram ??
        "";


    return q;

}


// ============================================================
// LOAD ALL QUESTIONS
// ============================================================

async function loadAllQuestions() {

    const all = [];


    for (
        const subject of Object.keys(SUBJECTS)
    ) {

        const subjectQuestions =
            await loadSubjectQuestions(
                subject
            );


        all.push(
            ...subjectQuestions
        );

    }


    return all;

}


// ============================================================
// START PRACTICE
// ============================================================

async function startPractice() {

    const subject =
        document
            .getElementById(
                "practiceSubjectSelect"
            )
            .value;


    const loaded =
        await loadSubjectQuestions(
            subject
        );


    if (!loaded.length) {

        return;

    }


    questions =
        loaded.slice();


    current = 0;

    status =
        createQuestionStatus(
            questions
        );


    currentSubject =
        subject;


    currentQuizType =
        "practice";


    currentQuizSubject =
        subject;


    quizMode = false;

    isReviewMode = false;


    await loadSavedProgress(
        subject
    );


    showQuizScreen();

}


// ============================================================
// START SUBJECT QUIZ
// ============================================================

async function startSubjectQuiz() {

    const subject =
        document
            .getElementById(
                "subjectSelect"
            )
            .value;


    const countValue =
        document
            .getElementById(
                "questionCount"
            )
            .value;


    const loaded =
        await loadSubjectQuestions(
            subject
        );


    if (!loaded.length) {

        return;

    }


    let selectedCount;


    if (countValue === "all") {

        selectedCount =
            loaded.length;

    } else {

        selectedCount =
            parseInt(
                countValue,
                10
            );

    }


    selectedCount =
        Math.min(
            selectedCount,
            loaded.length
        );


    questions =
        shuffleArray(
            loaded.slice()
        )
        .slice(
            0,
            selectedCount
        );


    current = 0;

    status =
        createQuestionStatus(
            questions
        );


    currentSubject =
        subject;


    currentQuizType =
        "subject";


    currentQuizSubject =
        subject;


    quizMode = true;

    isReviewMode = false;

    wrongQuestionsForRedo = [];


    showQuizScreen();

}


// ============================================================
// START COMBINED QUIZ
// ============================================================

async function startCombinedQuiz() {

    const countValue =
        document
            .getElementById(
                "combinedQuestionCount"
            )
            .value;


    const all =
        await loadAllQuestions();


    if (!all.length) {

        return;

    }


    let selectedCount;


    if (countValue === "all") {

        selectedCount =
            all.length;

    } else {

        selectedCount =
            parseInt(
                countValue,
                10
            );

    }


    selectedCount =
        Math.min(
            selectedCount,
            all.length
        );


    questions =
        shuffleArray(
            all
        )
        .slice(
            0,
            selectedCount
        );


    current = 0;

    status =
        createQuestionStatus(
            questions
        );


    currentSubject =
        "combined";


    currentQuizType =
        "combined";


    currentQuizSubject =
        null;


    quizMode = true;

    isReviewMode = false;

    wrongQuestionsForRedo = [];


    showQuizScreen();

}


// ============================================================
// CREATE STATUS
// ============================================================

function createQuestionStatus(questionArray) {

    return questionArray.map(
        function () {

            return {

                answered: false,
                selected: null,
                correct: false,
                skipped: false

            };

        }
    );

}


// ============================================================
// SHOW QUIZ SCREEN
// ============================================================

function showQuizScreen() {

    showOnly("quizScreen");

    renderQuestion();

}


// ============================================================
// RENDER QUESTION
// ============================================================

function renderQuestion() {

    if (
        !questions ||
        !questions.length
    ) {

        return;

    }


    if (
        current < 0
    ) {

        current = 0;

    }


    if (
        current >= questions.length
    ) {

        current =
            questions.length - 1;

    }


    const q =
        questions[current];


    const questionStatus =
        status[current] ||
        {};


    currentQuestionAnswered =
        Boolean(
            questionStatus.answered
        );


    currentAnswerSelected =
        questionStatus.selected ??
        null;


    const subjectElement =
        document.getElementById(
            "subject"
        );


    if (subjectElement) {

        subjectElement.textContent =
            getSubjectName(
                q.subject
            );

    }


    const counter =
        document.getElementById(
            "counter"
        );


    if (counter) {

        counter.textContent =
            `${current + 1} / ${questions.length}`;

    }


    const questionElement =
        document.getElementById(
            "question"
        );


    if (questionElement) {

        questionElement.innerHTML =
            formatQuestionText(
                q.question
            );

    }


    renderQuestionImages(q);

    renderAnswers(q);

    renderNavigator();

    updateMarkButton();

    updateNavigationButtons();

}


// ============================================================
// FORMAT QUESTION
// ============================================================

function formatQuestionText(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    let output =
        escapeHTML(text);


    output =
        output.replace(
            /\n/g,
            "<br>"
        );


    return output;

}


// ============================================================
// RENDER IMAGES
// ============================================================

function renderQuestionImages(q) {

    const container =
        document.getElementById(
            "questionImages"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const images = [];


    if (q.image) {

        if (Array.isArray(q.image)) {

            images.push(
                ...q.image
            );

        } else {

            images.push(
                q.image
            );

        }

    }


    if (Array.isArray(q.images)) {

        images.push(
            ...q.images
        );

    }


    images.forEach(
        function (image) {

            if (!image) {

                return;

            }


            const img =
                document.createElement(
                    "img"
                );


            img.src =
                image;


            img.alt =
                "Question diagram";


            img.loading =
                "lazy";


            img.onerror =
                function () {

                    console.error(
                        "Unable to load question image:",
                        image
                    );

                    img.style.display =
                        "none";

                };


            container.appendChild(
                img
            );

        }
    );

}


// ============================================================
// RENDER ANSWERS
// ============================================================

function renderAnswers(q) {

    const answersContainer =
        document.getElementById(
            "answers"
        );


    if (!answersContainer) {

        return;

    }


    answersContainer.innerHTML =
        "";


    const options =
        q.options || [];


    if (!options.length) {

        answersContainer.innerHTML =
            "<p>No answer options found for this question.</p>";

        return;

    }


    options.forEach(
        function (option, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "answerOption";


            const label =
                getOptionLabel(
                    index
                );


            button.innerHTML =
                `<span class="answerLetter">${escapeHTML(label)}</span><span class="answerText">${formatQuestionText(getOptionText(option))}</span>`;


            const selected =
                isOptionSelected(
                    option,
                    index,
                    currentAnswerSelected
                );


            if (selected) {

                button.classList.add(
                    "selected"
                );

            }


            if (
                isReviewMode ||
                currentQuestionAnswered
            ) {

                const isCorrect =
                    isCorrectAnswer(
                        option,
                        index,
                        q.correctAnswer
                    );


                if (isCorrect) {

                    button.classList.add(
                        "correct"
                    );

                }


                if (
                    selected &&
                    !isCorrect
                ) {

                    button.classList.add(
                        "wrong"
                    );

                }

            }


            if (
                !isReviewMode &&
                !currentQuestionAnswered
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        selectAnswer(
                            index,
                            option
                        );

                    }
                );

            }


            answersContainer.appendChild(
                button
            );

        }
    );


    if (
        (isReviewMode ||
        currentQuestionAnswered) &&
        q.explanation
    ) {

        const explanation =
            document.createElement(
                "div"
            );


        explanation.className =
            "answerExplanation";


        explanation.innerHTML =
            `<strong>Explanation:</strong><br>${formatQuestionText(q.explanation)}`;


        answersContainer.appendChild(
            explanation
        );

    }

}


// ============================================================
// GET OPTION TEXT
// ============================================================

function getOptionText(option) {

    if (
        option === null ||
        option === undefined
    ) {

        return "";

    }


    if (
        typeof option === "object"
    ) {

        return (
            option.text ??
            option.answer ??
            option.label ??
            option.value ??
            ""
        );

    }


    return String(option);

}


// ============================================================
// OPTION LABEL
// ============================================================

function getOptionLabel(index) {

    return String.fromCharCode(
        65 + index
    );

}


// ============================================================
// SELECT ANSWER
// ============================================================

async function selectAnswer(
    index,
    option
) {

    if (
        currentQuestionAnswered
    ) {

        return;

    }


    const q =
        questions[current];


    const correct =
        isCorrectAnswer(
            option,
            index,
            q.correctAnswer
        );


    status[current] = {

        answered: true,

        selected:
            getOptionIdentifier(
                option,
                index
            ),

        correct: correct,

        skipped: false

    };


    currentQuestionAnswered =
        true;


    currentAnswerSelected =
        getOptionIdentifier(
            option,
            index
        );


    renderQuestion();


    // Save progress
    await saveQuestionProgress(
        q,
        correct
    );


    // Automatically go to next after a short delay
    setTimeout(
        function () {

            if (
                currentQuestionAnswered &&
                !isReviewMode
            ) {

                // Do not automatically finish immediately
                // if user wants to inspect the answer.
                // Keep the current question displayed.

            }

        },
        200
    );

}


// ============================================================
// OPTION IDENTIFIER
// ============================================================

function getOptionIdentifier(
    option,
    index
) {

    if (
        option &&
        typeof option === "object"
    ) {

        return (
            option.value ??
            option.text ??
            option.answer ??
            option.label ??
            getOptionLabel(index)
        );

    }


    return getOptionLabel(index);

}


// ============================================================
// CHECK CORRECT ANSWER
// ============================================================

function isCorrectAnswer(
    option,
    index,
    correctAnswer
) {

    if (
        correctAnswer === null ||
        correctAnswer === undefined
    ) {

        return false;

    }


    const correct =
        String(
            correctAnswer
        )
        .trim()
        .toLowerCase();


    const optionText =
        getOptionText(option)
        .trim()
        .toLowerCase();


    const letter =
        getOptionLabel(index)
        .toLowerCase();


    const number =
        String(index + 1);


    if (correct === letter) {

        return true;

    }


    if (correct === number) {

        return true;

    }


    if (correct === optionText) {

        return true;

    }


    if (
        typeof option === "object"
    ) {

        const value =
            String(
                option.value ??
                ""
            )
            .trim()
            .toLowerCase();


        if (
            value &&
            correct === value
        ) {

            return true;

        }

    }


    // Handle answers such as "A. ..."
    if (
        correct.startsWith(
            letter + "."
        ) ||
        correct.startsWith(
            letter + ")"
        )
    ) {

        return true;

    }


    return false;

}


// ============================================================
// IS OPTION SELECTED
// ============================================================

function isOptionSelected(
    option,
    index,
    selected
) {

    if (
        selected === null ||
        selected === undefined
    ) {

        return false;

    }


    const identifier =
        String(
            getOptionIdentifier(
                option,
                index
            )
        )
        .trim()
        .toLowerCase();


    return (
        identifier ===
        String(selected)
            .trim()
            .toLowerCase()
    );

}


// ============================================================
// NAVIGATOR
// ============================================================

function renderNavigator() {

    const navigator =
        document.getElementById(
            "navigator"
        );


    if (!navigator) {

        return;

    }


    navigator.innerHTML =
        "";


    questions.forEach(
        function (question, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                index + 1;


            button.className =
                "navigatorButton";


            if (
                index === current
            ) {

                button.classList.add(
                    "current"
                );

            }


            const itemStatus =
                status[index];


            if (
                itemStatus &&
                itemStatus.answered
            ) {

                if (
                    itemStatus.correct
                ) {

                    button.classList.add(
                        "correct"
                    );

                } else {

                    button.classList.add(
                        "wrong"
                    );

                }

            } else if (
                itemStatus &&
                itemStatus.skipped
            ) {

                button.classList.add(
                    "skipped"
                );

            }


            button.addEventListener(
                "click",
                function () {

                    current =
                        index;

                    isReviewMode =
                        false;

                    renderQuestion();

                }
            );


            navigator.appendChild(
                button
            );

        }
    );

}


// ============================================================
// PREVIOUS
// ============================================================

function previousQuestion() {

    if (
        current <= 0
    ) {

        return;

    }


    current--;

    isReviewMode =
        false;

    renderQuestion();

}


// ============================================================
// NEXT
// ============================================================

function nextQuestion() {

    if (
        current >=
        questions.length - 1
    ) {

        finishQuiz();

        return;

    }


    current++;

    isReviewMode =
        false;

    renderQuestion();

}


// ============================================================
// SKIP
// ============================================================

function skipQuestion() {

    if (
        !status[current].answered
    ) {

        status[current].skipped =
            true;

    }


    if (
        current >=
        questions.length - 1
    ) {

        finishQuiz();

        return;

    }


    current++;

    isReviewMode =
        false;

    renderQuestion();

}


// ============================================================
// UPDATE NAVIGATION BUTTONS
// ============================================================

function updateNavigationButtons() {

    const prev =
        document.getElementById(
            "prevBtn"
        );


    const next =
        document.getElementById(
            "nextBtn"
        );


    if (prev) {

        prev.disabled =
            current === 0;

    }


    if (next) {

        if (
            current ===
            questions.length - 1
        ) {

            next.textContent =
                "Finish Quiz";

        } else {

            next.textContent =
                "Next Question →";

        }

    }

}


// ============================================================
// MARK QUESTION BUTTON
// ============================================================

function updateMarkButton() {

    const button =
        document.getElementById(
            "markQuestionBtn"
        );


    if (!button || !questions[current]) {

        return;

    }


    const id =
        getQuestionId(
            questions[current]
        );


    if (
        markedQuestionIds.has(id)
    ) {

        button.textContent =
            "⭐ Unmark Question";

        button.classList.add(
            "marked"
        );

    } else {

        button.textContent =
            "⭐ Mark Question";

        button.classList.remove(
            "marked"
        );

    }

}


// ============================================================
// TOGGLE MARK QUESTION
// ============================================================

async function toggleMarkQuestion() {

    if (
        !currentUser ||
        !questions[current]
    ) {

        return;

    }


    const q =
        questions[current];


    const questionId =
        getQuestionId(q);


    if (
        markedQuestionIds.has(
            questionId
        )
    ) {

        await unmarkQuestion(q);

    } else {

        await markQuestion(q);

    }


    updateMarkButton();

}


// ============================================================
// MARK QUESTION
// ============================================================

async function markQuestion(q) {

    if (!currentUser) {

        return;

    }


    const questionId =
        getQuestionId(q);


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "marked_questions"
                )
                .insert({

                    user_id:
                        currentUser.id,

                    question_id:
                        questionId,

                    subject:
                        q.subject

                });


        if (error) {

            // Duplicate is harmless
            if (
                !String(error.message)
                    .toLowerCase()
                    .includes("duplicate")
            ) {

                console.error(
                    "Mark question error:",
                    error
                );

                alert(
                    "Unable to mark question."
                );

                return;

            }

        }


        markedQuestionIds.add(
            questionId
        );


    } catch (error) {

        console.error(
            "Mark question exception:",
            error
        );

    }

}


// ============================================================
// UNMARK QUESTION
// ============================================================

async function unmarkQuestion(q) {

    if (!currentUser) {

        return;

    }


    const questionId =
        getQuestionId(q);


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "marked_questions"
                )
                .delete()
                .eq(
                    "user_id",
                    currentUser.id
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

            alert(
                "Unable to unmark question."
            );

            return;

        }


        markedQuestionIds.delete(
            questionId
        );


    } catch (error) {

        console.error(
            "Unmark exception:",
            error
        );

    }

}


// ============================================================
// LOAD MARKED QUESTIONS
// ============================================================

async function loadMarkedQuestions() {

    if (!currentUser) {

        await loadCurrentUser();

    }


    if (!currentUser) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "marked_questions"
                )
                .select(
                    "question_id, subject"
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {

            console.error(
                "Load marked questions error:",
                error
            );

            return;

        }


        markedQuestionIds =
            new Set(
                (data || [])
                    .map(
                        item =>
                            String(
                                item.question_id
                            )
                    )
            );


    } catch (error) {

        console.error(
            "Marked questions exception:",
            error
        );

    }

}


// ============================================================
// OPEN MARKED QUESTIONS
// ============================================================

async function openMarkedQuestions() {

    showOnly(
        "markedScreen"
    );

    setActiveSidebar(
        "sidebarMarkedBtn"
    );


    await loadMarkedQuestions();

    await displayMarkedQuestions();

}


// ============================================================
// DISPLAY MARKED QUESTIONS
// ============================================================

async function displayMarkedQuestions() {

    const container =
        document.getElementById(
            "markedQuestionsList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "Loading marked questions...";


    if (
        !markedQuestionIds.size
    ) {

        container.innerHTML =
            "<p>You have no marked questions yet.</p>";

        return;

    }


    const all =
        await loadAllQuestions();


    const marked =
        all.filter(
            function (q) {

                return markedQuestionIds.has(
                    getQuestionId(q)
                );

            }
        );


    if (!marked.length) {

        container.innerHTML =
            "<p>No marked questions could be found in the current question bank.</p>";

        return;

    }


    container.innerHTML =
        "";


    marked.forEach(
        function (q, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "markedQuestionItem";


            card.innerHTML = `

                <div class="markedQuestionHeader">

                    <strong>
                        ${index + 1}. ${escapeHTML(getSubjectName(q.subject))}
                    </strong>

                    <span>
                        ⭐
                    </span>

                </div>

                <div class="markedQuestionText">

                    ${formatQuestionText(q.question)}

                </div>

                <button
                    type="button"
                    class="modeButton secondaryButton"
                >
                    Open Question
                </button>

            `;


            card
                .querySelector("button")
                .addEventListener(
                    "click",
                    function () {

                        openSpecificQuestion(
                            q
                        );

                    }
                );


            container.appendChild(
                card
            );

        }
    );

}


// ============================================================
// OPEN SPECIFIC QUESTION
// ============================================================

function openSpecificQuestion(q) {

    questions = [q];

    current = 0;

    status =
        createQuestionStatus(
            questions
        );


    currentSubject =
        q.subject;


    currentQuizType =
        "marked";


    quizMode = false;

    isReviewMode = false;


    showQuizScreen();

}


// ============================================================
// START MARKED QUIZ
// ============================================================

async function startMarkedQuiz(
    subject
) {

    await loadMarkedQuestions();


    const all =
        await loadAllQuestions();


    let marked =
        all.filter(
            function (q) {

                if (
                    !markedQuestionIds.has(
                        getQuestionId(q)
                    )
                ) {

                    return false;

                }


                if (
                    subject === "all"
                ) {

                    return true;

                }


                return q.subject === subject;

            }
        );


    if (!marked.length) {

        alert(
            "There are no marked questions for this selection."
        );

        return;

    }


    questions =
        shuffleArray(
            marked
        );


    current = 0;

    status =
        createQuestionStatus(
            questions
        );


    currentSubject =
        subject;


    currentQuizType =
        "marked";


    quizMode = true;

    isReviewMode = false;


    showQuizScreen();

}


// ============================================================
// SEARCH
// ============================================================

function openSearch() {

    showOnly(
        "searchScreen"
    );

    setActiveSidebar(
        "sidebarSearchBtn"
    );


    const input =
        document.getElementById(
            "searchInput"
        );


    if (input) {

        setTimeout(
            function () {

                input.focus();

            },
            100
        );

    }

}


// ============================================================
// SEARCH QUESTIONS
// ============================================================

async function searchQuestions() {

    const input =
        document.getElementById(
            "searchInput"
        );


    const subjectSelect =
        document.getElementById(
            "searchSubject"
        );


    const results =
        document.getElementById(
            "searchResults"
        );


    if (!results) {

        return;

    }


    const term =
        (
            input?.value || ""
        )
        .trim()
        .toLowerCase();


    const subject =
        subjectSelect?.value ||
        "all";


    if (!term) {

        results.innerHTML =
            "<p>Enter a search term.</p>";

        return;

    }


    results.innerHTML =
        "Searching...";


    const all =
        await loadAllQuestions();


    const matches =
        all.filter(
            function (q) {

                if (
                    subject !== "all" &&
                    q.subject !== subject
                ) {

                    return false;

                }


                const searchable =
                    [

                        q.question,

                        ...(q.options || []),
                        q.explanation,
                        getSubjectName(q.subject)

                    ]
                    .map(
                        item =>
                            getOptionText(item)
                    )
                    .join(" ")
                    .toLowerCase();


                return searchable.includes(
                    term
                );

            }
        );


    if (!matches.length) {

        results.innerHTML =
            "<p>No questions found.</p>";

        return;

    }


    results.innerHTML =
        `<p><strong>${matches.length}</strong> question(s) found.</p>`;


    matches.forEach(
        function (q, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "searchResultCard";


            card.innerHTML = `

                <div class="searchResultSubject">

                    ${escapeHTML(getSubjectName(q.subject))}

                </div>

                <div class="searchResultQuestion">

                    ${formatQuestionText(q.question)}

                </div>

                <button
                    type="button"
                    class="modeButton secondaryButton"
                >
                    Open Question
                </button>

            `;


            card
                .querySelector("button")
                .addEventListener(
                    "click",
                    function () {

                        openSpecificQuestion(
                            q
                        );

                    }
                );


            results.appendChild(
                card
            );

        }
    );

}


// ============================================================
// PROGRESS
// ============================================================

async function openProgress() {

    showOnly(
        "progressScreen"
    );

    setActiveSidebar(
        "sidebarProgressBtn"
    );


    await loadProgressDashboard();

}


// ============================================================
// LOAD PROGRESS DASHBOARD
// ============================================================

async function loadProgressDashboard() {

    const loading =
        document.getElementById(
            "progressLoading"
        );


    if (loading) {

        loading.style.display =
            "block";

    }


    try {

        if (!currentUser) {

            await loadCurrentUser();

        }


        if (!currentUser) {

            return;

        }


        const progress =
            await getUserProgress();


        renderOverallProgress(
            progress
        );

        renderSubjectProgress(
            progress
        );

        renderPerformance(
            progress
        );

        renderWrongQuestions(
            progress
        );

        renderMasteredQuestions(
            progress
        );


    } catch (error) {

        console.error(
            "Progress dashboard error:",
            error
        );


        const overall =
            document.getElementById(
                "overallProgressContent"
            );


        if (overall) {

            overall.innerHTML =
                "Unable to load progress.";

        }

    } finally {

        if (loading) {

            loading.style.display =
                "none";

        }

    }

}


// ============================================================
// GET USER PROGRESS
// ============================================================

async function getUserProgress() {

    if (!currentUser) {

        return [];

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("progress")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Progress query error:",
            error
        );

        return [];

    }


    return data || [];

}


// ============================================================
// SAVE QUESTION PROGRESS
// ============================================================

async function saveQuestionProgress(
    q,
    correct
) {

    if (
        !currentUser ||
        !q
    ) {

        return;

    }


    const questionId =
        getQuestionId(q);


    try {

        // Try updating existing progress first.
        const {
            data: existing,
            error: lookupError
        } =
            await supabaseClient
                .from("progress")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "question_id",
                    questionId
                )
                .maybeSingle();


        if (
            lookupError &&
            !isMissingColumnError(
                lookupError,
                "question_id"
            )
        ) {

            console.warn(
                "Progress lookup:",
                lookupError.message
            );

        }


        const now =
            new Date()
                .toISOString();


        if (existing) {

            const attempts =
                Number(
                    existing.attempts ||
                    0
                ) + 1;


            const updateData = {

                correct:
                    correct,

                attempts:
                    attempts,

                last_answered:
                    now,

                updated_at:
                    now

            };


            // Remove fields that may not exist
            delete updateData.updated_at;


            const {
                error
            } =
                await supabaseClient
                    .from("progress")
                    .update(
                        updateData
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    )
                    .eq(
                        "question_id",
                        questionId
                    );


            if (error) {

                console.error(
                    "Progress update error:",
                    error
                );

            }


            return;

        }


        // New progress record
        const insertData = {

            user_id:
                currentUser.id,

            question_id:
                questionId,

            subject:
                q.subject,

            correct:
                correct,

            attempts:
                1,

            last_answered:
                now

        };


        const {
            error
        } =
            await supabaseClient
                .from("progress")
                .insert(
                    insertData
                );


        if (error) {

            console.error(
                "Progress insert error:",
                error
            );

        }

    } catch (error) {

        console.error(
            "Save progress exception:",
            error
        );

    }

}


// ============================================================
// LOAD SAVED PRACTICE PROGRESS
// ============================================================

async function loadSavedProgress(
    subject
) {

    if (!currentUser) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("progress")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "subject",
                    subject
                );


        if (error) {

            console.error(
                "Load saved progress error:",
                error
            );

            return;

        }


        const saved =
            data || [];


        questions.forEach(
            function (q, index) {

                const record =
                    saved.find(
                        function (item) {

                            return String(
                                item.question_id
                            ) ===
                            String(
                                getQuestionId(q)
                            );

                        }
                    );


                if (record) {

                    status[index] = {

                        answered:
                            true,

                        selected:
                            record.selected_answer ??
                            null,

                        correct:
                            Boolean(
                                record.correct
                            ),

                        skipped:
                            false

                    };

                }

            }
        );

    } catch (error) {

        console.error(
            "Saved progress exception:",
            error
        );

    }

}


// ============================================================
// RENDER OVERALL PROGRESS
// ============================================================

function renderOverallProgress(
    progress
) {

    const container =
        document.getElementById(
            "overallProgressContent"
        );


    if (!container) {

        return;

    }


    const total =
        progress.length;


    const correct =
        progress.filter(
            p => Boolean(p.correct)
        ).length;


    const incorrect =
        progress.filter(
            p => p.correct === false
        ).length;


    const percentage =
        total ?
            Math.round(
                (correct / total) * 100
            ) :
            0;


    container.innerHTML = `

        <div class="progressStats">

            <div>
                <strong>${total}</strong>
                <span>Questions Attempted</span>
            </div>

            <div>
                <strong>${correct}</strong>
                <span>Correct</span>
            </div>

            <div>
                <strong>${incorrect}</strong>
                <span>Incorrect</span>
            </div>

            <div>
                <strong>${percentage}%</strong>
                <span>Accuracy</span>
            </div>

        </div>

    `;

}


// ============================================================
// RENDER SUBJECT PROGRESS
// ============================================================

function renderSubjectProgress(
    progress
) {

    const container =
        document.getElementById(
            "subjectProgressContent"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    Object.keys(SUBJECTS)
        .forEach(
            function (subject) {

                const records =
                    progress.filter(
                        p =>
                            p.subject ===
                            subject
                    );


                const total =
                    records.length;


                const correct =
                    records.filter(
                        p =>
                            Boolean(
                                p.correct
                            )
                    ).length;


                const percentage =
                    total ?
                        Math.round(
                            (
                                correct /
                                total
                            ) * 100
                        ) :
                        0;


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "subjectProgressRow";


                row.innerHTML = `

                    <div>

                        <strong>
                            ${escapeHTML(
                                SUBJECTS[subject].name
                            )}
                        </strong>

                        <span>
                            ${total} attempted
                        </span>

                    </div>

                    <strong>
                        ${percentage}%
                    </strong>

                `;


                container.appendChild(
                    row
                );

            }
        );

}


// ============================================================
// RENDER PERFORMANCE
// ============================================================

function renderPerformance(
    progress
) {

    const container =
        document.getElementById(
            "performanceContent"
        );


    if (!container) {

        return;

    }


    const total =
        progress.length;


    const correct =
        progress.filter(
            p =>
                Boolean(p.correct)
        ).length;


    const accuracy =
        total ?
            Math.round(
                (correct / total) * 100
            ) :
            0;


    let level =
        "Getting Started";


    if (accuracy >= 90) {

        level =
            "Excellent";

    } else if (accuracy >= 80) {

        level =
            "Very Good";

    } else if (accuracy >= 70) {

        level =
            "Good";

    } else if (accuracy >= 60) {

        level =
            "Developing";

    }


    container.innerHTML = `

        <div class="performanceSummary">

            <h3>
                ${level}
            </h3>

            <p>
                Your current accuracy is
                <strong>${accuracy}%</strong>.
            </p>

        </div>

    `;

}


// ============================================================
// WRONG QUESTIONS
// ============================================================

function renderWrongQuestions(
    progress
) {

    const container =
        document.getElementById(
            "wrongQuestionsContent"
        );


    if (!container) {

        return;

    }


    const wrong =
        progress.filter(
            p =>
                p.correct === false
        );


    container.innerHTML = `

        <strong>
            ${wrong.length}
        </strong>

        questions currently need review.

    `;

}


// ============================================================
// MASTERED QUESTIONS
// ============================================================

function renderMasteredQuestions(
    progress
) {

    const container =
        document.getElementById(
            "masteredQuestionsContent"
        );


    if (!container) {

        return;

    }


    const mastered =
        progress.filter(
            function (p) {

                return (
                    Boolean(p.correct) &&
                    Number(p.attempts || 0) >= 2
                );

            }
        );


    container.innerHTML = `

        <strong>
            ${mastered.length}
        </strong>

        questions are currently mastered.

    `;

}


// ============================================================
// RESET PROGRESS VISIBILITY
// ============================================================

async function updateResetProgressVisibility() {

    const section =
        document.getElementById(
            "resetProgressSection"
        );


    if (!section) {

        return;

    }


    section.style.display =
        currentUser ?
            "block" :
            "none";

}


// ============================================================
// RESET SUBJECT PROGRESS
// ============================================================

async function resetSubjectProgress() {

    if (!currentUser) {

        alert(
            "You must be logged in."
        );

        return;

    }


    const subject =
        document
            .getElementById(
                "practiceSubjectSelect"
            )
            .value;


    const confirmed =
        confirm(
            `Reset all saved progress for ${getSubjectName(subject)}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("progress")
                .delete()
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "subject",
                    subject
                );


        if (error) {

            console.error(
                "Reset progress error:",
                error
            );

            alert(
                "Unable to reset progress."
            );

            return;

        }


        alert(
            `${getSubjectName(subject)} progress has been reset.`
        );


    } catch (error) {

        console.error(
            "Reset progress exception:",
            error
        );

        alert(
            "Unable to reset progress."
        );

    }

}


// ============================================================
// FINISH QUIZ
// ============================================================

async function finishQuiz() {

    const total =
        questions.length;


    const answered =
        status.filter(
            s =>
                s.answered
        ).length;


    const correct =
        status.filter(
            s =>
                s.correct
        ).length;


    const wrong =
        status.filter(
            s =>
                s.answered &&
                !s.correct
        ).length;


    wrongQuestionsForRedo =
        questions.filter(
            function (q, index) {

                return (
                    status[index] &&
                    status[index].answered &&
                    !status[index].correct
                );

            }
        );


    const percentage =
        total ?
            Math.round(
                (correct / total) * 100
            ) :
            0;


    const resultScore =
        document.getElementById(
            "resultScore"
        );


    const resultDetails =
        document.getElementById(
            "resultDetails"
        );


    if (resultScore) {

        resultScore.innerHTML = `

            <div class="scoreNumber">
                ${percentage}%
            </div>

            <div class="scoreText">
                ${correct} / ${total} Correct
            </div>

        `;

    }


    if (resultDetails) {

        resultDetails.innerHTML = `

            <p>
                <strong>Answered:</strong>
                ${answered}
            </p>

            <p>
                <strong>Correct:</strong>
                ${correct}
            </p>

            <p>
                <strong>Wrong:</strong>
                ${wrong}
            </p>

            <p>
                <strong>Skipped:</strong>
                ${total - answered}
            </p>

        `;

    }


    const redo =
        document.getElementById(
            "redoWrongBtn"
        );


    if (redo) {

        redo.style.display =
            wrongQuestionsForRedo.length ?
                "inline-flex" :
                "none";

    }


    showOnly(
        "resultsScreen"
    );

}


// ============================================================
// REDO WRONG QUESTIONS
// ============================================================

function redoWrongQuestions() {

    if (
        !wrongQuestionsForRedo.length
    ) {

        alert(
            "There are no wrong questions to redo."
        );

        return;

    }


    questions =
        shuffleArray(
            wrongQuestionsForRedo.slice()
        );


    current = 0;

    status =
        createQuestionStatus(
            questions
        );


    quizMode = true;

    currentQuizType =
        "redo";


    isReviewMode =
        false;


    showQuizScreen();

}


// ============================================================
// REVIEW ANSWERS
// ============================================================

function reviewAnswers() {

    if (!questions.length) {

        return;

    }


    current = 0;

    isReviewMode =
        true;


    showQuizScreen();

}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

async function openAdmin() {

    const isAdmin =
        await updateAdminSidebar();


    if (!isAdmin) {

        alert(
            "Administrator access required."
        );

        return;

    }


    showOnly(
        "adminScreen"
    );

    setActiveSidebar(
        "sidebarAdminBtn"
    );


    await loadAdminData();

}


// ============================================================
// LOAD ADMIN DATA
// ============================================================

async function loadAdminData() {

    await loadAccessRequests();

    await loadApprovedUsers();

}


// ============================================================
// LOAD ACCESS REQUESTS
// ============================================================

async function loadAccessRequests() {

    const container =
        document.getElementById(
            "adminRequests"
        );


    if (!container) {

        return;

    }


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
                `<p>Unable to load requests: ${escapeHTML(error.message)}</p>`;

            return;

        }


        if (!data || !data.length) {

            container.innerHTML =
                "<p>No access requests.</p>";

            return;

        }


        container.innerHTML =
            "";


        data.forEach(
            function (request) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "adminRequestItem";


                const statusText =
                    request.status ||
                    "pending";


                const isPending =
                    String(
                        statusText
                    )
                    .toLowerCase() ===
                    "pending";


                card.innerHTML = `

                    <div>

                        <h3>
                            ${escapeHTML(
                                request.name ||
                                "No name"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                request.email ||
                                ""
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                request.reason ||
                                "No reason provided"
                            )}
                        </p>

                        <strong>
                            Status:
                            ${escapeHTML(
                                statusText
                            )}
                        </strong>

                    </div>

                    ${
                        isPending
                        ?
                        `
                        <div>

                            <button
                                type="button"
                                class="modeButton primaryButton approveRequestButton"
                            >
                                ✓ Approve
                            </button>

                            <button
                                type="button"
                                class="resetButton rejectRequestButton"
                            >
                                ✕ Reject
                            </button>

                        </div>
                        `
                        :
                        ""
                    }

                `;


                const approve =
                    card.querySelector(
                        ".approveRequestButton"
                    );


                if (approve) {

                    approve.addEventListener(
                        "click",
                        function () {

                            approveUserRequest(
                                request
                            );

                        }
                    );

                }


                const reject =
                    card.querySelector(
                        ".rejectRequestButton"
                    );


                if (reject) {

                    reject.addEventListener(
                        "click",
                        function () {

                            rejectUserRequest(
                                request
                            );

                        }
                    );

                }


                container.appendChild(
                    card
                );

            }
        );

    } catch (error) {

        console.error(
            "Admin requests exception:",
            error
        );

        container.innerHTML =
            "<p>Unable to load requests.</p>";

    }

}


// ============================================================
// APPROVE USER REQUEST
// ============================================================

async function approveUserRequest(
    request
) {

    if (!request.email) {

        alert(
            "This request has no email address."
        );

        return;

    }


    const confirmed =
        confirm(
            `Approve ${request.email}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const email =
            String(
                request.email
            )
            .trim()
            .toLowerCase();


        // ----------------------------------------------------
        // IMPORTANT:
        // Only insert columns that are known to exist.
        // This avoids the previous "name column" problem.
        // ----------------------------------------------------

        const {
            data: existing,
            error: lookupError
        } =
            await supabaseClient
                .from("approved_users")
                .select("email")
                .eq(
                    "email",
                    email
                )
                .maybeSingle();


        if (lookupError) {

            console.error(
                "Approved user lookup:",
                lookupError
            );

        }


        if (!existing) {

            const {
                error: insertError
            } =
                await supabaseClient
                    .from("approved_users")
                    .insert({

                        email: email

                    });


            if (insertError) {

                // Handle duplicate approval gracefully
                if (
                    !String(
                        insertError.message
                    )
                    .toLowerCase()
                    .includes("duplicate")
                ) {

                    console.error(
                        "Approve insert error:",
                        insertError
                    );

                    alert(
                        "Unable to approve user: " +
                        insertError.message
                    );

                    return;

                }

            }

        }


        // ----------------------------------------------------
        // Update request status
        // ----------------------------------------------------

        const {
            error: requestError
        } =
            await supabaseClient
                .from("access_requests")
                .update({

                    status:
                        "approved"

                })
                .eq(
                    "email",
                    email
                );


        if (requestError) {

            console.error(
                "Request status update:",
                requestError
            );

            // Approval already happened.
            alert(
                "User approved, but the request status could not be updated."
            );

        } else {

            alert(
                "User approved successfully."
            );

        }


        await loadAdminData();

    } catch (error) {

        console.error(
            "Approve request exception:",
            error
        );

        alert(
            "Unable to approve user: " +
            error.message
        );

    }

}


// ============================================================
// REJECT USER REQUEST
// ============================================================

async function rejectUserRequest(
    request
) {

    if (!request.email) {

        return;

    }


    const confirmed =
        confirm(
            `Reject the request from ${request.email}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("access_requests")
                .update({

                    status:
                        "rejected"

                })
                .eq(
                    "email",
                    request.email
                );


        if (error) {

            console.error(
                "Reject error:",
                error
            );

            alert(
                "Unable to reject request."
            );

            return;

        }


        await loadAdminData();

    } catch (error) {

        console.error(
            "Reject exception:",
            error
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


    if (!container) {

        return;

    }


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
                    "email",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Approved users error:",
                error
            );

            container.innerHTML =
                `<p>Unable to load approved users: ${escapeHTML(error.message)}</p>`;

            return;

        }


        if (!data || !data.length) {

            container.innerHTML =
                "<p>No approved users.</p>";

            return;

        }


        container.innerHTML =
            "";


        data.forEach(
            function (user) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "approvedUserItem";


                const email =
                    user.email ||
                    "Unknown";


                // Deliberately use only email.
                // Your previous database error showed
                // that "name" does not exist in approved_users.
                row.innerHTML = `

                    <div>

                        <strong>
                            ${escapeHTML(email)}
                        </strong>

                        <small>
                            Approved User
                        </small>

                    </div>

                    <button
                        type="button"
                        class="resetButton removeApprovedUserButton"
                    >
                        Remove
                    </button>

                `;


                row
                    .querySelector(
                        ".removeApprovedUserButton"
                    )
                    .addEventListener(
                        "click",
                        function () {

                            removeApprovedUser(
                                email
                            );

                        }
                    );


                container.appendChild(
                    row
                );

            }
        );

    } catch (error) {

        console.error(
            "Approved users exception:",
            error
        );

        container.innerHTML =
            "<p>Unable to load approved users.</p>";

    }

}


// ============================================================
// REMOVE APPROVED USER
// ============================================================

async function removeApprovedUser(
    email
) {

    const confirmed =
        confirm(
            `Remove ${email} from approved users?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("approved_users")
                .delete()
                .eq(
                    "email",
                    email
                );


        if (error) {

            console.error(
                "Remove approved user:",
                error
            );

            alert(
                "Unable to remove approved user."
            );

            return;

        }


        await loadApprovedUsers();

    } catch (error) {

        console.error(
            "Remove approved user exception:",
            error
        );

    }

}


// ============================================================
// GET QUESTION ID
// ============================================================

function getQuestionId(q) {

    if (
        q.id !== undefined &&
        q.id !== null
    ) {

        return String(q.id);

    }


    if (
        q.questionId !== undefined &&
        q.questionId !== null
    ) {

        return String(
            q.questionId
        );

    }


    return (
        String(
            q.subject || ""
        ) +
        "-" +
        String(
            q.question || ""
        )
        .substring(
            0,
            100
        )
    );

}


// ============================================================
// SUBJECT NAME
// ============================================================

function getSubjectName(
    subject
) {

    if (
        SUBJECTS[subject]
    ) {

        return SUBJECTS[subject].name;

    }


    if (
        subject === "combined"
    ) {

        return "Combined ATPL";

    }


    return subject || "ATPL";

}


// ============================================================
// SHUFFLE
// ============================================================

function shuffleArray(
    array
) {

    const result =
        array.slice();


    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;

}


// ============================================================
// MESSAGE
// ============================================================

function setMessage(
    element,
    text,
    type
) {

    if (!element) {

        return;

    }


    element.textContent =
        text;


    element.className =
        "message";


    if (type) {

        element.classList.add(
            type
        );

    }

}


// ============================================================
// ERROR HELPERS
// ============================================================

function isMissingTableError(
    error
) {

    if (!error) {

        return false;

    }


    const text =
        String(
            error.message || ""
        )
        .toLowerCase();


    return (
        text.includes(
            "could not find the table"
        ) ||
        text.includes(
            "relation"
        ) &&
        text.includes(
            "does not exist"
        )
    );

}


function isMissingColumnError(
    error,
    column
) {

    if (!error) {

        return false;

    }


    const text =
        String(
            error.message || ""
        )
        .toLowerCase();


    return (
        text.includes(
            column.toLowerCase()
        ) &&
        (
            text.includes(
                "column"
            ) ||
            text.includes(
                "schema cache"
            )
        )
    );

}


// ============================================================
// AUTH STATE
// ============================================================

supabaseClient
    .auth
    .onAuthStateChange(
        async function (
            event,
            session
        ) {

            console.log(
                "Auth event:",
                event
            );


            if (
                session &&
                session.user
            ) {

                currentUser =
                    session.user;


                // Avoid blocking the auth callback
                setTimeout(
                    async function () {

                        await showLoggedInApplication();

                    },
                    0
                );

            } else {

                currentUser =
                    null;

            }

        }
    );


// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener(
    "keydown",
    function (event) {

        const quizScreen =
            document.getElementById(
                "quizScreen"
            );


        if (
            !quizScreen ||
            quizScreen.style.display ===
            "none"
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousQuestion();

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextQuestion();

        }

    }
);


// ============================================================
// LOGOUT FALLBACK
// ============================================================
// The HTML also contains logoutUser().
// This fallback exists so the button continues to work
// even if the inline layout script is changed later.
// ============================================================

if (
    typeof window.logoutUser !==
    "function"
) {

    window.logoutUser =
        async function () {

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {

                return;

            }


            try {

                await supabaseClient
                    .auth
                    .signOut();


                currentUser =
                    null;


                const main =
                    document.getElementById(
                        "mainApplication"
                    );


                const login =
                    document.getElementById(
                        "loginArea"
                    );


                if (main) {

                    main.style.display =
                        "none";

                }


                if (login) {

                    login.style.display =
                        "block";

                }


                showOnly(
                    "loginScreen"
                );


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Unable to log out."
                );

            }

        };

}


// ============================================================
// MAKE IMPORTANT FUNCTIONS GLOBALLY AVAILABLE
// ============================================================

window.showOnly =
    showOnly;

window.openDashboard =
    openDashboard;

window.startPractice =
    startPractice;

window.startSubjectQuiz =
    startSubjectQuiz;

window.startCombinedQuiz =
    startCombinedQuiz;

window.openProgress =
    openProgress;

window.openAdmin =
    openAdmin;

window.toggleMarkQuestion =
    toggleMarkQuestion;

window.searchQuestions =
    searchQuestions;

window.previousQuestion =
    previousQuestion;

window.nextQuestion =
    nextQuestion;

window.skipQuestion =
    skipQuestion;

window.redoWrongQuestions =
    redoWrongQuestions;

window.reviewAnswers =
    reviewAnswers;

window.escapeHTML =
    escapeHTML;


// ============================================================
// END OF script.js
// ============================================================

console.log(
    "ATPL STUDY: Complete script initialized successfully."
);
