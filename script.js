/**
 * EduTrack - Student Management System
 * Core Controller: CRUD, In-Memory State & Browser localStorage Integration
 * 
 * Features:
 * 1. Read & Validate form inputs (ID, Full Name, Email, Phone, Course).
 * 2. Case-insensitive duplicate Student ID prevention (with self-exclusion during edit).
 * 3. Fully working "Edit" button: populates form, switches to edit mode, updates record.
 * 4. Fully working "Delete" button: accessible confirmation modal dialog with permanent removal.
 * 5. Robust browser localStorage persistence with JSON.stringify, JSON.parse, and error handling.
 * 6. Live search filtering across all record fields with clear button and empty states.
 * 7. Live metric counter synchronization ("Total Enrolled Students").
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 1. Constants & Storage Configuration
  // ---------------------------------------------------------------------------
  const STORAGE_KEY = 'edutrack_students_data';
  const INITIALIZED_KEY = 'edutrack_has_seeded';

  // Realistic seed data loaded on very first visit to demonstrate active records
  const SEED_STUDENTS = [
    {
      key: 'stu_seed_001',
      id: 'STU-2024-001',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@university.edu',
      phone: '5551234567',
      course: 'Computer Science'
    },
    {
      key: 'stu_seed_002',
      id: 'STU-2024-002',
      name: 'Marcus Sterling',
      email: 'marcus.s@university.edu',
      phone: '5559876543',
      course: 'Software Engineering'
    },
    {
      key: 'stu_seed_003',
      id: 'STU-2024-003',
      name: 'Sophia Chen',
      email: 'sophia.chen@university.edu',
      phone: '5554567890',
      course: 'Data Science'
    }
  ];

  // ---------------------------------------------------------------------------
  // 2. localStorage Helpers with Comprehensive Error Handling
  // ---------------------------------------------------------------------------

  /**
   * Loads saved students from browser localStorage.
   * If the user is visiting for the first time, initializes with seed records.
   * Uses try...catch and validates parsed data type to prevent crash on corrupted JSON.
   */
  function loadStudentsFromStorage() {
    try {
      const hasSeeded = localStorage.getItem(INITIALIZED_KEY);

      if (!hasSeeded) {
        // First-time visit: seed initial records and mark as initialized
        localStorage.setItem(INITIALIZED_KEY, 'true');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_STUDENTS));
        return [...SEED_STUDENTS];
      }

      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) {
        return [];
      }

      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        return parsed;
      }

      console.warn('EduTrack: Parsed localStorage data was not an array. Resetting.');
      return [];
    } catch (error) {
      console.error('EduTrack: Error reading from localStorage:', error);
      // Fallback gracefully to in-memory seed records if localStorage is unavailable
      return [...SEED_STUDENTS];
    }
  }

  /**
   * Saves the current students array to browser localStorage using JSON.stringify.
   * Wrapped in try...catch to handle QuotaExceededError or disabled storage.
   */
  function saveStudentsToStorage() {
    try {
      const serialized = JSON.stringify(students);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('EduTrack: Failed to save records to localStorage:', error);
      showBanner('Warning: Unable to save changes to browser storage (storage may be full or disabled).', 'danger');
    }
  }

  // Primary in-memory store, initialized from localStorage
  let students = loadStudentsFromStorage();

  // Active interaction states
  let editingStudentKey = null; // Holds key of student currently being edited, or null
  let studentKeyToDelete = null; // Holds key of student queued for deletion in modal
  let currentSearchQuery = '';   // Normalized search filter query

  // ---------------------------------------------------------------------------
  // 3. DOM Elements Cache
  // ---------------------------------------------------------------------------
  // Form elements
  const studentForm = document.getElementById('student-form');
  const formCard = document.querySelector('.form-card');
  const formHeading = document.getElementById('form-heading');
  const formSubtitle = document.getElementById('form-subtitle');
  const studentIdInput = document.getElementById('student-id');
  const studentNameInput = document.getElementById('student-name');
  const studentEmailInput = document.getElementById('student-email');
  const studentPhoneInput = document.getElementById('student-phone');
  const studentCourseSelect = document.getElementById('student-course');
  const editIndexInput = document.getElementById('edit-index');
  const btnSubmitStudent = document.getElementById('btn-submit-student');
  const submitBtnText = document.getElementById('submit-btn-text');
  const resetBtn = document.getElementById('btn-reset-form');
  const cancelEditBtn = document.getElementById('btn-cancel-edit');

  // Table and metric elements
  const tableBody = document.getElementById('student-table-body');
  const totalStudentsCount = document.getElementById('total-students-count');
  const tableStatusCount = document.getElementById('table-status-count');
  const emptyState = document.getElementById('empty-state');
  const emptyStateTitle = document.getElementById('empty-state-title');
  const emptyStateDesc = document.getElementById('empty-state-desc');
  const emptyStateAction = document.getElementById('empty-state-action');

  // Search input controls
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');

  // Status notification banner
  const statusBanner = document.getElementById('status-banner');
  const bannerMessage = document.getElementById('banner-message');
  const bannerCloseBtn = document.getElementById('banner-close-btn');
  let bannerTimeout = null;

  // Delete Confirmation Modal elements
  const deleteModal = document.getElementById('delete-modal');
  const modalMessage = document.getElementById('modal-message');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalConfirmDeleteBtn = document.getElementById('modal-confirm-delete-btn');

  // ---------------------------------------------------------------------------
  // 4. Helper Functions
  // ---------------------------------------------------------------------------

  /**
   * Generates a collision-free unique internal key for newly created student records.
   */
  function generateUniqueKey() {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    return `stu_${timestamp}_${randomSuffix}`;
  }

  /**
   * Escapes HTML special characters to prevent Cross-Site Scripting (XSS).
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Returns distinct CSS styling classes for course pill tags.
   */
  function getCourseBadgeClass(course) {
    switch (course) {
      case 'Computer Science':
        return 'course-cs';
      case 'Software Engineering':
        return 'course-se';
      case 'Data Science':
        return 'course-ds';
      case 'Information Technology':
        return 'course-it';
      case 'Business Administration':
        return 'course-ba';
      default:
        return 'course-cs';
    }
  }

  /**
   * Displays the top notification banner with automatic auto-dismiss.
   */
  function showBanner(message, type = 'success') {
    if (bannerTimeout) clearTimeout(bannerTimeout);

    statusBanner.className = `status-banner banner-${type}`;
    bannerMessage.textContent = message;
    statusBanner.classList.remove('hidden');

    bannerTimeout = setTimeout(() => {
      statusBanner.classList.add('hidden');
    }, 4500);
  }

  bannerCloseBtn.addEventListener('click', () => {
    statusBanner.classList.add('hidden');
    if (bannerTimeout) clearTimeout(bannerTimeout);
  });

  /**
   * Clears inline error highlights and validation messages from form inputs.
   */
  function clearErrors() {
    const errorContainers = document.querySelectorAll('.field-error');
    errorContainers.forEach(container => {
      container.textContent = '';
    });

    const inputs = studentForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.classList.remove('is-invalid');
    });
  }

  /**
   * Sets an error state and message on a specific input field.
   */
  function setFieldError(inputElement, errorElementId, message) {
    inputElement.classList.add('is-invalid');
    const errorContainer = document.getElementById(errorElementId);
    if (errorContainer) {
      errorContainer.textContent = message;
    }
  }

  // Clear a field's error styling dynamically as the user corrects their input
  [studentIdInput, studentNameInput, studentEmailInput, studentPhoneInput, studentCourseSelect].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const errorDiv = input.closest('.form-group')?.querySelector('.field-error');
      if (errorDiv) errorDiv.textContent = '';
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Form Validation
  // ---------------------------------------------------------------------------

  /**
   * Validates all form fields according to validation rules:
   * - Required fields cannot be empty.
   * - Student ID must be unique (case-insensitively), excluding current record during edit.
   * - Valid email format.
   * - Exactly 10 numeric digits for phone number.
   * - Course dropdown must be chosen.
   */
  function validateForm() {
    clearErrors();
    let isValid = true;

    const idValue = studentIdInput.value.trim();
    const nameValue = studentNameInput.value.trim();
    const emailValue = studentEmailInput.value.trim();
    const phoneValue = studentPhoneInput.value.trim();
    const courseValue = studentCourseSelect.value;

    // 1. Validate Student ID
    if (!idValue) {
      setFieldError(studentIdInput, 'student-id-error', 'Student ID is required.');
      isValid = false;
    } else {
      // Check for duplicate Student ID (case-insensitive), excluding the record currently being edited
      const isDuplicate = students.some(student => {
        if (editingStudentKey && student.key === editingStudentKey) {
          return false; // Skip self check during edit mode
        }
        return student.id.trim().toLowerCase() === idValue.toLowerCase();
      });

      if (isDuplicate) {
        setFieldError(
          studentIdInput,
          'student-id-error',
          'This Student ID is already registered to another student (IDs are case-insensitive).'
        );
        isValid = false;
      }
    }

    // 2. Validate Full Name
    if (!nameValue) {
      setFieldError(studentNameInput, 'student-name-error', 'Full Name is required.');
      isValid = false;
    }

    // 3. Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setFieldError(studentEmailInput, 'student-email-error', 'Email Address is required.');
      isValid = false;
    } else if (!emailPattern.test(emailValue)) {
      setFieldError(studentEmailInput, 'student-email-error', 'Please enter a valid email address (e.g. name@university.edu).');
      isValid = false;
    }

    // 4. Validate Phone Number (Exactly 10 numeric digits)
    const phoneDigits = phoneValue.replace(/\D/g, '');
    const containsLetters = /[a-zA-Z]/.test(phoneValue);

    if (!phoneValue) {
      setFieldError(studentPhoneInput, 'student-phone-error', 'Phone Number is required.');
      isValid = false;
    } else if (containsLetters || phoneDigits.length !== 10) {
      setFieldError(
        studentPhoneInput,
        'student-phone-error',
        'Phone Number must contain exactly 10 numeric digits.'
      );
      isValid = false;
    }

    // 5. Validate Course
    if (!courseValue) {
      setFieldError(studentCourseSelect, 'student-course-error', 'Please select an enrolled course.');
      isValid = false;
    }

    return isValid;
  }

  // ---------------------------------------------------------------------------
  // 6. Table & Metrics Rendering
  // ---------------------------------------------------------------------------

  /**
   * Refreshes the students table, metric card counters, and empty state display.
   * Takes active search filter and edit highlights into account.
   */
  function renderTable() {
    // Synchronize total enrolled students count
    totalStudentsCount.textContent = students.length;

    // Filter students by current search query if present
    const filteredStudents = currentSearchQuery
      ? students.filter(student => {
          const query = currentSearchQuery;
          return (
            student.id.toLowerCase().includes(query) ||
            student.name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query) ||
            student.course.toLowerCase().includes(query) ||
            student.phone.includes(query)
          );
        })
      : students;

    // Clear existing table rows
    tableBody.innerHTML = '';

    // Scenario A: No students exist at all
    if (students.length === 0) {
      emptyState.classList.remove('hidden');
      emptyStateTitle.textContent = 'No Students Registered Yet';
      emptyStateDesc.textContent = 'Fill in the form on the left and click "Add Student" to register your first record.';
      emptyStateAction.textContent = 'Focus on Form';
      emptyStateAction.onclick = () => studentIdInput.focus();
      tableStatusCount.textContent = 'Showing 0 records';
      return;
    }

    // Scenario B: Students exist, but current search query matches 0 records
    if (filteredStudents.length === 0) {
      emptyState.classList.remove('hidden');
      emptyStateTitle.textContent = 'No Matching Students Found';
      emptyStateDesc.textContent = `No records matched your search "${escapeHtml(searchInput.value)}". Check your query or clear the filter.`;
      emptyStateAction.textContent = 'Clear Search Filter';
      emptyStateAction.onclick = () => {
        searchInput.value = '';
        currentSearchQuery = '';
        searchClearBtn.classList.add('hidden');
        renderTable();
        searchInput.focus();
      };
      tableStatusCount.textContent = `0 of ${students.length} records matching`;
      return;
    }

    // Scenario C: Render matching student rows
    emptyState.classList.add('hidden');

    if (currentSearchQuery) {
      tableStatusCount.textContent = `Showing ${filteredStudents.length} of ${students.length} records`;
    } else {
      tableStatusCount.textContent = `Showing ${students.length} ${students.length === 1 ? 'record' : 'records'}`;
    }

    filteredStudents.forEach(student => {
      const row = document.createElement('tr');
      row.setAttribute('data-internal-key', student.key);

      // Highlight row if currently being edited
      if (editingStudentKey === student.key) {
        row.classList.add('tr-editing');
      }

      row.innerHTML = `
        <td><span class="student-id-cell">${escapeHtml(student.id)}</span></td>
        <td>
          <div class="student-name-cell">
            <span>${escapeHtml(student.name)}</span>
          </div>
        </td>
        <td>
          <a href="mailto:${escapeHtml(student.email)}" class="student-email-link">
            ${escapeHtml(student.email)}
          </a>
        </td>
        <td>
          <span class="student-phone-cell">${escapeHtml(student.phone)}</span>
        </td>
        <td>
          <span class="course-pill ${getCourseBadgeClass(student.course)}">
            ${escapeHtml(student.course)}
          </span>
        </td>
        <td class="td-actions">
          <div class="action-buttons">
            <button 
              type="button" 
              class="action-btn btn-edit" 
              data-key="${escapeHtml(student.key)}"
              aria-label="Edit student ${escapeHtml(student.name)}"
              title="Edit record"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span>Edit</span>
            </button>
            <button 
              type="button" 
              class="action-btn btn-delete" 
              data-key="${escapeHtml(student.key)}"
              aria-label="Delete student ${escapeHtml(student.name)}"
              title="Delete record"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Edit Flow Implementation
  // ---------------------------------------------------------------------------

  /**
   * Initiates edit mode for a student record:
   * - Loads record details into form inputs.
   * - Updates form title, subtitle, and submit button text.
   * - Shows Cancel button and highlights the table row.
   */
  function startEditStudent(studentKey) {
    const student = students.find(s => s.key === studentKey);
    if (!student) return;

    editingStudentKey = studentKey;
    editIndexInput.value = studentKey;

    // Populate form fields
    studentIdInput.value = student.id;
    studentNameInput.value = student.name;
    studentEmailInput.value = student.email;
    studentPhoneInput.value = student.phone;
    studentCourseSelect.value = student.course;

    clearErrors();

    // Update Form UI to Edit Mode
    formHeading.textContent = 'Edit Student Record';
    formSubtitle.textContent = `Updating details for ${student.name} (${student.id})`;
    submitBtnText.textContent = 'Update Student';
    cancelEditBtn.classList.remove('hidden');
    formCard.classList.add('is-editing');

    // Re-render table so the active row is highlighted
    renderTable();

    // Focus on the first editable field and scroll form smoothly
    studentNameInput.focus();
    formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    showBanner(`Now editing student "${student.name}". Update the fields and click "Update Student".`, 'info');
  }

  /**
   * Cancels edit mode and resets form back to default Add mode.
   */
  function cancelEditing(showMessage = true) {
    editingStudentKey = null;
    editIndexInput.value = '-1';

    // Reset Form UI to Add Mode
    formHeading.textContent = 'Add New Student';
    formSubtitle.textContent = 'Fill in the student details to register';
    submitBtnText.textContent = 'Add Student';
    cancelEditBtn.classList.add('hidden');
    formCard.classList.remove('is-editing');

    // Reset inputs and error styles
    studentForm.reset();
    clearErrors();

    // Refresh table to clear row highlight
    renderTable();

    if (showMessage) {
      showBanner('Edit operation was cancelled.', 'info');
    }
  }

  // Cancel edit button click
  cancelEditBtn.addEventListener('click', () => {
    cancelEditing(true);
  });

  // ---------------------------------------------------------------------------
  // 8. Delete Flow Implementation (Accessible Confirmation Modal)
  // ---------------------------------------------------------------------------

  /**
   * Opens the delete confirmation modal dialog for a selected student.
   */
  function openDeleteModal(studentKey) {
    const student = students.find(s => s.key === studentKey);
    if (!student) return;

    studentKeyToDelete = studentKey;
    modalMessage.innerHTML = `Are you sure you want to delete student <strong>${escapeHtml(student.name)}</strong> (ID: <code>${escapeHtml(student.id)}</code>)? This action cannot be undone.`;
    deleteModal.classList.remove('hidden');
    modalCancelBtn.focus();
  }

  /**
   * Closes the delete confirmation modal.
   */
  function closeDeleteModal() {
    studentKeyToDelete = null;
    deleteModal.classList.add('hidden');
  }

  modalCancelBtn.addEventListener('click', closeDeleteModal);
  modalCloseBtn.addEventListener('click', closeDeleteModal);

  // Close modal when clicking backdrop outside modal card
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Close modal when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !deleteModal.classList.contains('hidden')) {
      closeDeleteModal();
    }
  });

  // Confirm delete button click
  modalConfirmDeleteBtn.addEventListener('click', () => {
    if (!studentKeyToDelete) return;

    const studentIndex = students.findIndex(s => s.key === studentKeyToDelete);
    if (studentIndex !== -1) {
      const deletedStudent = students[studentIndex];

      // If the student currently being deleted is actively open in edit mode, exit edit mode
      if (editingStudentKey === studentKeyToDelete) {
        cancelEditing(false);
      }

      // Remove from array and persist to localStorage
      students.splice(studentIndex, 1);
      saveStudentsToStorage();

      closeDeleteModal();
      renderTable();
      showBanner(`Student "${deletedStudent.name}" (${deletedStudent.id}) was permanently deleted.`, 'danger');
    } else {
      closeDeleteModal();
    }
  });

  // ---------------------------------------------------------------------------
  // 9. Table Row Event Delegation (Edit & Delete Button Clicks)
  // ---------------------------------------------------------------------------

  tableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      const studentKey = editBtn.getAttribute('data-key');
      startEditStudent(studentKey);
    } else if (deleteBtn) {
      const studentKey = deleteBtn.getAttribute('data-key');
      openDeleteModal(studentKey);
    }
  });

  // ---------------------------------------------------------------------------
  // 10. Form Submission (Add or Update)
  // ---------------------------------------------------------------------------

  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showBanner('Please correct the highlighted form errors before proceeding.', 'danger');
      return;
    }

    const idValue = studentIdInput.value.trim();
    const nameValue = studentNameInput.value.trim();
    const emailValue = studentEmailInput.value.trim();
    const phoneValue = studentPhoneInput.value.trim();
    const courseValue = studentCourseSelect.value;

    if (editingStudentKey) {
      // ---------------- Update Existing Student ----------------
      const studentIndex = students.findIndex(s => s.key === editingStudentKey);
      if (studentIndex !== -1) {
        students[studentIndex] = {
          ...students[studentIndex],
          id: idValue,
          name: nameValue,
          email: emailValue,
          phone: phoneValue,
          course: courseValue
        };

        // Persist updated records to localStorage
        saveStudentsToStorage();

        const updatedName = nameValue;
        const updatedId = idValue;

        // Reset edit mode and restore form
        cancelEditing(false);
        renderTable();
        showBanner(`Student "${updatedName}" (${updatedId}) was successfully updated!`, 'success');
        studentIdInput.focus();
      }
    } else {
      // ---------------- Add New Student ----------------
      const newStudent = {
        key: generateUniqueKey(),
        id: idValue,
        name: nameValue,
        email: emailValue,
        phone: phoneValue,
        course: courseValue
      };

      students.push(newStudent);

      // Persist to localStorage
      saveStudentsToStorage();

      // Reset form and refresh table
      studentForm.reset();
      clearErrors();
      renderTable();
      showBanner(`Student "${newStudent.name}" (${newStudent.id}) was successfully added!`, 'success');
      studentIdInput.focus();
    }
  });

  // ---------------------------------------------------------------------------
  // 11. Form Reset Button
  // ---------------------------------------------------------------------------

  resetBtn.addEventListener('click', () => {
    if (editingStudentKey) {
      cancelEditing(true);
    } else {
      studentForm.reset();
      clearErrors();
      showBanner('Form fields have been reset.', 'info');
    }
  });

  // ---------------------------------------------------------------------------
  // 12. Live Search Filter & Clear Button
  // ---------------------------------------------------------------------------

  searchInput.addEventListener('input', () => {
    currentSearchQuery = searchInput.value.trim().toLowerCase();

    if (currentSearchQuery.length > 0) {
      searchClearBtn.classList.remove('hidden');
    } else {
      searchClearBtn.classList.add('hidden');
    }

    renderTable();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    searchClearBtn.classList.add('hidden');
    renderTable();
    searchInput.focus();
  });

  // ---------------------------------------------------------------------------
  // 13. Initial Render
  // ---------------------------------------------------------------------------
  // Render records from localStorage (or seed records) on startup
  renderTable();
});
