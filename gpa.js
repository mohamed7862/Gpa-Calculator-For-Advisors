// === 1. الإعدادات والبيانات الأساسية ===
let savedSemesters = JSON.parse(localStorage.getItem('savedSemesters')) || []; 
let courses = []; 
let currentEditingName = null; 
let editingIndex = null; 
let maxCoursesAllowed = 6; 
let currentLang = 'en';
let currentAdvisor = null; // سيحتوي على بيانات المرشد المسجل حالياً

const gradePoints = {
    'A+': 4.0, 'A': 3.7, 'A-': 3.4, 'B+': 3.2, 'B': 3.0, 'B-': 2.8,
    'C+': 2.6, 'C': 2.4, 'C-': 2.2, 'D+': 2.0, 'D': 1.5, 'D-': 1.0, 'F': 0.0
};

const predefinedCourses = [
    { en: "English Language", ar: "اللغة الإنجليزية", hint: "H 101", credits: 2 },
    { en: "Creative Thinking and Communication Skills", ar: "التفكير الإبداعي ومهارات التواصل", hint: "H 102", credits: 2 },
    { en: "Calculus", ar: "تفاضل وتكامل", hint: "BS 101", credits: 3 },
    { en: "Intro to computer Science", ar: "مقدمة في علوم الحاسب", hint: "CS 101", credits: 3 },
    { en: "Intro to Information Systems", ar: "مقدمة في نظم المعلومات", hint: "CS 103", credits: 3 },
    { en: "Electronics", ar: "إلكترونيات", hint: "BS 131", credits: 3 },
    { en: "Technical Report Writing", ar: "كتابة التقارير الفنية", hint: "H 103", credits: 2 },
    { en: "Physics", ar: "فيزياء", hint: "BS 121", credits: 3 },
    { en: "Computer Programming", ar: "برمجة الحاسب", hint: "CS 102", credits: 3 },
    { en: "Linear Algebra", ar: "الجبر الخطي", hint: "BS 102", credits: 3 },
    { en: "Discrete Mathematics", ar: "رياضيات متقطعة", hint: "BS 103", credits: 3 },
    { en: "Logic Design", ar: "التصميم المنطقي", hint: "CS 121", credits: 3 },
    { en: "Computer Security", ar: "أمن الحاسبات", hint: "CS 413", credits: 3 },
    { en: "Digital Image processing", ar: "معالجة الصور الرقمية", hint: "CS 443", credits: 3 },
    { en: "Senior Project 1", ar: "مشروع تخرج 1", hint: "CS 498", credits: 3 },
    { en: "Machine Learning", ar: "تعلم الآلة", hint: "CS 462", credits: 3 },
    { en: "Internet of Things (IoT)", ar: "إنترنت الأشياء", hint: "CS 455", credits: 3 },
    { en: "Senior Project 2", ar: "مشروع تخرج 2", hint: "CS 499", credits: 3 },
    { en: "Work Ethics", ar: "أخلاقيات العمل", hint: "H 201", credits: 2 },
    { en: "Object-Oriented Programming", ar: "البرمجة كائنية التوجه", hint: "CS 203", credits: 3 },
    { en: "Data Structure", ar: "هياكل البيانات", hint: "CS 201", credits: 3 },
    { en: "Computer Networks", ar: "شبكات الحاسب", hint: "CS 250", credits: 3 },
    { en: "Web Programming", ar: "برمجة الويب", hint: "CS 206", credits: 3 },
    { en: "Mobile App Development", ar: "تطوير تطبيقات الموبايل", hint: "CS 309", credits: 3 },
    { en: "Software Engineering", ar: "هندسة البرمجيات", hint: "CS 315", credits: 3 },
    { en: "Intro to Databases", ar: "مقدمة في قواعد البيانات", hint: "CS 323", credits: 3 },
    { en: "Artificial Intelligence", ar: "الذكاء الاصطناعي", hint: "CS 360", credits: 3 }
];

