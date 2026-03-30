document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const addComponentBtn = document.getElementById('add-component');
    const gradeComponents = document.getElementById('grade-components');
    const calculateGradeBtn = document.getElementById('calculate-grade');
    const currentGradeDisplay = document.getElementById('current-grade');
    const letterGradeDisplay = document.getElementById('letter-grade');
    const totalWeightDisplay = document.getElementById('total-weight');
    const weightStatus = document.getElementById('weight-status');
    const courseNameInput = document.getElementById('course-name');
    const saveCourseBtn = document.getElementById('save-course');
    const savedCoursesList = document.getElementById('saved-courses-list');
    const finalGradeInput = document.getElementById('current-grade-input');
    const finalWeightInput = document.getElementById('final-weight');
    const desiredGradeInput = document.getElementById('desired-grade');
    const calculateFinalBtn = document.getElementById('calculate-final');
    const requiredFinalScore = document.getElementById('required-final-score');
    const requiredLetterGrade = document.getElementById('required-letter-grade');
    const gradeChartCtx = document.getElementById('grade-chart').getContext('2d');
    const addGpaCourseBtn = document.getElementById('add-gpa-course');
    const gpaCourses = document.getElementById('gpa-courses');
    const calculateGpaBtn = document.getElementById('calculate-gpa');
    const gpaResult = document.getElementById('gpa-result');
    const totalCredits = document.getElementById('total-credits');
    const gpaStatus = document.getElementById('gpa-status');
    const resetAllBtn = document.getElementById('reset-all');
    const exportDataBtn = document.getElementById('export-data');
    const importDataBtn = document.getElementById('import-data');
    
    let gradeChart = null;
    let savedCourses = JSON.parse(localStorage.getItem('savedCourses')) || [];
    
    // Initialize the app
    init();
    
    // Tab switching functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // If switching to final grade tab, update chart
            if (tabId === 'final-grade' && gradeChart) {
                updateGradeChart();
            }
        });
    });
    
    // Add grade component
    addComponentBtn.addEventListener('click', addGradeComponent);
    
    // Add GPA course
    addGpaCourseBtn.addEventListener('click', addGpaCourse);
    
    // Calculate current grade
    calculateGradeBtn.addEventListener('click', calculateCurrentGrade);
    
    // Save course
    saveCourseBtn.addEventListener('click', saveCourse);
    
    // Calculate required final score
    calculateFinalBtn.addEventListener('click', calculateRequiredFinalScore);
    
    // Calculate GPA
    calculateGpaBtn.addEventListener('click', calculateGPA);
    
    // Reset all data
    resetAllBtn.addEventListener('click', resetAllData);
    
    // Export data
    exportDataBtn.addEventListener('click', exportData);
    
    // Import data
    importDataBtn.addEventListener('click', importData);
    
    // Initialize the app
    function init() {
        // Add one empty component by default
        addGradeComponent();
        addGpaCourse();
        
        // Load saved courses
        renderSavedCourses();
        
        // Initialize chart
        initGradeChart();
    }
    
    // Add a new grade component
    function addGradeComponent() {
        const componentDiv = document.createElement('div');
        componentDiv.className = 'component';
        componentDiv.innerHTML = `
            <div class="form-group">
                <label>Component Name</label>
                <input type="text" class="component-name" placeholder="e.g. Midterm Exam">
            </div>
            <div class="form-group">
                <label>Grade (%)</label>
                <input type="number" class="component-grade" placeholder="85" min="0" max="100">
            </div>
            <div class="form-group">
                <label>Weight (%)</label>
                <input type="number" class="component-weight" placeholder="30" min="0" max="100">
            </div>
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        `;
        
        gradeComponents.appendChild(componentDiv);
        
        // Add event listener to remove button
        const removeBtn = componentDiv.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            componentDiv.remove();
            calculateTotalWeight();
        });
        
        // Add event listeners to inputs to calculate on change
        const gradeInput = componentDiv.querySelector('.component-grade');
        const weightInput = componentDiv.querySelector('.component-weight');
        
        gradeInput.addEventListener('input', calculateTotalWeight);
        weightInput.addEventListener('input', calculateTotalWeight);
    }
    
    // Add a new GPA course
    function addGpaCourse() {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'gpa-course';
        courseDiv.innerHTML = `
            <div class="form-group">
                <label>Course Name</label>
                <input type="text" class="gpa-course-name" placeholder="e.g. Mathematics">
            </div>
            <div class="form-group">
                <label>Credits</label>
                <input type="number" class="gpa-course-credits" placeholder="3" min="0" step="0.5">
            </div>
            <div class="form-group">
                <label>Grade</label>
                <select class="gpa-course-grade">
                    <option value="4.0">A (4.0)</option>
                    <option value="3.7">A- (3.7)</option>
                    <option value="3.3">B+ (3.3)</option>
                    <option value="3.0">B (3.0)</option>
                    <option value="2.7">B- (2.7)</option>
                    <option value="2.3">C+ (2.3)</option>
                    <option value="2.0">C (2.0)</option>
                    <option value="1.7">C- (1.7)</option>
                    <option value="1.3">D+ (1.3)</option>
                    <option value="1.0">D (1.0)</option>
                    <option value="0.0">F (0.0)</option>
                </select>
            </div>
            <button class="remove-btn"><i class="fas fa-times"></i></button>
        `;
        
        gpaCourses.appendChild(courseDiv);
        
        // Add event listener to remove button
        const removeBtn = courseDiv.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            courseDiv.remove();
        });
    }
    
    // Calculate total weight and current grade
    function calculateTotalWeight() {
        const components = document.querySelectorAll('.component');
        let totalWeight = 0;
        let weightedSum = 0;
        
        components.forEach(component => {
            const gradeInput = component.querySelector('.component-grade');
            const weightInput = component.querySelector('.component-weight');
            
            const grade = parseFloat(gradeInput.value) || 0;
            const weight = parseFloat(weightInput.value) || 0;
            
            totalWeight += weight;
            weightedSum += (grade * weight) / 100;
        });
        
        totalWeightDisplay.textContent = `${totalWeight}%`;
        
        if (totalWeight > 100) {
            weightStatus.textContent = '(Over 100%)';
            weightStatus.style.color = 'var(--danger-color)';
        } else if (totalWeight === 100) {
            weightStatus.textContent = '(Complete)';
            weightStatus.style.color = 'var(--success-color)';
        } else {
            weightStatus.textContent = '(Incomplete)';
            weightStatus.style.color = 'var(--warning-color)';
        }
        
        if (totalWeight > 0) {
            const currentGrade = weightedSum / (totalWeight / 100);
            currentGradeDisplay.textContent = currentGrade.toFixed(2);
            updateLetterGrade(currentGrade, letterGradeDisplay);
        } else {
            currentGradeDisplay.textContent = '--';
            letterGradeDisplay.textContent = '--';
            letterGradeDisplay.className = 'grade-letter';
        }
    }
    
    // Calculate current grade
    function calculateCurrentGrade() {
        calculateTotalWeight();
        
        const components = document.querySelectorAll('.component');
        let hasEmptyFields = false;
        
        components.forEach(component => {
            const nameInput = component.querySelector('.component-name');
            const gradeInput = component.querySelector('.component-grade');
            const weightInput = component.querySelector('.component-weight');
            
            if (!nameInput.value || !gradeInput.value || !weightInput.value) {
                hasEmptyFields = true;
            }
        });
        
        if (hasEmptyFields) {
            alert('Please fill in all component fields before calculating.');
            return;
        }
        
        // Show success message if calculation is complete
        const totalWeight = parseFloat(totalWeightDisplay.textContent);
        if (totalWeight === 100) {
            showToast('Grade calculated successfully!', 'success');
        }
    }
    
    // Update letter grade display
    function updateLetterGrade(grade, element) {
        let letterGrade = '';
        let gradeClass = '';
        
        if (grade >= 90) {
            letterGrade = 'A';
            gradeClass = 'grade-A';
        } else if (grade >= 80) {
            letterGrade = 'B';
            gradeClass = 'grade-B';
        } else if (grade >= 70) {
            letterGrade = 'C';
            gradeClass = 'grade-C';
        } else if (grade >= 60) {
            letterGrade = 'D';
            gradeClass = 'grade-D';
        } else {
            letterGrade = 'F';
            gradeClass = 'grade-F';
        }
        
        element.textContent = letterGrade;
        element.className = `grade-letter ${gradeClass}`;
    }
    
    // Save course to local storage
    function saveCourse() {
        const courseName = courseNameInput.value.trim();
        if (!courseName) {
            alert('Please enter a course name.');
            return;
        }
        
        const components = document.querySelectorAll('.component');
        if (components.length === 0) {
            alert('Please add at least one grade component.');
            return;
        }
        
        const courseData = {
            name: courseName,
            components: [],
            currentGrade: currentGradeDisplay.textContent,
            letterGrade: letterGradeDisplay.textContent,
            totalWeight: totalWeightDisplay.textContent
        };
        
        components.forEach(component => {
            const name = component.querySelector('.component-name').value.trim();
            const grade = component.querySelector('.component-grade').value;
            const weight = component.querySelector('.component-weight').value;
            
            if (name && grade && weight) {
                courseData.components.push({
                    name,
                    grade: parseFloat(grade),
                    weight: parseFloat(weight)
                });
            }
        });
        
        // Check if course already exists
        const existingIndex = savedCourses.findIndex(c => c.name === courseName);
        if (existingIndex >= 0) {
            savedCourses[existingIndex] = courseData;
        } else {
            savedCourses.push(courseData);
        }
        
        // Save to local storage
        localStorage.setItem('savedCourses', JSON.stringify(savedCourses));
        showToast('Course saved successfully!', 'success');
        renderSavedCourses();
    }
    
    // Render saved courses
    function renderSavedCourses() {
        savedCoursesList.innerHTML = '';
        
        if (savedCourses.length === 0) {
            savedCoursesList.innerHTML = '<p>No saved courses yet.</p>';
            return;
        }
        
        savedCourses.forEach((course, index) => {
            const courseItem = document.createElement('div');
            courseItem.className = 'saved-course-item';
            courseItem.innerHTML = `
                <div class="saved-course-name">${course.name}</div>
                <div class="saved-course-grade">${course.currentGrade}% (${course.letterGrade})</div>
                <div class="saved-course-actions">
                    <button class="load-btn" data-index="${index}"><i class="fas fa-upload"></i></button>
                    <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            savedCoursesList.appendChild(courseItem);
            
            // Add event listeners to buttons
            const loadBtn = courseItem.querySelector('.load-btn');
            const deleteBtn = courseItem.querySelector('.delete-btn');
            
            loadBtn.addEventListener('click', () => loadCourse(index));
            deleteBtn.addEventListener('click', () => deleteCourse(index));
        });
    }
    
    // Load a saved course
    function loadCourse(index) {
        const course = savedCourses[index];
        if (!course) return;
        
        // Clear current components
        gradeComponents.innerHTML = '';
        
        // Set course name
        courseNameInput.value = course.name;
        
        // Add components
        course.components.forEach(comp => {
            addGradeComponent();
            const components = document.querySelectorAll('.component');
            const lastComponent = components[components.length - 1];
            
            lastComponent.querySelector('.component-name').value = comp.name;
            lastComponent.querySelector('.component-grade').value = comp.grade;
            lastComponent.querySelector('.component-weight').value = comp.weight;
        });
        
        // Update displays
        currentGradeDisplay.textContent = course.currentGrade;
        letterGradeDisplay.textContent = course.letterGrade;
        totalWeightDisplay.textContent = course.totalWeight;
        
        // Update letter grade class
        const gradeValue = parseFloat(course.currentGrade);
        if (!isNaN(gradeValue)) {
            updateLetterGrade(gradeValue, letterGradeDisplay);
        }
        
        // Update weight status
        const totalWeight = parseFloat(course.totalWeight);
        if (totalWeight > 100) {
            weightStatus.textContent = '(Over 100%)';
            weightStatus.style.color = 'var(--danger-color)';
        } else if (totalWeight === 100) {
            weightStatus.textContent = '(Complete)';
            weightStatus.style.color = 'var(--success-color)';
        } else {
            weightStatus.textContent = '(Incomplete)';
            weightStatus.style.color = 'var(--warning-color)';
        }
        
        showToast('Course loaded successfully!', 'success');
    }
    
    // Delete a saved course
    function deleteCourse(index) {
        if (confirm('Are you sure you want to delete this course?')) {
            savedCourses.splice(index, 1);
            localStorage.setItem('savedCourses', JSON.stringify(savedCourses));
            renderSavedCourses();
            showToast('Course deleted successfully!', 'success');
        }
    }
    
    // Initialize grade chart
    function initGradeChart() {
        gradeChart = new Chart(gradeChartCtx, {
            type: 'bar',
            data: {
                labels: ['Current Grade', 'Required Final', 'Desired Grade'],
                datasets: [{
                    label: 'Grade Percentage',
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Grade (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update grade chart
    function updateGradeChart() {
        if (!gradeChart) return;
        
        const currentGrade = parseFloat(finalGradeInput.value) || 0;
        const finalWeight = parseFloat(finalWeightInput.value) || 0;
        const desiredGrade = parseFloat(desiredGradeInput.value) || 0;
        
        let requiredFinal = 0;
        if (finalWeight > 0) {
            requiredFinal = ((desiredGrade - (currentGrade * (100 - finalWeight) / 100)) / (finalWeight / 100));
            requiredFinal = Math.max(0, Math.min(100, requiredFinal));
        }
        
        gradeChart.data.datasets[0].data = [currentGrade, requiredFinal, desiredGrade];
        gradeChart.update();
    }
    
    // Calculate required final exam score
    function calculateRequiredFinalScore() {
        const currentGrade = parseFloat(finalGradeInput.value);
        const finalWeight = parseFloat(finalWeightInput.value);
        const desiredGrade = parseFloat(desiredGradeInput.value);
        
        if (isNaN(currentGrade) || isNaN(finalWeight) || isNaN(desiredGrade)) {
            alert('Please fill in all fields with valid numbers.');
            return;
        }
        
        if (finalWeight <= 0 || finalWeight > 100) {
            alert('Final exam weight must be between 0 and 100%.');
            return;
        }
        
        if (desiredGrade < 0 || desiredGrade > 100) {
            alert('Desired grade must be between 0 and 100%.');
            return;
        }
        
        // Calculate required final score
        const requiredFinal = ((desiredGrade - (currentGrade * (100 - finalWeight) / 100)) / (finalWeight / 100));
        
        // Cap at 0 and 100
        const cappedFinal = Math.max(0, Math.min(100, requiredFinal));
        
        requiredFinalScore.textContent = cappedFinal.toFixed(2);
        updateLetterGrade(cappedFinal, requiredLetterGrade);
        
        // Update chart
        updateGradeChart();
        
        // Show message based on how achievable the grade is
        if (requiredFinal > 100) {
            showToast('This grade is not achievable with the current scores.', 'warning');
        } else if (requiredFinal >= 90) {
            showToast('You need an excellent score on the final to reach your goal.', 'info');
        } else if (requiredFinal >= 80) {
            showToast('You need a good score on the final to reach your goal.', 'info');
        } else if (requiredFinal >= 70) {
            showToast('You need a decent score on the final to reach your goal.', 'info');
        } else if (requiredFinal >= 60) {
            showToast('You need a passing score on the final to reach your goal.', 'info');
        } else {
            showToast('Your goal is easily achievable with the current scores.', 'success');
        }
    }
    
    // Calculate GPA
    function calculateGPA() {
        const courses = document.querySelectorAll('.gpa-course');
        let totalQualityPoints = 0;
        let totalCreditsValue = 0;
        let hasEmptyFields = false;
        
        courses.forEach(course => {
            const name = course.querySelector('.gpa-course-name').value.trim();
            const creditsInput = course.querySelector('.gpa-course-credits');
            const gradeSelect = course.querySelector('.gpa-course-grade');
            
            const credits = parseFloat(creditsInput.value);
            const grade = parseFloat(gradeSelect.value);
            
            if (!name || isNaN(credits) || credits <= 0) {
                hasEmptyFields = true;
                return;
            }
            
            totalQualityPoints += credits * grade;
            totalCreditsValue += credits;
        });
        
        if (hasEmptyFields) {
            alert('Please fill in all course fields with valid values.');
            return;
        }
        
        if (totalCreditsValue === 0) {
            gpaResult.textContent = '--';
            totalCredits.textContent = '0';
            gpaStatus.textContent = '';
            return;
        }
        
        const gpa = totalQualityPoints / totalCreditsValue;
        gpaResult.textContent = gpa.toFixed(2);
        totalCredits.textContent = totalCreditsValue.toFixed(1);
        
        // Set GPA status
        if (gpa >= 3.5) {
            gpaStatus.textContent = 'Excellent';
            gpaStatus.style.color = 'var(--success-color)';
        } else if (gpa >= 3.0) {
            gpaStatus.textContent = 'Good';
            gpaStatus.style.color = 'var(--accent-color)';
        } else if (gpa >= 2.0) {
            gpaStatus.textContent = 'Average';
            gpaStatus.style.color = 'var(--warning-color)';
        } else {
            gpaStatus.textContent = 'Needs Improvement';
            gpaStatus.style.color = 'var(--danger-color)';
        }
        
        showToast('GPA calculated successfully!', 'success');
    }
    
    // Reset all data
    function resetAllData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            // Clear grade calculator
            gradeComponents.innerHTML = '';
            addGradeComponent();
            courseNameInput.value = '';
            currentGradeDisplay.textContent = '--';
            letterGradeDisplay.textContent = '--';
            letterGradeDisplay.className = 'grade-letter';
            totalWeightDisplay.textContent = '0%';
            weightStatus.textContent = '(Incomplete)';
            weightStatus.style.color = 'var(--warning-color)';
            
            // Clear final grade predictor
            finalGradeInput.value = '';
            finalWeightInput.value = '';
            desiredGradeInput.value = '';
            requiredFinalScore.textContent = '--';
            requiredLetterGrade.textContent = '--';
            requiredLetterGrade.className = 'grade-letter';
            if (gradeChart) {
                gradeChart.data.datasets[0].data = [0, 0, 0];
                gradeChart.update();
            }
            
            // Clear GPA calculator
            gpaCourses.innerHTML = '';
            addGpaCourse();
            gpaResult.textContent = '--';
            totalCredits.textContent = '0';
            gpaStatus.textContent = '';
            
            // Clear saved courses
            savedCourses = [];
            localStorage.removeItem('savedCourses');
            renderSavedCourses();
            
            showToast('All data has been reset.', 'success');
        }
    }
    
    // Export data
    function exportData() {
        const data = {
            savedCourses: savedCourses,
            gradeCalculator: {
                courseName: courseNameInput.value,
                components: []
            },
            finalGradePredictor: {
                currentGrade: finalGradeInput.value,
                finalWeight: finalWeightInput.value,
                desiredGrade: desiredGradeInput.value
            },
            gpaCalculator: {
                courses: []
            }
        };
        
        // Get grade calculator components
        document.querySelectorAll('.component').forEach(component => {
            const name = component.querySelector('.component-name').value;
            const grade = component.querySelector('.component-grade').value;
            const weight = component.querySelector('.component-weight').value;
            
            if (name && grade && weight) {
                data.gradeCalculator.components.push({ name, grade, weight });
            }
        });
        
        // Get GPA calculator courses
        document.querySelectorAll('.gpa-course').forEach(course => {
            const name = course.querySelector('.gpa-course-name').value;
            const credits = course.querySelector('.gpa-course-credits').value;
            const grade = course.querySelector('.gpa-course-grade').value;
            
            if (name && credits && grade) {
                data.gpaCalculator.courses.push({ name, credits, grade });
            }
        });
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grademaster-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully!', 'success');
    }
    
    // Import data
    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Import saved courses
                    if (data.savedCourses && Array.isArray(data.savedCourses)) {
                        savedCourses = data.savedCourses;
                        localStorage.setItem('savedCourses', JSON.stringify(savedCourses));
                        renderSavedCourses();
                    }
                    
                    // Import grade calculator
                    if (data.gradeCalculator) {
                        gradeComponents.innerHTML = '';
                        courseNameInput.value = data.gradeCalculator.courseName || '';
                        
                        if (data.gradeCalculator.components && Array.isArray(data.gradeCalculator.components)) {
                            data.gradeCalculator.components.forEach(comp => {
                                addGradeComponent();
                                const components = document.querySelectorAll('.component');
                                const lastComponent = components[components.length - 1];
                                
                                lastComponent.querySelector('.component-name').value = comp.name || '';
                                lastComponent.querySelector('.component-grade').value = comp.grade || '';
                                lastComponent.querySelector('.component-weight').value = comp.weight || '';
                            });
                        } else {
                            addGradeComponent();
                        }
                        
                        calculateTotalWeight();
                    }
                    
                    // Import final grade predictor
                    if (data.finalGradePredictor) {
                        finalGradeInput.value = data.finalGradePredictor.currentGrade || '';
                        finalWeightInput.value = data.finalGradePredictor.finalWeight || '';
                        desiredGradeInput.value = data.finalGradePredictor.desiredGrade || '';
                        
                        if (gradeChart) {
                            updateGradeChart();
                        }
                    }
                    
                    // Import GPA calculator
                    if (data.gpaCalculator) {
                        gpaCourses.innerHTML = '';
                        
                        if (data.gpaCalculator.courses && Array.isArray(data.gpaCalculator.courses)) {
                            data.gpaCalculator.courses.forEach(course => {
                                addGpaCourse();
                                const courses = document.querySelectorAll('.gpa-course');
                                const lastCourse = courses[courses.length - 1];
                                
                                lastCourse.querySelector('.gpa-course-name').value = course.name || '';
                                lastCourse.querySelector('.gpa-course-credits').value = course.credits || '';
                                lastCourse.querySelector('.gpa-course-grade').value = course.grade || '';
                            });
                        } else {
                            addGpaCourse();
                        }
                    }
                    
                    showToast('Data imported successfully!', 'success');
                } catch (error) {
                    console.error('Error importing data:', error);
                    showToast('Error importing data. File may be corrupted.', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Show toast notification
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Add toast styles dynamically
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            color: white;
            font-weight: 500;
            box-shadow: var(--box-shadow);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .toast-success {
            background-color: var(--success-color);
        }
        
        .toast-error {
            background-color: var(--danger-color);
        }
        
        .toast-warning {
            background-color: var(--warning-color);
        }
        
        .toast-info {
            background-color: var(--accent-color);
        }
    `;
    document.head.appendChild(toastStyles);
});