const i18n = {
    en: {
        title: "GPA Calculator",
        subjectPlaceholder: "Subject Name (Type to search)",
        addBtn: "Add course ➕",
        saveBtn: "Save & Update Semester",
        savedTitle: "Saved Semesters",
        finalGpa: "Final GPA",
        langBtn: "العربية",
        header: ["Subject", "Grade", "Hours", "Delete"],
        termGpa: "Term:",
        cgpa: "CGPA:",
        advisorHeading: "👨‍🏫 Academic Advisor - Student Info",
        studentName: "Student Name",
        studentId: "Student ID",
        saveStudentBtn: "☁️ Save Student to Cloud",
        modalTitle: "My Students Records"
    },
    ar: {
        title: "حاسبة المعدل التراكمي",
        subjectPlaceholder: "اسم المادة (ابحث أو اكتب)",
        addBtn: "إضافة مادة ➕",
        saveBtn: "حفظ وتحديث الترم",
        savedTitle: "الترمات المحفوظة",
        finalGpa: "المعدل النهائي",
        langBtn: "English",
        header: ["المادة", "التقدير", "الساعات", "حذف"],
        termGpa: "فصلي:",
        cgpa: "تراكمي:",
        advisorHeading: "👨‍🏫 المرشد الأكاديمي - بيانات الطالب",
        studentName: "اسم الطالب",
        studentId: "كود الطالب",
        saveStudentBtn: "☁️ حفظ الطالب سحابياً",
        modalTitle: "سجل طلابي المحفوظين"
    }
};

const addCourseBtn = document.getElementById('add-course-btn');
const subjectInput = document.getElementById('subject');
const gradeSelect = document.getElementById('grade');
const coursesList = document.getElementById('courses-list');
const gpaDisplay = document.getElementById('gpa-display');
const savedSemestersBox = document.getElementById('saved-semesters-box');
const semestersList = document.getElementById('semesters-list');

// === 2. نظام تسجيل الدخول (Firebase Auth Functions) ===

auth.onAuthStateChanged((user) => {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');

    if (user) {
        currentAdvisor = user;
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        document.getElementById('advisor-email-display').innerText = `📧 Advisor: ${user.email}`;
        updateStudentsCount();
    } else {
        currentAdvisor = null;
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
    }
});

function loginAdvisor() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const errorMsg = document.getElementById('auth-error');

    if (!email || !password) {
        showAuthError("Please enter both email and password.");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => { errorMsg.style.display = 'none'; })
        .catch(err => showAuthError(err.message));
}

function registerAdvisor() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!email || !password) {
        showAuthError("Please enter both email and password.");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => { alert("Account created successfully! 🎉"); })
        .catch(err => showAuthError(err.message));
}

function logoutAdvisor() {
    auth.signOut();
}

function showAuthError(msg) {
    const errorMsg = document.getElementById('auth-error');
    errorMsg.innerText = msg;
    errorMsg.style.display = 'block';
}

// === 3. وظائف واجهة المستخدم والأحسابات ===

function populateDatalist() {
    const datalist = document.getElementById('subjects-list');
    if (!datalist) return;
    datalist.innerHTML = '';
    predefinedCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = currentLang === 'en' ? course.en : course.ar;
        option.textContent = `- ${course.hint}`;
        datalist.appendChild(option);
    });
}

function saveToLocal() {
    localStorage.setItem('savedSemesters', JSON.stringify(savedSemesters));
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    const lang = i18n[currentLang];
    
    document.getElementById('main-title').innerText = lang.title;
    subjectInput.placeholder = lang.subjectPlaceholder;
    addCourseBtn.innerText = lang.addBtn;
    document.getElementById('save-sem-btn').innerText = lang.saveBtn;
    document.querySelector('#saved-semesters-box h3').innerText = lang.savedTitle;
    document.getElementById('final-gpa-text').innerText = lang.finalGpa;
    document.getElementById('lang-btn').innerText = lang.langBtn;
    
    document.getElementById('advisor-heading').innerText = lang.advisorHeading;
    document.getElementById('student-name').placeholder = lang.studentName;
    document.getElementById('student-id').placeholder = lang.studentId;
    document.querySelector('button[onclick="saveStudentRecordCloud()"]').innerText = lang.saveStudentBtn;
    document.getElementById('modal-title').innerText = lang.modalTitle;

    const headers = document.querySelectorAll('.course-header div');
    if (headers.length > 0) {
        lang.header.forEach((text, i) => headers[i].innerText = text);
    }
    
    document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    populateDatalist(); 
    renderSavedSemesters();
}

addCourseBtn.addEventListener('click', () => {
    if (courses.length >= maxCoursesAllowed) {
        alert(currentLang === 'en' ? `Limit is ${maxCoursesAllowed} courses.` : `الحد الأقصى هو ${maxCoursesAllowed} مواد.`);
        return;
    }

    const subject = subjectInput.value.trim();
    if (!subject) {
        alert(currentLang === 'en' ? "Please enter subject name!" : "يرجى إدخال اسم المادة!");
        return;
    }

    const predefinedCourse = predefinedCourses.find(c => c.en === subject || c.ar === subject);
    let courseCredits = 3; 
    
    if (predefinedCourse) {
        courseCredits = predefinedCourse.credits; 
    } else if (subject.toUpperCase().includes('H')) {
        courseCredits = 2; 
    }

    courses.push({ subject, grade: gradeSelect.value, credits: courseCredits });
    updateUI();
    subjectInput.value = '';
    subjectInput.focus();
});

function deleteCourse(index) {
    courses.splice(index, 1);
    updateUI();
}

function updateUI() {
    renderCourses();
    calculateGPA();
}

function renderCourses() {
    coursesList.innerHTML = ''; 
    courses.forEach((course, index) => {
        const row = document.createElement('div');
        row.className = 'course-row'; 
        row.innerHTML = `
            <div style="flex:1;">${course.subject}</div>
            <div style="flex:1;">${course.grade}</div>
            <div style="flex:1;">${course.credits} ${currentLang === 'en' ? 'h' : 'ساعة'}</div>
            <div style="flex:0.5;"><button onclick="deleteCourse(${index})" class="delete-btn">X</button></div>
        `;
        coursesList.appendChild(row);
    });
}

function calculateGPA() {
    let allCourses = [];
    courses.forEach(c => allCourses.push({ ...c }));

    savedSemesters.forEach(sem => {
        if (sem.isChecked) {
            sem.courseDetails.forEach(c => allCourses.push({ ...c }));
        }
    });

    let uniqueCourses = {};
    allCourses.forEach(course => {
        let normalizedName = course.subject.trim().toLowerCase();
        let points = gradePoints[course.grade] || 0;
        uniqueCourses[normalizedName] = { ...course, points };
    });

    let totalPoints = 0, totalHours = 0;
    Object.values(uniqueCourses).forEach(c => {
        totalPoints += c.points * c.credits;
        totalHours += c.credits;
    });

    gpaDisplay.innerText = totalHours > 0 ? (totalPoints / totalHours).toFixed(2) : "0.00";
}

function saveAndClearSemester() {
    if (courses.length === 0) {
        alert(currentLang === 'en' ? "No courses to save!" : "لا توجد مواد لحفظها!");
        return;
    }

    let semPoints = 0, semHours = 0;
    courses.forEach(c => {
        semPoints += (gradePoints[c.grade] || 0) * c.credits;
        semHours += c.credits;
    });

    const semGPA = (semPoints / semHours).toFixed(2);
    maxCoursesAllowed = parseFloat(semGPA) >= 3.0 ? 7 : 6;

    const semesterData = {
        id: editingIndex !== null ? savedSemesters[editingIndex].id : Date.now(),
        name: currentEditingName || (currentLang === 'en' ? `Semester ${savedSemesters.length + 1}` : `الترم ${savedSemesters.length + 1}`),
        totalPoints: semPoints,
        totalHours: semHours,
        gpa: semGPA,
        isChecked: true,
        courseDetails: [...courses]
    };

    if (editingIndex !== null) {
        savedSemesters[editingIndex] = semesterData; 
        editingIndex = null;
    } else {
        savedSemesters.push(semesterData); 
    }

    courses = [];
    currentEditingName = null;
    saveToLocal();
    updateUI();
    renderSavedSemesters();
}

function renderSavedSemesters() {
    semestersList.innerHTML = '';
    savedSemestersBox.style.display = savedSemesters.length > 0 ? 'block' : 'none';

    let runningUniqueCourses = {};

    savedSemesters.forEach((sem, index) => {
        let semCGPA = "0.00";

        if (sem.isChecked) {
            sem.courseDetails.forEach(course => {
                let normalizedName = course.subject.trim().toLowerCase();
                let points = gradePoints[course.grade] || 0;
                runningUniqueCourses[normalizedName] = { ...course, points };
            });

            let runningPoints = 0, runningHours = 0;
            Object.values(runningUniqueCourses).forEach(c => {
                runningPoints += c.points * c.credits;
                runningHours += c.credits;
            });

            semCGPA = runningHours > 0 ? (runningPoints / runningHours).toFixed(2) : "0.00";
        } else {
            semCGPA = "-";
        }

        const div = document.createElement('div');
        div.className = 'semester-card';
        div.innerHTML = `
            <div class="semester-info" style="margin-bottom: 10px;">
                <input type="checkbox" id="sem-${sem.id}" ${sem.isChecked ? 'checked' : ''} onchange="toggleSemester(${index})">
                <label for="sem-${sem.id}" style="font-weight: bold; font-size: 16px;">${sem.name}</label>
            </div>
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 15px; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 8px;">
                <span class="semester-gpa" style="font-size: 14px;">${i18n[currentLang].termGpa} <strong>${sem.gpa}</strong></span>
                <span class="semester-cgpa" style="font-size: 14px; color: #07ffb5; font-weight: bold;">| ${i18n[currentLang].cgpa} ${semCGPA}</span>
                <div style="margin-left: auto; display: flex; gap: 5px;">
                    <button onclick="editSemester(${index})" class="btn-edit-sem">${currentLang === 'en' ? 'Edit' : 'تعديل'}</button>
                    <button onclick="deleteSemester(${index})" class="btn-delete-sem" style="background: #ff4d4d; color: white;">${currentLang === 'en' ? 'Delete' : 'حذف'}</button>
                </div>
            </div>
        `;
        semestersList.appendChild(div);
    });
}

function toggleSemester(index) {
    savedSemesters[index].isChecked = !savedSemesters[index].isChecked;
    saveToLocal();
    calculateGPA(); 
    renderSavedSemesters(); 
}

function deleteSemester(index) {
    if (confirm(currentLang === 'en' ? "Delete this semester?" : "هل تريد حذف هذا الترم؟")) {
        savedSemesters.splice(index, 1);
        saveToLocal();
        renderSavedSemesters();
        calculateGPA();
    }
}

function editSemester(index) {
    if (courses.length > 0 && !confirm(currentLang === 'en' ? "Unsaved changes will be lost. Continue?" : "لديك تعديلات غير محفوظة، هل تريد تجاهلها؟")) return;

    const sem = savedSemesters[index];
    courses = [...sem.courseDetails];
    currentEditingName = sem.name; 
    editingIndex = index; 
    maxCoursesAllowed = courses.length > 6 ? 7 : 6;

    updateUI();
    renderSavedSemesters();
}

function resetCalculator() {
    if (!confirm(currentLang === 'en' ? "Are you sure you want to delete all data and start over?" : "هل أنت متأكد من مسح جميع البيانات والبدء من جديد؟")) return;

    courses = [];
    savedSemesters = [];
    currentEditingName = null;
    editingIndex = null;
    maxCoursesAllowed = 6;

    document.getElementById('student-name').value = '';
    document.getElementById('student-id').value = '';

    saveToLocal();
    updateUI();
    renderSavedSemesters();
}

// === 4. Firebase Operations per Advisor ===

function getAdvisorStudentsRef() {
    if (!currentAdvisor) return null;
    // حفظ الطلاب في مسار خاص بالمرشد الحالى
    return db.collection("advisors").doc(currentAdvisor.uid).collection("students");
}

function saveStudentRecordCloud() {
    const studentsRef = getAdvisorStudentsRef();
    if (!studentsRef) return;

    const name = document.getElementById('student-name').value.trim();
    const studentId = document.getElementById('student-id').value.trim();

    if (!name || !studentId) {
        alert(currentLang === 'en' ? "Please enter Student Name and ID!" : "برجاء إدخال اسم الطالب وكوده!");
        return;
    }

    if (savedSemesters.length === 0 && courses.length === 0) {
        alert(currentLang === 'en' ? "No semesters or courses to save!" : "لا توجد ترمات أو مواد لحفظها!");
        return;
    }

    const currentCGPA = document.getElementById('gpa-display').innerText;

    const studentRecord = {
        id: studentId,
        name: name,
        cgpa: currentCGPA,
        semesters: savedSemesters,
        currentCourses: courses,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    studentsRef.doc(studentId).set(studentRecord)
    .then(() => {
        alert(currentLang === 'en' ? "Saved to your private Cloud! ☁️🎉" : "تم الحفظ في مجلدك السحابي بنجاح! ☁️🎉");
        updateStudentsCount();
    })
    .catch((error) => {
        console.error("Firebase Error: ", error);
        alert("Error saving record!");
    });
}

function toggleStudentsListModal() {
    const modal = document.getElementById('students-modal');
    const isVisible = modal.style.display === 'flex';
    modal.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) renderStudentsListCloud();
}

function renderStudentsListCloud() {
    const studentsRef = getAdvisorStudentsRef();
    const listContainer = document.getElementById('students-records-list');
    
    if (!studentsRef) return;

    listContainer.innerHTML = `<p style="text-align:center;">${currentLang === 'en' ? 'Loading your students...' : 'جاري تحميل طلابك...'}</p>`;

    studentsRef.get().then((querySnapshot) => {
        listContainer.innerHTML = '';

        if (querySnapshot.empty) {
            listContainer.innerHTML = `<p style="text-align:center; color:#888;">${currentLang === 'en' ? 'No saved students found in your account.' : 'لا يوجد طلاب محفوظين في حسابك.'}</p>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const item = document.createElement('div');
            item.style.cssText = "background: #f8f9fa; border: 1px solid #ddd; padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;";
            
            const studentJSON = JSON.stringify(student).replace(/'/g, "&apos;");

            item.innerHTML = `
                <div>
                    <strong style="color:#2c3e50; font-size:15px;">${student.name}</strong> 
                    <span style="font-size:12px; color:#7f8c8d;">(#${student.id})</span>
                    <div style="font-size:13px; color:#00b894; margin-top:3px;">CGPA: <strong>${student.cgpa}</strong></div>
                </div>
                <div style="display:flex; gap:5px;">
                    <button onclick='loadStudentDataCloud(${studentJSON})' style="background:#0984e3; color:white; width:auto; padding:6px 12px; font-size:12px; margin:0;">${currentLang === 'en' ? 'Load' : 'فتح'}</button>
                    <button onclick="deleteStudentRecordCloud('${student.id}')" style="background:#ff4d4d; color:white; width:auto; padding:6px 12px; font-size:12px; margin:0;">${currentLang === 'en' ? 'Delete' : 'حذف'}</button>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }).catch(err => {
        console.error(err);
        listContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading data.</p>';
    });
}

function loadStudentDataCloud(student) {
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-id').value = student.id;

    savedSemesters = [...student.semesters];
    courses = [...(student.currentCourses || [])];

    saveToLocal();
    updateUI();
    renderSavedSemesters();
    toggleStudentsListModal();
}

function deleteStudentRecordCloud(studentId) {
    const studentsRef = getAdvisorStudentsRef();
    if (!studentsRef) return;

    if (confirm(currentLang === 'en' ? "Delete this student?" : "هل تريد حذف هذا الطالب؟")) {
        studentsRef.doc(studentId).delete().then(() => {
            renderStudentsListCloud();
            updateStudentsCount();
        });
    }
}

function updateStudentsCount() {
    const studentsRef = getAdvisorStudentsRef();
    if (!studentsRef) return;

    studentsRef.get().then((snapshot) => {
        const badge = document.getElementById('students-count');
        if (badge) badge.innerText = snapshot.size;
    });
}

// Initial Run
populateDatalist();
renderSavedSemesters();
updateUI();